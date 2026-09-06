import torch
import numpy as np
import json
import joblib
from pathlib import Path
from typing import Dict, Optional, List
import logging

from models.flood_lstm import FloodLSTM
from models.xgboost_model import XGBoostCorrector
from models.pinn_gnn import PINN, FloodGNN, build_sensor_graph
from models.ensemble import EnsembleAggregator

logger = logging.getLogger(__name__)


class FloodPredictor:
    """
    End-to-end inference pipeline for flood prediction.
    
    Architecture (Layer 4: AI/ML Prediction Engine):
    - LSTM: Time-series temporal dynamics
    - XGBoost: Residual error correction
    - GNN: Spatial relationships between sensor locations
    - PINN: Physics-informed constraints
    - Ensemble: Weighted aggregation of all models
    
    Based on floodcast (sridipbasu/floodcast) + GNN/PINN extensions.
    """
    
    def __init__(self, deploy_dir: str, device: str = "cpu"):
        self.device = torch.device(device)
        self.deploy_dir = Path(deploy_dir)
        
        config_path = self.deploy_dir / "model_config.json"
        if config_path.exists():
            with open(config_path) as f:
                self.config = json.load(f)
        else:
            self.config = self._default_config()
        
        arch = self.config["architecture"]
        self.seq_len = arch["seq_len"]
        
        self.lstm = self._load_lstm(arch)
        self.xgb = self._load_xgboost()
        self.pinn = self._load_pinn(arch)
        self.gnn = self._load_gnn(arch)
        self.ensemble = EnsembleAggregator()
        
        self._load_scalers()
        
        self.dynamic_cols = self.config.get("dynamic_cols", [])
        self.flat_cols = self.config.get("flat_cols", [])
        
        self.sensor_locations: List[str] = []
        self.location_graphs: Dict[str, torch.Tensor] = {}
        
        logger.info(f"FloodPredictor ready on {device} with models: LSTM, XGBoost, GNN, PINN")
    
    def _default_config(self) -> Dict:
        return {
            "architecture": {
                "seq_len": 15,
                "input_size": 8,
                "hidden_size": 128,
                "num_layers": 2,
                "dropout": 0.2
            },
            "input_scalers": {
                "yj_transformer": {"raw_input_cols": []},
                "mm_scaler": {"applies_to": []},
                "feature_scaler": {"applies_to": []}
            },
            "dynamic_cols": [f"f{i}" for i in range(8)],
            "flat_cols": [f"f{i}" for i in range(8)],
            "sensor_features": [
                "water_level_m", "rainfall_mm", "soil_moisture_percent",
                "tilt_degrees", "temperature_c", "humidity_percent",
                "water_level_delta", "rainfall_delta"
            ]
        }
    
    def _load_lstm(self, arch: Dict) -> FloodLSTM:
        lstm = FloodLSTM(
            input_size=arch["input_size"],
            hidden_size=arch["hidden_size"],
            num_layers=arch["num_layers"],
            dropout=arch["dropout"]
        )
        lstm_path = self.deploy_dir / "best_flood_lstm.pt"
        if lstm_path.exists() and lstm_path.stat().st_size > 100:
            try:
                ckpt = torch.load(lstm_path, map_location=self.device, weights_only=False)
                state = {k.replace("module.", ""): v for k, v in ckpt["model_state"].items()}
                lstm.load_state_dict(state)
                logger.info("Loaded pre-trained LSTM model")
            except Exception as e:
                logger.warning(f"Failed to load LSTM weights: {e}. Using random init.")
        else:
            logger.info("Using randomly initialized LSTM (no pre-trained weights)")
        lstm.eval().to(self.device)
        return lstm
    
    def _load_xgboost(self) -> XGBoostCorrector:
        xgb = XGBoostCorrector()
        xgb_path = self.deploy_dir / "flood_xgb_corrector.json"
        if xgb_path.exists() and xgb_path.stat().st_size > 100:
            try:
                xgb.load(str(xgb_path))
                logger.info("Loaded pre-trained XGBoost model")
            except Exception as e:
                logger.warning(f"Failed to load XGBoost: {e}")
        else:
            logger.info("Using uninitialized XGBoost (no pre-trained weights)")
        return xgb
    
    def _load_pinn(self, arch: Dict) -> PINN:
        pinn = PINN(
            input_size=arch["input_size"],
            hidden_size=64,
            num_layers=4,
            dropout=0.1
        )
        pinn_path = self.deploy_dir / "pinn_model.pt"
        if pinn_path.exists() and pinn_path.stat().st_size > 100:
            try:
                pinn.load_state_dict(torch.load(pinn_path, map_location=self.device, weights_only=False))
                logger.info("Loaded pre-trained PINN model")
            except Exception as e:
                logger.warning(f"Failed to load PINN: {e}. Using random init.")
        else:
            logger.info("Using randomly initialized PINN")
        pinn.eval().to(self.device)
        return pinn
    
    def _load_gnn(self, arch: Dict) -> FloodGNN:
        gnn = FloodGNN(
            node_features=arch["input_size"],
            edge_features=4,
            hidden_size=64,
            num_heads=4,
            num_layers=3,
            dropout=0.1
        )
        gnn_path = self.deploy_dir / "gnn_model.pt"
        if gnn_path.exists() and gnn_path.stat().st_size > 100:
            try:
                gnn.load_state_dict(torch.load(gnn_path, map_location=self.device, weights_only=False))
                logger.info("Loaded pre-trained GNN model")
            except Exception as e:
                logger.warning(f"Failed to load GNN: {e}. Using random init.")
        else:
            logger.info("Using randomly initialized GNN")
        gnn.eval().to(self.device)
        return gnn
    
    def _load_scalers(self):
        scaler_files = {
            "yj_transformer": "yj_transformer.pkl",
            "mm_scaler": "mm_scaler.pkl",
            "feature_scaler": "feature_scaler.pkl",
            "target_scaler": "target_scaler.pkl"
        }
        self.scalers = {}
        for name, filename in scaler_files.items():
            path = self.deploy_dir / filename
            if path.exists():
                try:
                    self.scalers[name] = joblib.load(path)
                    logger.info(f"Loaded scaler: {name}")
                except Exception as e:
                    logger.warning(f"Failed to load scaler {name}: {e}")
    
    def preprocess(self, readings: list) -> tuple:
        if len(readings) < self.seq_len:
            readings = [readings[0]] * (self.seq_len - len(readings)) + readings
        readings = readings[-self.seq_len:]
        
        features = []
        for r in readings:
            row = [
                r.get("water_level_m", 0.0),
                r.get("rainfall_mm", 0.0),
                r.get("soil_moisture_percent", 0.0) / 100.0,
                r.get("tilt_degrees", 0.0),
                r.get("temperature_c", 20.0) / 50.0,
                r.get("humidity_percent", 50.0) / 100.0,
                r.get("water_level_delta", 0.0),
                r.get("rainfall_delta", 0.0)
            ]
            features.append(row)
        
        x_dynamic = np.array(features, dtype=np.float32)
        
        if "feature_scaler" in self.scalers:
            try:
                x_dynamic = self.scalers["feature_scaler"].transform(x_dynamic)
            except Exception:
                pass
        
        x_flat = x_dynamic[-1].copy()
        return x_dynamic, x_flat
    
    def predict_lstm(self, x_dynamic: np.ndarray) -> tuple:
        x_dyn_t = torch.from_numpy(x_dynamic).unsqueeze(0).to(self.device)
        with torch.no_grad():
            pred, hidden = self.lstm(x_dyn_t, return_hidden=True)
        return float(pred.cpu().numpy().ravel()[0]), hidden.cpu().numpy()
    
    def predict_xgboost(self, x_flat: np.ndarray, hidden_np: np.ndarray) -> float:
        if self.xgb.model is None:
            return 0.0
        try:
            xgb_input = np.concatenate([x_flat.reshape(1, -1), hidden_np], axis=1)
            return float(self.xgb.predict(xgb_input)[0])
        except Exception as e:
            logger.warning(f"XGBoost prediction failed: {e}")
            return 0.0
    
    def predict_pinn(self, x_dynamic: np.ndarray) -> float:
        x_t = torch.from_numpy(x_dynamic[-1:]).unsqueeze(0).to(self.device)
        with torch.no_grad():
            outputs = self.pinn(x_t)
        return float(outputs["risk_score"].cpu().numpy().ravel()[0])
    
    def predict_gnn(
        self, 
        node_features: np.ndarray, 
        edge_index: np.ndarray
    ) -> float:
        node_t = torch.from_numpy(node_features).float().to(self.device)
        edge_t = torch.tensor(edge_index, dtype=torch.long).to(self.device)
        
        with torch.no_grad():
            outputs = self.gnn(node_t, edge_t)
        
        return float(outputs["node_risk"].mean().cpu().numpy())
    
    def predict(
        self, 
        readings: list, 
        prev_water_level: float = 0.0,
        all_location_readings: Optional[Dict[str, list]] = None,
        connectivity: Optional[Dict[str, list]] = None
    ) -> Dict:
        """
        Run full 4-model ensemble prediction.
        
        Args:
            readings: Sensor readings for target location
            prev_water_level: Previous water level
            all_location_readings: Readings for all locations (for GNN)
            connectivity: Graph connectivity between locations (for GNN)
            
        Returns:
            Prediction results with all model outputs
        """
        x_dynamic, x_flat = self.preprocess(readings)
        
        lstm_score, hidden_np = self.predict_lstm(x_dynamic)
        xgb_correction = self.predict_xgboost(x_flat, hidden_np)
        pinn_score = self.predict_pinn(x_dynamic)
        
        lstm_combined = lstm_score + xgb_correction
        lstm_combined = float(np.clip(lstm_combined, 0, 100))
        
        gnn_score = 0.0
        if all_location_readings and len(all_location_readings) > 1:
            try:
                locations = list(all_location_readings.keys())
                node_feats = []
                for loc in locations:
                    loc_readings = all_location_readings[loc]
                    if loc_readings:
                        last_r = loc_readings[-1]
                        node_feats.append([
                            last_r.get("water_level_m", 0.0),
                            last_r.get("rainfall_mm", 0.0),
                            last_r.get("soil_moisture_percent", 0.0) / 100.0,
                            last_r.get("tilt_degrees", 0.0),
                            last_r.get("temperature_c", 20.0) / 50.0,
                            last_r.get("humidity_percent", 50.0) / 100.0,
                            0.0, 0.0
                        ])
                    else:
                        node_feats.append([0.0] * 8)
                
                node_features = np.array(node_feats, dtype=np.float32)
                _, edge_index = build_sensor_graph(locations, connectivity)
                
                gnn_score = self.predict_gnn(node_features, edge_index.numpy())
            except Exception as e:
                logger.warning(f"GNN prediction failed: {e}")
        
        ensemble_result = self.ensemble.aggregate(
            lstm_pred=lstm_combined,
            xgboost_pred=xgb_correction,
            gnn_pred=gnn_score if gnn_score > 0 else None,
            pinn_pred=pinn_score if pinn_score > 0 else None
        )
        
        final_score = ensemble_result["ensemble_score"]
        risk_level = self._get_risk_level(final_score)
        
        last_reading = readings[-1] if readings else {}
        current_water = last_reading.get("water_level_m", prev_water_level)
        predicted_water = current_water * (1 + final_score / 200.0)
        
        return {
            "risk_score": round(final_score, 2),
            "risk_level": risk_level,
            "models": {
                "lstm": {"prediction": round(lstm_combined, 2), "weight": 0.4},
                "xgboost": {"correction": round(xgb_correction, 2), "weight": 0.3},
                "gnn": {"prediction": round(gnn_score, 2), "weight": 0.2},
                "pinn": {"prediction": round(pinn_score, 2), "weight": 0.1}
            },
            "ensemble_details": ensemble_result,
            "predicted_water_level": round(float(predicted_water), 2),
            "flood_probability": round(min(final_score / 100.0, 1.0), 3),
            "lead_time_hours": self._estimate_lead_time(final_score),
            "confidence_interval": [
                round(max(0, final_score - 10), 2),
                round(min(100, final_score + 10), 2)
            ],
            "model_version": "ensemble_v2.0"
        }
    
    def _get_risk_level(self, score: float) -> str:
        if score >= 80:
            return "critical"
        elif score >= 60:
            return "high"
        elif score >= 40:
            return "warning"
        elif score >= 20:
            return "watch"
        return "normal"
    
    def _estimate_lead_time(self, risk_score: float) -> int:
        if risk_score >= 80:
            return 2
        elif risk_score >= 60:
            return 6
        elif risk_score >= 40:
            return 12
        elif risk_score >= 20:
            return 24
        return 48
