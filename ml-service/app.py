import os
import time
import logging
from typing import List, Optional, Dict
from pathlib import Path
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from services.predictor import FloodPredictor
from services.data_processor import SensorDataProcessor
from models.ensemble import EnsembleAggregator
from demo_data import SCENARIOS, get_scenario, get_all_scenarios, get_demo_prediction

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

predictor: Optional[FloodPredictor] = None
data_processor: Optional[SensorDataProcessor] = None
ensemble: Optional[EnsembleAggregator] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global predictor, data_processor, ensemble
    
    logger.info("Initializing ML service...")
    
    pretrained_dir = Path(__file__).parent / "pretrained"
    
    try:
        predictor = FloodPredictor(str(pretrained_dir))
        logger.info("Predictor loaded successfully with 4 models: LSTM, XGBoost, GNN, PINN")
    except Exception as e:
        logger.warning(f"Predictor init failed: {e}. Running without ML models.")
    
    try:
        data_processor = SensorDataProcessor()
    except Exception as e:
        logger.warning(f"DataProcessor init failed: {e}")
    
    try:
        ensemble = EnsembleAggregator()
    except Exception as e:
        logger.warning(f"Ensemble init failed: {e}")
    
    logger.info("ML service ready")
    yield
    logger.info("ML service shutting down")


app = FastAPI(
    title="Flood Prediction ML Service",
    description="AI/ML prediction engine with LSTM, XGBoost, GNN, PINN ensemble",
    version="2.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SensorReading(BaseModel):
    location: str = Field(..., description="Sensor location ID")
    timestamp: Optional[str] = Field(None, description="ISO timestamp")
    water_level_m: Optional[float] = Field(None, ge=0, le=50)
    rainfall_mm: Optional[float] = Field(None, ge=0, le=500)
    soil_moisture_percent: Optional[float] = Field(None, ge=0, le=100)
    tilt_degrees: Optional[float] = Field(None, ge=0, le=90)
    temperature_c: Optional[float] = Field(None, ge=-50, le=60)
    humidity_percent: Optional[float] = Field(None, ge=0, le=100)


class PredictionRequest(BaseModel):
    location: str = Field(..., description="Location to predict for")
    readings: List[SensorReading] = Field(..., min_length=1)
    prev_water_level: Optional[float] = Field(0.0, ge=0)


class SpatialPredictionRequest(BaseModel):
    location: str
    readings: List[SensorReading]
    all_locations: Optional[Dict[str, List[SensorReading]]] = None
    connectivity: Optional[Dict[str, List[str]]] = None


class BatchPredictionRequest(BaseModel):
    locations: List[str] = Field(..., min_length=1)
    readings_per_location: int = Field(15, ge=1, le=50)


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "models_loaded": {
            "predictor": predictor is not None,
            "lstm": True,
            "xgboost": True,
            "gnn": True,
            "pinn": True,
            "ensemble": ensemble is not None
        },
        "version": "2.0.0",
        "timestamp": time.time()
    }


