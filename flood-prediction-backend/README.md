# Flood Prediction Backend API

Backend API service for the **Complete Flood Prediction System**. This Node.js/Express server handles sensor data ingestion, flood risk predictions, alert notifications via Firebase Cloud Messaging (FCM), and real-time dashboard data.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-lightblue.svg)](https://expressjs.com/)
[![Supabase](https://img.shields.io/badge/Supabase-2.x-orange.svg)](https://supabase.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Admin-yellow.svg)](https://firebase.google.com/)

---

## 📋 Table of Contents

- [Features](#features)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [Database Setup](#database-setup)
- [Firebase Setup](#firebase-setup)
- [Environment Variables](#environment-variables)
- [Testing](#testing)
- [Deployment](#deployment)
- [Security](#security)
- [License](#license)

---

## ✨ Features

- **📡 Sensor Data Management** - Receive and store IoT sensor readings (water level, rainfall, soil moisture, temperature)
- **🌊 Flood Risk Predictions** - Store and serve ML model predictions with risk scores
- **🔔 Alert Notification System** - Send multi-channel alerts via Firebase Cloud Messaging (FCM)
- **📊 Dashboard API** - Provide summarized risk data for admin dashboard visualization
- **🔄 Real-time Data Support** - Firestore integration for live dashboard updates
- **🛡️ Row Level Security** - Supabase RLS policies for data protection

---

## 🏗️ System Architecture

This backend is part of a multi-layered flood prediction system:

```
Layer 1: Data Acquisition (IoT Sensors, Satellite, Weather Stations)
    ↓
Layer 2: Data Ingestion & Communication (MQTT Broker, API Gateway) ← THIS SERVICE
    ↓
Layer 3: Data Processing & Storage (Cleaning, Feature Engineering, Databases)
    ↓
Layer 4: AI/ML Prediction Engine (LSTM, XGBoost, GNN, Ensemble)
    ↓
Layer 5: Alert & Decision Support (Risk Engine, Multi-Channel Dispatcher)
    ↓
Layer 6: Application & Visualization (Admin Dashboard, Mobile App, 3D Map)
```

### Data Flow

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

---

## 📁 Project Structure

```
flood-prediction-backend/
├── src/
│   ├── config/
│   │   ├── supabase.js         # Supabase client configuration
│   │   └── firebase.js         # Firebase Admin SDK initialization
│   ├── routes/
│   │   └── api.js              # Express route definitions
│   ├── services/
│   │   ├── supabaseService.js  # Database operations layer
│   │   └── firebaseService.js  # Push notification services
│   └── app.js                  # Main application entry point
├── config/
│   └── service-account.json    # Firebase service account (gitignored)
├── scripts/
│   └── setup-firebase.js       # Firebase setup helper script
├── .env                        # Environment variables (gitignored)
├── .env.example                # Example env file (safe to commit)
├── .gitignore                  # Git ignore rules
├── package.json                # Project dependencies & scripts
├── supabase-setup.sql          # Database schema SQL
├── ENV_SETUP.md                # Environment setup guide
└── README.md                   # This file
```

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/annms1876-glitch/Flood-Prediction-Model-.git
cd Flood-Prediction-Model-

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your credentials

# Start development server
npm run dev
```

---

## 📦 Installation

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- **Supabase** project (free tier available)
- **Firebase** project (optional, for push notifications)

### Step 1: Install Dependencies

```bash
npm install
```

This installs:
- `express` - Web server framework
- `dotenv` - Environment variable loading
- `cors` - Cross-origin resource sharing
- `@supabase/supabase-js` - Supabase database client
- `firebase-admin` - Firebase backend SDK
- `nodemon` - Development auto-restart (dev dependency)

### Step 2: Configure Environment

```bash
# Copy example configuration
cp .env.example .env.local

# Edit with your credentials
# (Use any text editor: nano, vim, VS Code, etc.)
nano .env.local
```

**Required:**
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key

**Optional (for push notifications):**
- `FIREBASE_PROJECT_ID` - Firebase project ID
- `FIREBASE_CREDENTIAL_PATH` - Path to service account JSON

### Step 3: Set Up Database

Run the SQL schema in your Supabase project:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project → **SQL Editor**
3. Open `supabase-setup.sql` and copy its contents
4. Paste into SQL Editor and click **Run**

Or use the command line:

```bash
# Using Supabase CLI (if installed)
supabase db push

# Or manually via psql
psql -h your-project.supabase.co -U postgres -d postgres -f supabase-setup.sql
```

### Step 4: Start the Server

```bash
# Development mode (auto-restart on changes)
npm run dev

# Production mode
npm start
```

Server will start on `http://localhost:3000` (default port).

---

## ⚙️ Configuration

### Environment Variables

Create `.env.local` with the following:

```env
# Server
PORT=3000
NODE_ENV=development

# Supabase (REQUIRED)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key-here

# Firebase (OPTIONAL)
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CREDENTIAL_PATH=./config/service-account.json

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080

# Alerts
DEFAULT_ALERT_THRESHOLD=50
ALERT_CHANNELS=fcm

# Logging
LOG_LEVEL=info
```

See [ENV_SETUP.md](./ENV_SETUP.md) for detailed configuration instructions.

### Firebase Setup (Optional)

For push notifications and Firestore:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project → **Settings** (gear icon) → **Project Settings**
3. Go to **Service Accounts** tab
4. Click **Generate New Private Key**
5. Save the JSON file as `config/service-account.json`
6. Update `.env.local` with your project ID

Or use the setup script:

```bash
npm run firebase:setup    # Interactive setup guide
npm run firebase:check    # Verify configuration
```

---

## 🔌 API Endpoints

### Base URL
```
http://localhost:3000/api
```

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Check service and database connectivity |

**Response:**
```json
{
  "status": "healthy",
  "services": {
    "supabase": true,
    "firebase": true
  },
  "timestamp": "2026-09-06T10:00:00.000Z"
}
```

### Sensors

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/sensors` | List all active sensors |
| GET | `/sensors/:location/readings` | Get readings for a location |
| POST | `/sensors/readings` | Insert new sensor reading |
| GET | `/sensors/:id` | Get sensor by ID |

**Example: Get sensor readings**
```bash
curl http://localhost:3000/api/sensors/village-a/readings?limit=50
```

### Predictions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/predictions` | Get flood predictions above threshold |
| POST | `/predictions` | Create new prediction record |

**Query Parameters:**
- `min_risk` - Minimum risk score to filter (default: 50)

### Alerts

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/alerts/send` | Send flood alert notifications |

**Example: Send alert**
```bash
curl -X POST http://localhost:3000/api/alerts/send \
  -H "Content-Type: application/json" \
  -d '{
    "tokens": ["device_token_1", "device_token_2"],
    "alert_data": {
      "risk_level": "warning",
      "location": "Village A",
      "message": "Flood warning issued"
    }
  }'
```

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard/summary` | Get risk summary for dashboard |

**Response:**
```json
{
  "success": true,
  "data": {
    "total_alerts": 5,
    "critical": 1,
    "high": 2,
    "warning": 2,
    "watch": 0,
    "locations": 3
  }
}
```

---

## 🗄️ Database Setup

### Tables Created

The `supabase-setup.sql` file creates:

1. **sensors** - IoT sensor device information
2. **sensor_readings** - Time-series sensor data
3. **predictions** - ML model flood risk predictions
4. **alerts** - Flood alert records and dispatch history
5. **alert_logs** - Detailed audit trail for alert delivery
6. **community_members** - Notification subscribers

### Row Level Security (RLS)

All tables have RLS enabled with appropriate policies:
- Public read access for sensor data and predictions
- Service role access for write operations
- User-owned data access for community members

### Indexes

Performance indexes are created on:
- `sensor_readings(sensor_id, recorded_at)` - Time-series queries
- `predictions(location, risk_score)` - Risk analysis
- `alerts(severity, sent_at)` - Alert management

---

## 🔥 Firebase Setup

### Quick Setup

```bash
# Run interactive setup guide
npm run firebase:setup

# Check current configuration
npm run firebase:check
```

### Manual Setup

1. **Get Service Account Key:**
   - Firebase Console → Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Save as `config/service-account.json`

2. **Configure Environment:**
   ```env
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CREDENTIAL_PATH=./config/service-account.json
   ```

3. **Verify:**
   ```bash
   npm run firebase:check
   ```

### Firebase Services Used

| Service | Purpose |
|---------|---------|
| **Cloud Messaging (FCM)** | Push notifications to mobile apps |
| **Firestore** | Real-time database for alert logs |

---

## 🌍 Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3000` | Server port |
| `NODE_ENV` | No | `development` | Environment mode |
| `SUPABASE_URL` | **Yes** | - | Supabase project URL |
| `SUPABASE_ANON_KEY` | **Yes** | - | Supabase anonymous key |
| `FIREBASE_PROJECT_ID` | No | - | Firebase project ID |
| `FIREBASE_CREDENTIAL_PATH` | No | - | Path to service account JSON |
| `FIREBASE_CREDENTIAL_JSON` | No | - | JSON credentials (alternative) |
| `ALLOWED_ORIGINS` | No | `*` | CORS allowed origins |
| `DEFAULT_ALERT_THRESHOLD` | No | `50` | Alert trigger threshold |
| `ALERT_CHANNELS` | No | `fcm` | Alert channels |
| `LOG_LEVEL` | No | `info` | Logging verbosity |

---

## 🧪 Testing

### System Tests

Run the comprehensive system test suite:

```bash
# Run all system tests (Supabase, Firebase, API, Realtime, Storage)
npm run test:system

# Run integration tests with simulator
npm run test:integration

# Run demo mode (generates data and shows alerts)
npm run test:demo

# Start data simulator only
npm run simulate
```

### Test Coverage

The test suite verifies:

1. **Supabase Connection**
   - Client initialization
   - Database connectivity
   - Query execution

2. **Firebase Authentication**
   - SDK configuration
   - Auth instance availability

3. **API Endpoints**
   - GET / - Health check
   - GET /api/health - Detailed health (DB + services)
   - GET /api - API documentation
   - GET /api/readings - Get latest readings
   - GET /api/risk - Risk calculation
   - GET /api/subscription/health - Realtime subscription status

4. **Real-time Subscriptions**
   - Subscription establishment
   - Event reception on INSERT
   - Risk calculation trigger

5. **Data Storage**
   - Insert sensor readings
   - Fetch latest readings
   - Query by location
   - Calculate statistics

### Manual Testing with curl

```bash
# Health check
curl http://localhost:3000/api/health

# Get latest readings
curl http://localhost:3000/api/readings?limit=10

# Get readings by location
curl http://localhost:3000/api/readings/village_a?limit=5

# Calculate risk score
curl http://localhost:3000/api/risk

# Check subscription status
curl http://localhost:3000/api/subscription/health
```

### Data Simulator

The data simulator generates realistic mock sensor data for testing:

```bash
# Start server + simulator
npm run test:integration

# Or just the simulator
npm run simulate
```

**Simulated Data:**
- Rainfall: 0-50 mm (storm: 25-400 mm)
- Water Level: 0.5-8 m (storm: 1.5-20 m)
- Soil Moisture: 20-90% (storm: 60-126%)
- Tilt: 0-2° (storm: 0.5-3°)
- Temperature: 18-30°C (storm: 16-22°C)
- Humidity: 40-90% (storm: 70-117%)
- **10% chance of storm conditions**

### Test Output

When running tests, you'll see:

```
📡 Sensor Reading #1
Location: village_a
Timestamp: 2026-09-06T12:00:00Z
──────────────────────────────────────────────────
Rainfall: 12.5 mm
Water Level: 2.34 m
Soil Moisture: 65%
Tilt: 0.85°
Temperature: 25.3°C
Humidity: 70%
──────────────────────────────────────────────────

📊 Risk Assessment - village_a:
   Score: 45/100 (warning)
   Trend: stable (No significant change)

⚠️  WARNING ALERT - Conditions should be monitored
   Alert sent via: console
============================================================
```

### Alert Summary

At the end of tests, you'll see a summary:

```
══════════════════════════════════════════════════════════════════════
🚨 ALERT SUMMARY
══════════════════════════════════════════════════════════════════════
Critical Alerts: 2 🚨
High Alerts: 5 🚨
Warning Alerts: 12 ⚠️
Sensor Readings: 20
Storms Detected: 3 ⛈️
Successful Insertions: 20 ✅
Insert Errors: 0 ❌
══════════════════════════════════════════════════════════════════════
```

### Unit Tests

```bash
# Run unit tests with coverage
npm test

# Run with watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Using Postman

1. Import the API endpoints
2. Set base URL to `http://localhost:3000/api`
3. Test each endpoint
4. Use Authorization tab for Firebase token (if testing protected routes)

---

## 🚢 Deployment

### Local Development

```bash
npm run dev
```

Server runs on `http://localhost:3000` with auto-restart.

### Production Deployment

#### Option 1: Node.js Server

```bash
# Build (if needed)
npm install --production

# Set environment variables
export NODE_ENV=production
export PORT=3000
# ... other env vars

# Start
npm start
```

#### Option 2: Docker

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t flood-prediction-backend .
docker run -p 3000:3000 \
  -e SUPABASE_URL=... \
  -e SUPABASE_ANON_KEY=... \
  flood-prediction-backend
```

#### Option 3: Platform as a Service

**Heroku:**
```bash
heroku create your-app-name
heroku config:set SUPABASE_URL=...
heroku config:set SUPABASE_ANON_KEY=...
git push heroku master
```

**Railway/Vercel/Netlify:**
- Connect GitHub repository
- Add environment variables in dashboard
- Deploy

---

## 🔒 Security

### Best Practices

✅ ** DO:**
- Use `.env.local` for local secrets (gitignored)
- Use environment variables in production
- Enable Supabase Row Level Security (RLS)
- Use Firebase security rules for Firestore
- Rotate keys and credentials periodically
- Use HTTPS in production
- Implement rate limiting for production

❌ ** DON'T:**
- Commit `.env` or `.env.local` to Git
- Share service account keys publicly
- Use production credentials in development
- Hardcode credentials in source code
- Expose service role keys to clients

### Environment Security

```bash
# .gitignore protects these files
.env
.env.local
.env.*.local
config/service-account.json
node_modules/
```

---

## 📊 Risk Level Classification

| Risk Score | Level | Description |
|------------|-------|-------------|
| 80-100 | 🔴 Critical | Immediate evacuation may be required |
| 60-79 | 🟠 High | Prepare for potential flooding |
| 40-59 | 🟡 Warning | Monitor conditions closely |
| 20-39 | 🟢 Watch | Conditions favorable for flooding |
| 0-19 | ⚪ Normal | No significant risk |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation update
- `style:` - Code style change
- `refactor:` - Code refactoring
- `test:` - Test addition/modification
- `chore:` - Maintenance tasks

---

## 📄 License

ISC License

---

## 👥 Author

**annms1876-glitch**

- GitHub: [@annms1876-glitch](https://github.com/annms1876-glitch)

---

## 🙏 Acknowledgments

- [Supabase](https://supabase.com/) - Database backend
- [Firebase](https://firebase.google.com/) - Push notifications
- [Express.js](https://expressjs.com/) - Web framework
- [Node.js](https://nodejs.org/) - Runtime environment

---

## 📞 Support

For issues and questions:

1. Check [ENV_SETUP.md](./ENV_SETUP.md) for configuration help
2. Review API endpoints in this README
3. Open an issue on GitHub

---

**Happy Coding!** 🚀
