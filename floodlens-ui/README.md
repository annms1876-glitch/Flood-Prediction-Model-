# FloodLens UI — Umeed AI

AI-Powered Flood Prediction & Early Warning System Frontend

## Overview

The `floodlens-ui` frontend connects to the FloodLens backend stack:
- **ML Service** (Python/FastAPI, port 8000) — LSTM + XGBoost + GNN + PINN ensemble
- **Node Backend** (Express/Supabase/Firebase, port 3000) — Sensor data, alerts, predictions

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **UI Components**: Custom design system with glassmorphism

## Quick Start

```bash
# Install dependencies
npm install

# Run dev server
npm run dev
```

The frontend runs on **http://localhost:3001** and auto-proxies API requests to:
- ML Service: `http://localhost:8000`
- Backend: `http://localhost:3000`

## Docker

```bash
# Start all services (ML + Backend + Frontend)
docker-compose up
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with risk overview |
| `/dashboard` | Real-time monitoring dashboard |
| `/predict` | Manual flood prediction |
| `/predict/spatial` | GNN spatial prediction |
| `/sensors` | IoT sensor network |
| `/alerts` | Send and manage alerts |
| `/demo` | Pre-computed scenarios |
| `/model` | Ensemble architecture details |
| `/settings` | Configuration |

## API Integration

All API requests are proxied through Next.js route handlers in `app/api/`:
- `/api/ml/*` → ML Service
- `/api/backend/*` → Node Backend
