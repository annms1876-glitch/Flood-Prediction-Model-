import numpy as np
import xgboost as xgb
import joblib
from pathlib import Path
from typing import Optional


class XGBoostCorrector:
    """
    XGBoost model for residual correction.
    Based on floodcast architecture (sridipbasu/floodcast).
    
    Takes LSTM hidden state + engineered features as input
    and predicts the residual error (actual - LSTM prediction).
    """
    
    def __init__(self, model_path: Optional[str] = None):
        self.model = None
        if model_path and Path(model_path).exists():
            self.load(model_path)
    
    def load(self, model_path: str):
        """Load pre-trained XGBoost model."""
        self.model = xgb.XGBRegressor()
        self.model.load_model(model_path)
    
    def predict(self, x: np.ndarray) -> np.ndarray:
        """
        Predict residual correction.
        
        Args:
            x: Input features of shape (n_samples, n_features)
               Features = LSTM hidden state + engineered physical features
               
        Returns:
            Correction terms of shape (n_samples,)
        """
        if self.model is None:
            raise RuntimeError("Model not loaded. Call load() first.")
        return self.model.predict(x)
    
    def save(self, model_path: str):
        """Save XGBoost model."""
        if self.model is None:
            raise RuntimeError("No model to save.")
        self.model.save_model(model_path)
