#!/usr/bin/env python3
"""
Setup script to generate initial model weights for the Flood Prediction ML Service.
Run this script to initialize all 4 models (LSTM, XGBoost, GNN, PINN) with random weights.

Usage:
    cd ml-service
    python setup_models.py
"""

import torch
import numpy as np
import json
import os
from pathlib import Path


def setup_directories():
    pretrained_dir = Path("pretrained")
    pretrained_dir.mkdir(exist_ok=True)
    return pretrained_dir


def generate_lstm_weights(pretrained_dir: Path):
    from models.flood_lstm import FloodLSTM
    
    print("Generating LSTM model weights...")
    model = FloodLSTM(input_size=8, hidden_size=128, num_layers=2, dropout=0.2)
    
    dummy = torch.randn(1, 15, 8)
    with torch.no_grad():
        pred, hidden = model(dummy, return_hidden=True)
    
    checkpoint = {
        'model_state': model.state_dict(),
        'config': {
            'seq_len': 15,
            'input_size': 8,
            'hidden_size': 128,
            'num_layers': 2,
            'dropout': 0.2
        }
    }
    
    path = pretrained_dir / "best_flood_lstm.pt"
    torch.save(checkpoint, path)
    print(f"  Saved: {path} ({os.path.getsize(path)} bytes)")


def generate_xgboost_weights(pretrained_dir: Path):
    from models.xgboost_model import XGBoostCorrector
    import xgboost as xgb
    
    print("Generating XGBoost model weights...")
    model = xgb.XGBRegressor(
        n_estimators=100,
        max_depth=6,
        learning_rate=0.1,
        objective='reg:squarederror'
    )
    
    X_dummy = np.random.randn(100, 50).astype(np.float32)
    y_dummy = np.random.randn(100).astype(np.float32)
    model.fit(X_dummy, y_dummy)
    
    path = pretrained_dir / "flood_xgb_corrector.json"
    model.save_model(str(path))
    print(f"  Saved: {path} ({os.path.getsize(path)} bytes)")


def generate_pinn_weights(pretrained_dir: Path):
    from models.pinn_gnn import PINN
    
    print("Generating PINN model weights...")
    model = PINN(input_size=8, hidden_size=64, num_layers=4, dropout=0.1)
    
    dummy = torch.randn(1, 8)
    with torch.no_grad():
        outputs = model(dummy)
    
    path = pretrained_dir / "pinn_model.pt"
    torch.save(model.state_dict(), path)
    print(f"  Saved: {path} ({os.path.getsize(path)} bytes)")


def generate_gnn_weights(pretrained_dir: Path):
    from models.pinn_gnn import FloodGNN
    
    print("Generating GNN model weights...")
    model = FloodGNN(
        node_features=8,
        edge_features=4,
        hidden_size=64,
        num_heads=4,
        num_layers=3,
        dropout=0.1
    )
    
    node_features = torch.randn(5, 8)
    edge_index = torch.tensor([[0, 1, 1, 2, 2, 3, 3, 4], [1, 0, 2, 1, 3, 2, 4, 3]])
    
    with torch.no_grad():
        outputs = model(node_features, edge_index)
    
    path = pretrained_dir / "gnn_model.pt"
    torch.save(model.state_dict(), path)
    print(f"  Saved: {path} ({os.path.getsize(path)} bytes)")


def generate_scalers(pretrained_dir: Path):
    from sklearn.preprocessing import StandardScaler, MinMaxScaler
    import joblib
    
    print("Generating scalers...")
    
    feature_scaler = StandardScaler()
    X_dummy = np.random.randn(100, 8).astype(np.float32)
    feature_scaler.fit(X_dummy)
    path = pretrained_dir / "feature_scaler.pkl"
    joblib.dump(feature_scaler, path)
    print(f"  Saved: {path}")
    
    mm_scaler = MinMaxScaler()
    mm_scaler.fit(X_dummy[:, :4])
    path = pretrained_dir / "mm_scaler.pkl"
    joblib.dump(mm_scaler, path)
    print(f"  Saved: {path}")
    
    target_scaler = StandardScaler()
    y_dummy = np.random.randn(100, 1).astype(np.float32)
    target_scaler.fit(y_dummy)
    path = pretrained_dir / "target_scaler.pkl"
    joblib.dump(target_scaler, path)
    print(f"  Saved: {path}")
    
    from sklearn.preprocessing import PowerTransformer
    yj_transformer = PowerTransformer(method='yeo-johnson')
    yj_transformer.fit(X_dummy[:, :3])
    path = pretrained_dir / "yj_transformer.pkl"
    joblib.dump(yj_transformer, path)
    print(f"  Saved: {path}")


def main():
    print("=" * 60)
    print("Flood Prediction ML Service - Model Setup")
    print("=" * 60)
    print()
    
    pretrained_dir = setup_directories()
    
    generate_lstm_weights(pretrained_dir)
    generate_xgboost_weights(pretrained_dir)
    generate_pinn_weights(pretrained_dir)
    generate_gnn_weights(pretrained_dir)
    generate_scalers(pretrained_dir)
    
    print()
    print("=" * 60)
    print("Setup complete!")
    print("All model weights generated in:", pretrained_dir)
    print()
    print("Start the ML service with:")
    print("  python -m uvicorn app:app --reload --port 8000")
    print("=" * 60)


if __name__ == "__main__":
    main()
