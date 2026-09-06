import numpy as np
from typing import Dict, Optional


class EnsembleAggregator:
    """
    Ensemble aggregator for combining multiple model predictions.
    
    Implements weighted average aggregation as specified in architecture:
    LSTM (0.4) + XGBoost (0.3) + Rule-based (0.3)
    
    Can be extended to include GNN and PINN weights.
    """
    
    DEFAULT_WEIGHTS = {
        "lstm": 0.4,
        "xgboost": 0.3,
        "gnn": 0.2,
        "pinn": 0.1
    }
    
    FUTURE_WEIGHTS = {
        "lstm": 0.4,
        "xgboost": 0.3,
        "gnn": 0.2,
        "pinn": 0.1
    }
    
    def __init__(self, weights: Optional[Dict[str, float]] = None):
        """
        Initialize ensemble aggregator.
        
        Args:
            weights: Model weights (must sum to 1.0)
                    If None, uses DEFAULT_WEIGHTS
        """
        self.weights = weights or self.DEFAULT_WEIGHTS.copy()
        self._validate_weights()
    
    def _validate_weights(self):
        """Ensure weights sum to 1.0."""
        total = sum(self.weights.values())
        if abs(total - 1.0) > 1e-6:
            raise ValueError(f"Weights must sum to 1.0, got {total}")
    
    def aggregate(
        self,
        lstm_pred: Optional[float] = None,
        xgboost_pred: Optional[float] = None,
        rule_based_pred: Optional[float] = None,
        gnn_pred: Optional[float] = None,
        pinn_pred: Optional[float] = None
    ) -> Dict:
        """
        Aggregate predictions from multiple models.
        
        Args:
            lstm_pred: LSTM model prediction (risk score 0-100)
            xgboost_pred: XGBoost model prediction
            rule_based_pred: Rule-based model prediction
            gnn_pred: GNN model prediction (future)
            pinn_pred: PINN model prediction (future)
            
        Returns:
            Dictionary with aggregated prediction and details
        """
        predictions = {}
        weighted_sum = 0.0
        total_weight = 0.0
        
        if lstm_pred is not None and "lstm" in self.weights:
            predictions["lstm"] = lstm_pred
            weighted_sum += lstm_pred * self.weights["lstm"]
            total_weight += self.weights["lstm"]
        
        if xgboost_pred is not None and "xgboost" in self.weights:
            predictions["xgboost"] = xgboost_pred
            weighted_sum += xgboost_pred * self.weights["xgboost"]
            total_weight += self.weights["xgboost"]
        
        if rule_based_pred is not None and "rule_based" in self.weights:
            predictions["rule_based"] = rule_based_pred
            weighted_sum += rule_based_pred * self.weights["rule_based"]
            total_weight += self.weights["rule_based"]
        
        if gnn_pred is not None and "gnn" in self.weights:
            predictions["gnn"] = gnn_pred
            weighted_sum += gnn_pred * self.weights["gnn"]
            total_weight += self.weights["gnn"]
        
        if pinn_pred is not None and "pinn" in self.weights:
            predictions["pinn"] = pinn_pred
            weighted_sum += pinn_pred * self.weights["pinn"]
            total_weight += self.weights["pinn"]
        
        # Normalize if not all models contributed
        if total_weight > 0:
            ensemble_score = weighted_sum / total_weight
        else:
            ensemble_score = 0.0
        
        # Calculate confidence based on prediction agreement
        if len(predictions) > 1:
            pred_values = list(predictions.values())
            std_dev = np.std(pred_values)
            confidence = max(0.0, 1.0 - (std_dev / 50.0))
        else:
            confidence = 0.5
        
        return {
            "ensemble_score": round(float(np.clip(ensemble_score, 0, 100)), 2),
            "predictions": predictions,
            "weights_used": {k: v for k, v in self.weights.items() if k in predictions},
            "confidence": round(float(confidence), 3)
        }
    
    def update_weights(self, new_weights: Dict[str, float]):
        """Update ensemble weights."""
        self.weights = new_weights
        self._validate_weights()
