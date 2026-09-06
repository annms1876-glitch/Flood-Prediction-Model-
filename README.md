# Flood Prediction Backend

Backend API service for the Complete Flood Prediction System. This Node.js/Express server handles sensor data ingestion, flood risk predictions, and alert notifications.

## System Architecture Context

This backend is part of a multi-layered flood prediction system:

```
Layer 1: Data Acquisition (IoT Sensors, Satellite, Weather Stations)
    ↓
Layer 2: Data Ingestion & Communication (MQTT Broker, API Gateway) ← This Backend
    ↓
Layer 3: Data Processing & Storage (Cleaning, Feature Engineering, Databases)
    ↓
Layer 4: AI/ML Prediction Engine (LSTM, XGBoost, GNN, Ensemble)
    ↓
Layer 5: Alert & Decision Support (Risk Engine, Multi-Channel Dispatcher)
    ↓
Layer 6: Application & Visualization (Admin Dashboard, Mobile App, 3D Map)
```

## Features

- **Sensor Data Management**: Receive and store IoT sensor readings (water level, rainfall, soil moisture, temperature)
- **Flood Risk Predictions**: Store and serve ML model predictions with risk scores
- **Alert Notification System**: Send multi-channel alerts via Firebase Cloud Messaging (FCM)
- **Dashboard API**: Provide summarized risk data for admin dashboard visualization
- **Real-time Data Support**: Firestore integration for live dashboard updates

## Project Structure

```
flood-prediction-backend/
├── src/
│   ├── config/
│   │   ├── supabase.js     # Supabase database client configuration
│   │   └── firebase.js     # Firebase Admin SDK configuration
│   ├── routes/
│   │   └── api.js          # Express route definitions
│   ├── services/
│   │   ├── supabaseService.js  # Database operations layer
│   │   └── firebaseService.js  # Notification services layer
│   └── app.js              # Main application entry point
├── .env                    # Environment variables (do not commit)
├── package.json
└── README.md
```

## API Endpoints

### Health Check
- `GET /api/health` - Check service and database connectivity

### Sensors
- `GET /api/sensors` - List all active sensors
- `GET /api/sensors/:location/readings` - Get sensor readings for a location
- `POST /api/sensors/readings` - Insert new sensor reading
- `GET /api/sensors/:id` - Get sensor by ID

### Predictions
- `GET /api/predictions` - Get flood predictions above threshold
- `POST /api/predictions` - Create new prediction record

### Alerts
- `POST /api/alerts/send` - Send flood alert notifications

### Dashboard
- `GET /api/dashboard/summary` - Get risk summary for dashboard

## Environment Setup

See [ENV_SETUP.md](./ENV_SETUP.md) for detailed configuration instructions.

### Quick Setup

```bash
# Copy example to .env.local
cp .env.example .env.local

# Edit with your credentials
# (Open in editor of your choice)

# Install dependencies
npm install

# Verify Firebase configuration (optional)
npm run firebase:check

# Start server
npm run dev
```

## Setup

### 1. Install Dependencies

```bash
cd flood-prediction-backend
npm install express dotenv @supabase/supabase-js firebase-admin
```

### 2. Configure Environment

Copy `.env` and fill in your credentials:

```bash
cp .env .env.local
```

**Required variables:**
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anon key

**For push notifications (Firebase):**

#### Option A: Service Account JSON File
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project → **Project Settings** (gear icon)
3. Go to **Service Accounts** tab
4. Click **Generate New Private Key**
5. Save the JSON file as `config/service-account.json`
6. Set in `.env`:
   ```env
   FIREBASE_CREDENTIAL_PATH=./config/service-account.json
   FIREBASE_PROJECT_ID=your-project-id
   ```

#### Option B: Environment Variable (for Docker/production)
1. Copy the JSON content from service account key
2. Set as environment variable:
   ```env
   FIREBASE_CREDENTIAL_JSON={"type":"service_account","project_id":"...","private_key_id":"...","private_key":"...","client_email":"...","client_id":"..."}
   FIREBASE_PROJECT_ID=your-project-id
   ```

**Required Firebase variables:**
- `FIREBASE_PROJECT_ID` - Your Firebase project ID (from Console URL)

### 3. Install Firebase Admin SDK

For push notifications and Firestore access, install the Admin SDK:

```bash
npm install firebase-admin
```

#### Quick Setup Script

Use the interactive setup helper:

```bash
# Guided setup
npm run firebase:setup

# Check configuration
npm run firebase:check
```

### 4. Database Setup

Create the following tables in your Supabase project:

```sql
-- Sensors table
CREATE TABLE sensors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  sensor_type TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  last_reading_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sensor readings table
CREATE TABLE sensor_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sensor_id UUID REFERENCES sensors(id),
  water_level NUMERIC,
  rainfall NUMERIC,
  soil_moisture NUMERIC,
  temperature NUMERIC,
  location TEXT NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Predictions table
CREATE TABLE predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location TEXT NOT NULL,
  risk_score INTEGER NOT NULL,
  risk_level TEXT NOT NULL,
  water_level NUMERIC,
  confidence NUMERIC,
  predicted_at TIMESTAMPTZ DEFAULT NOW(),
  model_version TEXT
);

-- Alert logs table (for audit trail)
CREATE TABLE alert_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  risk_level TEXT,
  location TEXT,
  tokens_count INTEGER,
  success_count INTEGER,
  failure_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE sensors ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_logs ENABLE ROW LEVEL SECURITY;
```

### 4. Run the Server

```bash
# Development
npm run dev

# Production
npm start
```

## Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ IoT Sensors │────▶│ MQTT Broker │────▶│ API Gateway │────▶│ This Backend│
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                                              │
                            ┌─────────────────────────────────┘
                            ▼
                    ┌─────────────┐     ┌─────────────┐
                    │  Supabase   │────▶│   ML Models │
                    │  (Storage)  │     │   (Analysis)│
                    └─────────────┘     └─────────────┘
                            │
                            ▼
                    ┌─────────────┐     ┌─────────────┐
                    │  Firebase   │────▶│   Mobile    │
                    │ (Notifications)│   │     App     │
                    └─────────────┘     └─────────────┘
```

## Risk Level Classification

| Risk Score | Level | Description |
|------------|-------|-------------|
| 80-100 | Critical | Immediate evacuation may be required |
| 60-79 | High | Prepare for potential flooding |
| 40-59 | Warning | Monitor conditions closely |
| 20-39 | Watch | Conditions favorable for flooding |
| 0-19 | Normal | No significant risk |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| PORT | No | Server port (default: 3000) |
| NODE_ENV | No | Environment mode |
| SUPABASE_URL | Yes | Supabase project URL |
| SUPABASE_ANON_KEY | Yes | Supabase anonymous key |
| FIREBASE_PROJECT_ID | No | Firebase project ID |
| FIREBASE_CREDENTIAL_PATH | No | Path to service-account.json file |
| FIREBASE_CREDENTIAL_JSON | No | JSON string of service account credentials (alternative) |
| ALLOWED_ORIGINS | No | CORS allowed origins |

## License

ISC
