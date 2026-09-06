# Flood Prediction ML Service

AI/ML prediction engine for flood forecasting using hybrid LSTM + XGBoost architecture.

## Architecture

Based on [floodcast](https://github.com/sridipbasu/floodcast) - a two-stage hybrid ML pipeline:

1. **LSTM (Stage 1)**: Learns temporal dynamics from sensor data sequences
2. **XGBoost (Stage 2)**: Corrects residual errors using engineered features
3. **Ensemble**: Combines predictions with rule-based fallback

## Quick Start

### 1. Install Dependencies

```bash
cd ml-service
pip install -r requirements.txt
```

### 2. Start the Service

```bash
python -m uvicorn app:app --reload --port 8000
```

### 3. Test the Service

```bash
curl http://localhost:8000/health
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/model/info` | Model metadata |
| POST | `/predict` | Single prediction |
| POST | `/predict/batch` | Batch predictions |
| POST | `/predict/rule-based` | Rule-based fallback |
| GET | `/stats` | Processing statistics |

## Integration with Node.js Backend

The Node.js backend connects to this service via `mlService.js`:

```javascript
const mlService = require('../services/mlService');

// Get ML prediction with fallback
const result = await mlService.getPrediction('village_a', readings);
```

## Model Files

Place pre-trained model files in `pretrained/`:

- `best_flood_lstm.pt` - LSTM weights
- `flood_xgb_corrector.json` - XGBoost model
- `model_config.json` - Configuration
- `feature_scaler.pkl` - Feature scaler
- `mm_scaler.pkl` - MinMax scaler
- `target_scaler.pkl` - Target scaler
- `yj_transformer.pkl` - Yeo-Johnson transformer

## Docker

```bash
docker build -t flood-ml-service .
docker run -p 8000:8000 flood-ml-service
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PYTHONUNBUFFERED` | `1` | Enable unbuffered output |

## License

MIT