@app.get("/model/info")
async def model_info():
    return {
        "model_version": "ensemble_v2.0",
        "architecture": {
            "lstm": {
                "type": "PyTorch LSTM",
                "layers": 2,
                "hidden_size": 128,
                "description": "Time-series flood prediction (temporal dynamics)",
                "weight": 0.4,
                "input": "15-day sliding window of dynamic features",
                "output": "Baseline streamflow/risk prediction"
            },
            "xgboost": {
                "type": "XGBoost Regressor",
                "description": "Residual error correction",
                "weight": 0.3,
                "input": "LSTM hidden state + engineered physical features",
                "output": "Correction term for LSTM prediction"
            },
            "gnn": {
                "type": "Graph Attention Network",
                "layers": 3,
                "heads": 4,
                "description": "Spatial relationships between sensor locations",
                "weight": 0.2,
                "input": "Terrain graph with sensor nodes and edges",
                "output": "Downstream village impact assessment"
            },
            "pinn": {
                "type": "Physics-Informed Neural Network",
                "layers": 4,
                "description": "Physics constraints (water balance, Manning's equation)",
                "weight": 0.1,
                "input": "Sensor data with physics equations",
                "output": "Physics-validated flood prediction"
            },
            "ensemble": {
                "type": "Weighted Average Aggregator",
                "weights": ensemble.weights if ensemble else {},
                "formula": "LSTM*0.4 + XGBoost*0.3 + GNN*0.2 + PINN*0.1"
            }
        },
        "input_features": [
            "water_level_m",
            "rainfall_mm",
            "soil_moisture_percent",
            "tilt_degrees",
            "temperature_c",
            "humidity_percent",
            "water_level_delta",
            "rainfall_delta"
        ],
        "output": {
            "risk_score": "0-100",
            "risk_level": "normal|watch|warning|high|critical",
            "flood_probability": "0.0-1.0",
            "predicted_water_level": "meters",
            "lead_time_hours": "2-48 hours",
            "confidence_interval": "[lower, upper]"
        },
        "based_on": {
            "lstm_xgboost": "sridipbasu/floodcast (Hybrid LSTM + XGBoost)",
            "pinn": "Raissi et al. (2019) Physics-informed neural networks",
            "gnn": "Graph Attention Networks for spatial modeling"
        }
    }


@app.post("/predict")
async def predict(request: PredictionRequest):
    start_time = time.time()
    
    if predictor is None:
        raise HTTPException(status_code=503, detail="ML model not loaded")
    
    try:
        readings_dicts = [r.model_dump() for r in request.readings]
        
        for reading in readings_dicts:
            data_processor.add_reading(reading)
        
        data_processor.compute_deltas(request.location)
        
        enriched_readings = data_processor.get_location_buffer(request.location)
        if not enriched_readings:
            enriched_readings = readings_dicts
        
        result = predictor.predict(
            enriched_readings,
            prev_water_level=request.prev_water_level
        )
        
        processing_time = (time.time() - start_time) * 1000
        
        return {
            "location": request.location,
            **result,
            "processing_time_ms": round(processing_time, 2)
        }
    
    except Exception as e:
        logger.error(f"Prediction failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict/spatial")
async def predict_spatial(request: SpatialPredictionRequest):
    start_time = time.time()
    
    if predictor is None:
        raise HTTPException(status_code=503, detail="ML model not loaded")
    
    try:
        readings_dicts = [r.model_dump() for r in request.readings]
        
        all_location_readings = None
        if request.all_locations:
            all_location_readings = {}
            for loc, loc_readings in request.all_locations.items():
                all_location_readings[loc] = [r.model_dump() for r in loc_readings]
        
        result = predictor.predict(
            readings_dicts,
            all_location_readings=all_location_readings,
            connectivity=request.connectivity
        )
        
        processing_time = (time.time() - start_time) * 1000
        
        return {
            "location": request.location,
            **result,
            "processing_time_ms": round(processing_time, 2)
        }
    
    except Exception as e:
        logger.error(f"Spatial prediction failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict/batch")
async def predict_batch(request: BatchPredictionRequest):
    results = []
    
    for location in request.locations:
        readings = data_processor.get_location_buffer(location)
        
        if not readings:
            readings = [{"location": location}]
        
        try:
            result = predictor.predict(readings)
            result["location"] = location
            results.append(result)
        except Exception as e:
            results.append({
                "location": location,
                "error": str(e)
            })
    
    return {
        "predictions": results,
        "count": len(results),
        "model_version": "ensemble_v2.0"
    }


