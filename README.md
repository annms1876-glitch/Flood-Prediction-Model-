# FloodLens - AI-Powered Flood Prediction & Early Warning System

<div align="center">

[![SIH 2026](https://img.shields.io/badge/Smart%20India%20Hackathon-2026-blue)](https://sih2026.cdac.in/)
[![Python](https://img.shields.io/badge/Python-3.10+-yellow)](https://www.python.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-teal)](https://fastapi.tiangolo.com/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.0+-red)](https://pytorch.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.0-black?style=flat&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue?style=flat&logo=docker)](https://www.docker.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

**FloodLens — Umeed AI UI**
*AI-Powered Flood Prediction & Early Warning System for Hilly Regions*

</div>

---

## Overview

FloodLens is a multi-model AI ensemble system that predicts flood risk 2-48 hours in advance by combining four deep learning models into a single powerful prediction engine. Built for **SIH 2026** to protect rural and semi-urban communities in hilly terrain.

| Model | Purpose | Weight |
|-------|---------|--------|
| **LSTM** | Time-series temporal patterns | 40% |
| **XGBoost** | Residual error correction | 30% |
| **GNN** | Spatial sensor relationships | 20% |
| **PINN** | Physics-informed constraints | 10% |

> **Prediction Formula:** `Risk = LSTM×0.4 + XGBoost×0.3 + GNN×0.2 + PINN×0.1`

---

## ✨ Features

- 🎯 **Real-time Risk Scoring** — 8 IoT sensor inputs → 0-100 risk score with 5 severity levels
- 🤖 **4-Model Ensemble** — LSTM + XGBoost + GNN + PINN working together
- 🗺️ **Spatial Prediction** — GNN-based area-level flood mapping
- 📱 **Responsive Dashboard** — Dark theme glassmorphism UI with real-time monitoring
- 🚨 **Multi-Channel Alerts** — Configurable alert system with severity classification
- 🎮 **Demo Scenarios** — 6 pre-computed realistic flood scenarios
- 📊 **Ensemble Breakdown** — Visualize each model's contribution to the final prediction
- 🐳 **Docker-First** — One-command deployment for the entire stack

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     SYSTEM ARCHITECTURE                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    LAYER 6: Frontend                             │    │
│  │  ┌─────────────────────────────────────────────────────────┐    │    │
│  │  │        floodlens-ui — Next.js + Tailwind + Zustand      │    │    │
│  │  └─────────────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    LAYER 2-5: Backend                            │    │
│  │                                                                 │    │
│  │  Layer 1: IoT Sensors → Satellites → Weather Stations           │    │
│  │  Layer 2: MQTT Broker → API Gateway                             │    │
│  │  Layer 3: Supabase (PostgreSQL) + Firebase (FCM, Firestore)     │    │
│  │  Layer 4: LSTM + XGBoost + GNN + PINN = Ensemble               │    │
│  │  Layer 5: Risk Engine → Multi-Channel Alerts                    │    │
│  │                                                                 │    │
│  │  ┌──────────────────┐  ┌──────────────────┐                   │    │
│  │  │  ml-service      │  │  Node.js Backend │                   │    │
│  │  │  (Python/FastAPI)│  │  (Express/Supab.)│                   │    │
│  │  │  Port: 8000      │  │  Port: 3000      │                   │    │
│  │  └──────────────────┘  └──────────────────┘                   │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📂 Project Structure

```
Flood-Prediction-Model-/
├── floodlens-ui/                    # 🆕 Frontend (Next.js 15 + TypeScript + Tailwind)
│   ├── app/                         # App Router pages & API routes
│   │   ├── page.tsx                 # Landing page with risk overview
│   │   ├── layout.tsx               # Root layout with Navbar & Sidebar
│   │   ├── globals.css              # Tailwind base + custom styles
│   │   ├── (dashboard)/             # Protected dashboard routes
│   │   │   ├── dashboard/           # Real-time monitoring overview
│   │   │   ├── predictions/         # 8-input prediction form
│   │   │   ├── sensors/             # IoT sensor network grid
│   │   │   ├── alerts/              # Send & manage alerts
│   │   │   ├── demo/                # 6 pre-computed scenarios
│   │   │   ├── model/               # Ensemble architecture details
│   │   │   ├── map/                 # 3D flood map visualizer
│   │   │   └── admin/               # System admin panel
│   │   ├── settings/                # Configuration page
│   │   └── api/                     # Route handlers proxying to services
│   │       ├── ml/                  # Proxies to ML Service (port 8000)
│   │       └── backend/             # Proxies to Node Backend (port 3000)
│   ├── components/                  # Reusable UI components
│   │   ├── ui/                      # Button, Badge, Card, Input, Select
│   │   ├── layout/                  # Navbar, Sidebar, Footer
│   │   ├── dashboard/               # RiskGauge, SensorCard, AlertFeed
│   │   ├── prediction/              # PredictionForm, PredictionResult
│   │   ├── sensors/                 # SensorsGrid, SensorReadings
│   │   ├── alerts/                  # AlertForm, AlertHistory
│   │   └── demo/                    # ScenarioCard, ScenarioResults
│   ├── lib/                         # Core library modules
│   │   ├── types/                   # TypeScript interfaces
│   │   ├── api/                     # API clients (mlClient, backendClient)
│   │   ├── store/                   # Zustand stores (predictionStore, uiStore)
│   │   ├── utils/                   # Helpers, formatters, validators
│   │   └── constants/               # Risk levels, features, model weights
│   ├── hooks/                       # Custom React hooks
│   ├── public/                      # Static assets
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── next.config.js
│   ├── Dockerfile
│   └── README.md
├── ml-service/                      # Python ML Microservice
│   ├── app.py                       # FastAPI server
│   ├── models/
│   │   ├── flood_lstm.py
│   │   ├── xgboost_model.py
│   │   ├── pinn_gnn.py
│   │   └── ensemble.py
│   ├── services/
│   │   ├── predictor.py
│   │   └── data_processor.py
│   ├── pretrained/
│   ├── demo.py
│   ├── demo_data.py                 # 6 realistic flood scenarios
│   ├── setup_models.py
│   ├── requirements.txt
│   └── Dockerfile
├── flood-prediction-backend/        # Node.js Backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── supabase.js
│   │   │   └── firebase.js
│   │   ├── routes/
│   │   │   └── api.js
│   │   └── services/
│   │       ├── mlService.js
│   │       ├── supabaseService.js
│   │       └── firebaseService.js
│   ├── tests/
│   │   └── test-ml-integration.js
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml               # Multi-service orchestration
├── supabase-setup.sql               # Database schema
└── README.md
```

---

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
# Clone repository
git clone https://github.com/annms1876-glitch/Flood-Prediction-Model-.git
cd Flood-Prediction-Model-

# Start all services (ML + Backend + Frontend)
docker-compose up
```

The frontend will be available at **http://localhost:3001**  
Backend API at **http://localhost:3000**  
ML Service at **http://localhost:8000**

### Option 2: Manual Setup

**Frontend (Next.js):**
```bash
cd floodlens-ui
npm install
npm run dev          # Runs on http://localhost:3001
```

**Backend (Node.js):**
```bash
cd flood-prediction-backend
npm install
cp .env.example .env
# Edit .env with your Supabase/Firebase credentials
npm run dev          # Runs on http://localhost:3000
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

## 🌐 API Endpoints

### ML Service (Port 8000)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check with model status |
| `/model/info` | GET | Architecture details |
| `/predict` | POST | Single location prediction |
| `/predict/rule-based` | POST | Rule-based fallback prediction |
| `/demo/scenarios` | GET | List all demo scenarios |
| `/demo/predict/{name}` | GET | Run specific scenario |
| `/demo/run-all` | POST | Run all scenarios |

### Node Backend (Port 3000)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Service health check |
| `/api/readings` | GET/POST | List or insert sensor readings |
| `/api/readings/:location` | GET | Get readings by location |
| `/api/risk` | GET | Calculate risk score |
| `/api/risk/ml` | GET | ML-based risk calculation |
| `/api/ml/predict` | POST | ML prediction for location |
| `/api/ml/predict/batch` | POST | Batch prediction for multiple locations |
| `/api/alerts/send` | POST | Send flood alerts |

---

## 🎨 Frontend Pages

| Page | Route | Description |
|------|-------|-------------|
| **Home** | `/` | Landing with risk legend & overview |
| **Dashboard** | `/dashboard` | Real-time risk gauge, sensors, alerts |
| **Predict** | `/predict` | 8-input prediction form with ensemble results |
| **Spatial** | `/predict/spatial` | GNN-based area-level flood mapping |
| **Sensors** | `/sensors` | IoT sensor network monitoring |
| **Alerts** | `/alerts` | Send & manage flood alerts |
| **Demo** | `/demo` | 6 pre-computed flood scenarios |
| **Model** | `/model` | LSTM/XGBoost/GNN/PINN architecture |
| **Map** | `/map` | 3D flood map with terrain |
| **Settings** | `/settings` | API configuration |

---

## ⚠️ Risk Classification

| Score | Level | Action | Color |
|-------|-------|--------|-------|
| 80-100 | 🔴 Critical | Immediate evacuation | `#7f1d1d` |
| 60-79 | 🟠 High | Prepare for flooding | `#ef4444` |
| 40-59 | 🟡 Warning | Monitor closely | `#f97316` |
| 20-39 | 🟢 Watch | Stay alert | `#eab308` |
| 0-19 | ✅ Normal | No action needed | `#22c55e` |

---

## 🎮 Demo Scenarios

| Scenario | Risk Score | Description |
|----------|------------|-------------|
| Normal Day | 12/100 | Baseline conditions |
| Light Rainfall | 35/100 | Rising water levels |
| Heavy Rainfall | 68/100 | Warning conditions |
| Critical Alert | 92/100 | Evacuation needed |
| Hilly Region | 78/100 | Landslide risk |
| Multi-Village | 71/100 | Downstream impact |

---

## 📊 Input Features

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

## 🗄️ Database Schema

Tables created by `supabase-setup.sql`:

1. **sensors** - IoT sensor device information
2. **sensor_readings** - Time-series sensor data
3. **predictions** - ML model flood predictions
4. **alerts** - Flood alert records
5. **alert_logs** - Audit trail for delivery
6. **community_members** - Notification subscribers

---

## 🛠️ Technologies

**Frontend:**
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS 3
- Zustand (State Management)
- Lucide React (Icons)

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

## 🧪 Testing

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

## ⚙️ Environment Variables

**Frontend (`.env.local`):**
```env
NEXT_PUBLIC_ML_URL=http://localhost:8000
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
```

**Backend (`.env`):**
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

## 📦 Deployment

### Local Development
```bash
docker-compose up                  # All services
cd floodlens-ui && npm run dev     # Frontend only
cd flood-prediction-backend && npm run dev  # Backend only
cd ml-service && python app.py     # ML service only
```

### Production
```bash
# Docker
docker-compose -f docker-compose.yml up -d

# Or platform-as-a-service
# Vercel (Frontend) · Railway (Backend) · Hugging Face (ML)
```

---

## 📜 License

ISC License — See [LICENSE](LICENSE)

---

## 👥 Team

**annms1876-glitch**
- GitHub: [@annms1876-glitch](https://github.com/annms1876-glitch)
- Project: [FloodLens](https://github.com/annms1876-glitch/Flood-Prediction-Model-)

---

## 🙏 Acknowledgments

- [floodcast](https://github.com/sridipbasu/floodcast) - LSTM+XGBoost architecture reference
- [Supabase](https://supabase.com/) - Database backend
- [Firebase](https://firebase.google.com/) - Push notifications
- [PyTorch](https://pytorch.org/) - Deep learning framework
- [FastAPI](https://fastapi.tiangolo.com/) - Python API framework
- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [SIH 2026](https://sih2026.cdac.in/) - Smart India Hackathon
