# FloodLens - AI-Powered Flood Prediction & Early Warning System

<div align="center">

![SIH 2026](https://img.shields.io/badge/Smart%20India%20Hackathon-2026-blue)
![Python](https://img.shields.io/badge/Python-3.10+-yellow)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-teal)
![PyTorch](https://img.shields.io/badge/PyTorch-2.0+-red)

**Problem Statement:** Real-time flood prediction and early warning system for rural and semi-urban areas

</div>

---

## Overview

FloodLens is a multi-model AI ensemble system that predicts flood risk 2-48 hours in advance by combining:

| Model | Purpose | Weight |
|-------|---------|--------|
| **LSTM** | Time-series temporal patterns | 40% |
| **XGBoost** | Residual error correction | 30% |
| **GNN** | Spatial sensor relationships | 20% |
| **PINN** | Physics-informed constraints | 10% |

**Prediction Formula:** `Risk = LSTM×0.4 + XGBoost×0.3 + GNN×0.2 + PINN×0.1`

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        SYSTEM ARCHITECTURE                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Layer 1: Data Acquisition                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                      │
│  │ IoT Sensors │  │ Satellites  │  │   Weather   │                      │
│  │ (Water, Rain)│  │ (Sentinel)  │  │   Stations  │                      │
│  └─────────────┘  └─────────────┘  └─────────────┘                      │
│                                                                         │
│  Layer 2: Data Ingestion & Communication                                │
│  ┌─────────────────────────────────────────────┐                        │
│  │         MQTT Broker → API Gateway           │                        │
│  └─────────────────────────────────────────────┘                        │
│                                                                         │
│  Layer 3: Data Processing & Storage                                     │
│  ┌─────────────────────────────────────────────┐                        │
│  │      Supabase (PostgreSQL) + Firebase       │                        │
│  └─────────────────────────────────────────────┘                        │
│                                                                         │
│  Layer 4: AI/ML Prediction Engine                                       │
│  ┌─────────────────────────────────────────────┐                        │
│  │  LSTM + XGBoost + GNN + PINN = Ensemble     │                        │
│  └─────────────────────────────────────────────┘                        │
│                                                                         │
│  Layer 5: Alert & Decision Support                                      │
│  ┌─────────────────────────────────────────────┐                        │
│  │     Risk Engine → Multi-Channel Alerts      │                        │
│  └─────────────────────────────────────────────┘                        │
│                                                                         │
│  Layer 6: Application & Visualization                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                      │
│  │   Mobile    │  │   Admin     │  │   3D Map    │                      │
│  │     App     │  │  Dashboard  │  │  Visualizer │                      │
│  └─────────────┘  └─────────────┘  └─────────────┘                      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
Flood-Prediction-Model-/
├── ml-service/                    # Python ML Microservice
│   ├── app.py                     # FastAPI server
│   ├── models/
│   │   ├── flood_lstm.py          # LSTM time-series model
│   │   ├── xgboost_model.py       # XGBoost corrector
│   │   ├── pinn_gnn.py            # PINN + GNN models
│   │   └── ensemble.py            # 4-model aggregator
│   ├── services/
│   │   ├── predictor.py           # Inference pipeline
│   │   └── data_processor.py      # Sensor data processing
│   ├── pretrained/                # Model weights
│   ├── demo.py                    # Hackathon demo script
│   ├── demo_data.py               # Realistic flood scenarios
│   ├── setup_models.py            # Model initialization
│   ├── requirements.txt           # Python dependencies
│   └── Dockerfile
│
├── flood-prediction-backend/      # Node.js Backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── supabase.js
│   │   │   └── firebase.js
│   │   ├── routes/
│   │   │   └── api.js
│   │   └── services/
│   │       ├── mlService.js       # ML client
│   │       ├── supabaseService.js
│   │       └── firebaseService.js
│   ├── tests/
│   │   └── test-ml-integration.js
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml             # Multi-service orchestration
├── supabase-setup.sql             # Database schema
└── README.md
```

---

## Quick Start

### Option 1: Docker (Recommended)

```bash
# Clone repository
git clone https://github.com/annms1876-glitch/Flood-Prediction-Model-.git
cd Flood-Prediction-Model-

# Start all services
docker-compose up
```

### Option 2: Manual Setup

**Backend (Node.js):**

```bash
cd flood-prediction-backend
npm install
cp .env.example .env
# Edit .env with your Supabase/Firebase credentials
npm run dev
```

**ML Service (Python):**

```bash
cd ml-service
pip install -r requirements.txt
python setup_models.py          # Initialize model weights
python -m uvicorn app:app --reload --port 8000
```

### Option 3: Demo Mode

```bash
cd ml-service
python demo.py --auto           # Run all scenarios
python demo.py                  # Interactive menu
```

---

## API Endpoints

### ML Service (Port 8000)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check with model status |
| `/model/info` | GET | Architecture details |
| `/predict` | POST | Single location prediction |
| `/predict/spatial` | POST | GNN spatial prediction |
| `/demo/scenarios` | GET | List all demo scenarios |
| `/demo/predict/{name}` | GET | Run specific scenario |
| `/demo/run-all` | POST | Run all scenarios |

### Backend (Port 3000)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Service health check |
| `/api/sensors` | GET | List all sensors |
| `/api/sensors/:location/readings` | GET | Get sensor readings |
| `/api/predictions` | GET | Get flood predictions |
| `/api/risk/ml` | GET | ML-based risk calculation |
| `/api/alerts/send` | POST | Send flood alerts |

---

## Risk Classification

| Score | Level | Action |
|-------|-------|--------|
| 80-100 | Critical | Immediate evacuation |
| 60-79 | High | Prepare for flooding |
| 40-59 | Warning | Monitor closely |
| 20-39 | Watch | Stay alert |
| 0-19 | Normal | No action needed |

---

## Demo Scenarios

The system includes 6 pre-computed realistic flood scenarios:

| Scenario | Risk Score | Description |
|----------|------------|-------------|
| Normal Day | 12/100 | Baseline conditions |
| Light Rainfall | 35/100 | Rising water levels |
| Heavy Rainfall | 68/100 | Warning conditions |
| Critical Alert | 92/100 | Evacuation needed |
| Hilly Region | 78/100 | Landslide risk |
| Multi-Village | 71/100 | Downstream impact |

---

## Input Features

The ML model uses 8 features from IoT sensors:

| Feature | Range | Description |
|---------|-------|-------------|
| `water_level_m` | 0-50m | River water level |
| `rainfall_mm` | 0-500mm | Hourly rainfall |
| `soil_moisture_percent` | 0-100% | Soil saturation |
| `tilt_degrees` | 0-90° | Ground tilt (landslide) |
| `temperature_c` | -50 to 60°C | Air temperature |
| `humidity_percent` | 0-100% | Relative humidity |
| `water_level_delta` | ±5m | Rate of change |
| `rainfall_delta` | ±100mm | Rainfall trend |

---

## Technologies

**Backend:**
- Node.js 18+ / Express.js
- Supabase (PostgreSQL)
- Firebase (FCM, Firestore)

**ML Service:**
- Python 3.10+ / FastAPI
- PyTorch (LSTM, PINN, GNN)
- XGBoost
- scikit-learn

**Infrastructure:**
- Docker / Docker Compose
- MQTT (sensor communication)

---

## Database Schema

Tables created by `supabase-setup.sql`:

1. **sensors** - IoT sensor device information
2. **sensor_readings** - Time-series sensor data
3. **predictions** - ML model flood predictions
4. **alerts** - Flood alert records
5. **alert_logs** - Audit trail for delivery
6. **community_members** - Notification subscribers

---

## Testing

```bash
# Backend tests
cd flood-prediction-backend
npm run test:system              # Full system tests
npm run test:integration         # Integration with simulator
npm run test:demo                # Demo mode

# ML Service tests
cd ml-service
python demo.py --auto            # Demo all scenarios
```

---

## Environment Variables

**Backend (.env):**

```env
PORT=3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CREDENTIAL_PATH=./config/service-account.json
```

**ML Service:**

```env
ML_SERVICE_URL=http://localhost:8000
ML_SERVICE_TIMEOUT=5000
```

---

## Deployment

### Local Development

```bash
npm run dev                      # Backend only
npm run dev:ml                   # ML service only
npm run dev                      # Both (concurrently)
```

### Production

```bash
# Docker
docker-compose -f docker-compose.yml up -d

# Or platform-as-a-service
# Heroku, Railway, Vercel
```

---

## License

ISC License

---

## Team

**annms1876-glitch**

- GitHub: [@annms1876-glitch](https://github.com/annms1876-glitch)

---

## Acknowledgments

- [floodcast](https://github.com/sridipbasu/floodcast) - LSTM+XGBoost architecture reference
- [Supabase](https://supabase.com/) - Database backend
- [Firebase](https://firebase.google.com/) - Push notifications
- [PyTorch](https://pytorch.org/) - Deep learning framework
- [FastAPI](https://fastapi.tiangolo.com/) - Python API framework