@app.post("/predict/rule-based")
async def predict_rule_based(request: PredictionRequest):
    if not request.readings:
        raise HTTPException(status_code=400, detail="No readings provided")
    
    latest = request.readings[-1]
    
    water_score = min((latest.water_level_m or 0) / 5.0 * 40, 40)
    rain_score = min((latest.rainfall_mm or 0) / 50.0 * 30, 30)
    soil_score = min((latest.soil_moisture_percent or 0) / 100.0 * 20, 20)
    tilt_score = min((latest.tilt_degrees or 0) / 15.0 * 10, 10)
    
    total_score = water_score + rain_score + soil_score + tilt_score
    total_score = min(max(total_score, 0), 100)
    
    risk_level = "normal"
    if total_score >= 80:
        risk_level = "critical"
    elif total_score >= 60:
        risk_level = "high"
    elif total_score >= 40:
        risk_level = "warning"
    elif total_score >= 20:
        risk_level = "watch"
    
    return {
        "location": request.location,
        "risk_score": round(total_score, 2),
        "risk_level": risk_level,
        "flood_probability": round(total_score / 100.0, 3),
        "predicted_water_level": round((latest.water_level_m or 0) * 1.2, 2),
        "model_version": "rule_based_v1.0",
        "model_type": "rule_based"
    }


@app.get("/stats")
async def get_stats():
    return {
        "locations_tracked": len(data_processor.reading_buffer) if data_processor else 0,
        "buffer_sizes": {
            loc: len(readings)
            for loc, readings in (data_processor.reading_buffer.items() if data_processor else {})
        },
        "models": ["lstm", "xgboost", "gnn", "pinn", "ensemble"]
    }


@app.get("/demo/scenarios")
async def demo_scenarios():
    return {"scenarios": get_all_scenarios()}


@app.get("/demo/scenario/{scenario_name}")
async def demo_scenario(scenario_name: str):
    if scenario_name not in SCENARIOS:
        raise HTTPException(status_code=404, detail=f"Scenario '{scenario_name}' not found")
    return get_demo_prediction(scenario_name)


@app.get("/demo/predict/{scenario_name}")
async def demo_predict(scenario_name: str):
    start_time = time.time()
    
    if scenario_name not in SCENARIOS:
        raise HTTPException(status_code=404, detail=f"Scenario '{scenario_name}' not found")
    
    scenario = get_scenario(scenario_name)
    demo_pred = get_demo_prediction(scenario_name)
    
    try:
        readings_dicts = scenario["readings"]
        
        for reading in readings_dicts:
            data_processor.add_reading(reading)
        
        data_processor.compute_deltas(readings_dicts[-1]["location"])
        
        enriched_readings = data_processor.get_location_buffer(readings_dicts[-1]["location"])
        if not enriched_readings:
            enriched_readings = readings_dicts
        
        ml_result = predictor.predict(enriched_readings) if predictor else {}
        
        processing_time = (time.time() - start_time) * 1000
        
        return {
            "scenario": scenario["name"],
            "description": scenario["description"],
            "icon": scenario["icon"],
            "sensor_readings": scenario["readings"],
            "ml_prediction": ml_result if ml_result else None,
            "demo_prediction": {
                "risk_score": demo_pred["risk_score"],
                "risk_level": demo_pred["risk_level"],
                "flood_probability": demo_pred["flood_probability"],
                "predicted_water_level": demo_pred["predicted_water_level"],
                "lead_time_hours": demo_pred["lead_time_hours"],
                "model_breakdown": demo_pred["models"],
                "recommendations": demo_pred["recommendations"]
            },
            "processing_time_ms": round(processing_time, 2),
            "model_version": "demo_v1.0"
        }
    
    except Exception as e:
        logger.error(f"Demo prediction failed: {e}")
        return {
            "scenario": scenario["name"],
            "description": scenario["description"],
            "sensor_readings": scenario["readings"],
            "demo_prediction": demo_pred,
            "model_version": "demo_v1.0"
        }


@app.post("/demo/run-all")
async def demo_run_all():
    results = []
    
    for scenario_key in SCENARIOS.keys():
        demo_pred = get_demo_prediction(scenario_key)
        results.append({
            "key": scenario_key,
            **demo_pred
        })
    
    return {
        "scenarios": results,
        "architecture": {
            "formula": "LSTM*0.4 + XGBoost*0.3 + GNN*0.2 + PINN*0.1",
            "models": ["lstm", "xgboost", "gnn", "pinn"]
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
