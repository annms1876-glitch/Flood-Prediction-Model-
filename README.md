# Umeed AI

### Open flood intelligence for safer communities

<div align="center">

[![Live Demo](https://img.shields.io/badge/live_demo-umeed--ai--delta.vercel.app-f9a600?style=for-the-badge)](https://umeed-ai-delta.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-15-261b07?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-auth%20%7C%20push-ffca28?style=for-the-badge&logo=firebase&logoColor=261b07)](https://firebase.google.com/)
[![Python](https://img.shields.io/badge/Python-3.10%2B-f2c14e?style=for-the-badge&logo=python&logoColor=261b07)](https://www.python.org/)

**A flood-monitoring, early-warning, and emergency coordination platform for hilly regions.**

[Open the live frontend](https://umeed-ai-delta.vercel.app/) · [Explore the code](https://github.com/annms1876-glitch/Flood-Prediction-Model-) · [Report an issue](https://github.com/annms1876-glitch/Flood-Prediction-Model-/issues)

</div>

> **Umeed** means hope. Better information, delivered earlier, gives communities more time to act.

![Umeed AI SOS emergency interface](floodlens-ui/docs/screenshots/umeed-ai-sos.webp)

## Why Umeed AI?

Umeed AI connects flood prediction, local risk context, interactive evacuation guidance, sensor telemetry, emergency broadcasts, and SOS rescue triage in one operational workspace. It is designed to serve both residents who need clear next steps and authorized coordinators who need a live view of incidents and response capacity.

The system combines an ensemble of **LSTM**, **XGBoost**, **GNN**, and **PINN** models with a Next.js interface, Firebase authentication and messaging, Firestore incident storage, and optional backend/ML services.

## Platform capabilities

| Area | Included functionality |
|---|---|
| **Resident overview** | Local risk, weather context, sensor connectivity, preparedness actions, and emergency contacts. |
| **3D evacuation map** | Terrain visualization, flood-level controls, hazard layers, safe routes, and animated escape guidance. |
| **Advanced analytics** | Read-only admin charts for hydrographs, forecast trends, rainfall/runoff response, sensor health, risk comparison, radar factors, and model contribution. |
| **Sensor telemetry** | Station status, readings, connectivity, and network health. |
| **Alert dispatch** | Coordinator-facing CAP-style alert composition and Firebase Cloud Messaging broadcast. |
| **Background notifications** | Firebase service worker support for browser notifications when the app is not focused. |
| **Voice alert experience** | Foreground public-domain siren playback plus browser speech synthesis where browser policy permits. |
| **SOS beacon** | Location, household size, hazards, medical notes, rescue dispatch, and immediate siren trigger from the SOS tap. |
| **Incident triage** | Firestore-backed SOS incidents automatically synchronized into the Command Centre every 10 seconds. |
| **Authentication** | Email/password and direct Google popup authentication with Firebase Auth. |
| **Localization and themes** | English/Hindi controls and light/dark operational themes. |

## Architecture

```mermaid
flowchart LR
    Resident[Resident browser / PWA]
    Admin[Emergency coordinator]
    UI[Next.js App Router\nUmeed AI frontend]
    Auth[Firebase Auth\nEmail + Google popup]
    Push[Firebase Cloud Messaging\nWeb Push + service worker]
    API[Next.js API routes]
    Firestore[(Firestore\nSOS incidents + subscriptions)]
    ML[ML services\nLSTM · XGBoost · GNN · PINN]
    Maps[Maps + 3D terrain]
    Analytics[Read-only admin analytics]
    Escalation[Optional SMS / phone / native push]

    Resident --> UI
    Admin --> UI
    UI --> Auth
    UI --> Maps
    UI --> Analytics
    UI --> API
    API --> Firestore
    API --> ML
    Admin -->|compose critical alert| API
    API --> Push
    Push --> Resident
    UI -->|tap SOS beacon| API
    API -->|persist incident| Firestore
    Firestore -->|poll + triage sync| Analytics
    Push -.->|extreme alert fallback| Escalation
```

## Repository map

```text
Flood-Prediction-Model-/
├── floodlens-ui/                 # Umeed AI Next.js frontend
│   ├── app/                      # Pages and API routes
│   ├── components/               # Map, auth, analytics, dashboard, and layout UI
│   ├── lib/                      # Firebase, notifications, state, and data helpers
│   ├── public/                   # Service worker, logo, and emergency audio
│   └── docs/screenshots/          # README preview assets
├── ml-service/                   # Python/FastAPI prediction service
├── flood-prediction-backend/     # Node.js backend and data integrations
├── docker-compose.yml             # Multi-service local orchestration
├── firestore.rules                # Firestore security rules
├── firebase-blueprint.json        # Firebase project blueprint
└── README.md                      # Canonical project documentation
```

The directory name `floodlens-ui` is retained as a workspace path for compatibility with existing scripts and deployment configuration. The product and user-facing project name is **Umeed AI**.

## Quick start

### Requirements

- Node.js 20+
- npm 10+
- Python 3.10+ for the ML service
- Firebase project for authentication, Firestore, and web messaging
- Docker Desktop, if using the multi-service setup

### Frontend only

```bash
git clone https://github.com/annms1876-glitch/Flood-Prediction-Model-.git
cd Flood-Prediction-Model-
npm install
npm run dev
```

The frontend runs at [http://localhost:3001](http://localhost:3001) when using the workspace scripts.

### Full local stack

```bash
docker-compose up
```

Typical services:

| Service | Local port | Role |
|---|---:|---|
| Umeed AI frontend | `3001` | Resident and admin web interface |
| Node backend | `3000` | Data and integration API |
| ML service | `8000` | Flood prediction and model endpoints |

### Manual service setup

```bash
# Frontend
cd floodlens-ui
npm install
npm run dev

# Node backend
cd ../flood-prediction-backend
npm install
npm run dev

# ML service
cd ../ml-service
pip install -r requirements.txt
python setup_models.py
python -m uvicorn app:app --reload --port 8000
```

Run the frontend typecheck with:

```bash
cd floodlens-ui
npm run lint
```

## Environment variables

Create `floodlens-ui/.env.local` for local development. Public Firebase browser configuration can be used by the client; private Admin credentials must remain server-only.

```env
# Browser push
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_web_push_vapid_key

# Firebase Admin server credentials
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@your_project_id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"

# Optional AI analytics
GEMINI_API_KEY=your_gemini_api_key
```

For Vercel, add these values under Project Settings → Environment Variables. Never commit private keys or real resident information.

## Important flows

### Emergency alert broadcast

1. An authorized coordinator composes a warning in **Alert Dispatch**.
2. The protected API verifies the Firebase ID token and administrator role.
3. Firebase Cloud Messaging broadcasts to registered browser tokens.
4. The service worker displays a persistent notification in the background.
5. Foreground clients can play the emergency siren and browser TTS.
6. Clicking the notification returns the user to the alert workflow.

A browser cannot guarantee arbitrary custom audio when its process is fully closed. For production life-safety use, pair browser notifications with a native app, SMS provider, or automated voice-call escalation.

### SOS and Command Centre triage

1. A resident taps the SOS beacon.
2. The emergency siren begins from the user gesture where browser policy permits.
3. Location, dependents, hazards, and medical notes are submitted to `/api/sos`.
4. The incident is persisted under the Firestore `sosIncidents` collection.
5. The Command Centre polls for new records and merges them into **Emergency SOS Incident Triage**.
6. Coordinators can move an incident through dispatched, in-rescue, and resolved states.

## Main routes

| Route | Audience | Purpose |
|---|---|---|
| `/` | Everyone | Local risk overview |
| `/3d-map-view` | Everyone | Interactive flood and evacuation map |
| `/sos-emergency` | Everyone | Distress beacon and rescue workflow |
| `/safety-tips` | Everyone | Preparedness guidance |
| `/admin-dashboard` | Coordinators | Command Centre and SOS triage |
| `/alert-management` | Coordinators | Alert composition and dispatch |
| `/risk-analytics` | Admin | Locked multi-chart analytics |
| `/evacuation-tracker` | Operations | Evacuation and shelter tracking |
| `/sensor-network` | Operations | Sensor telemetry and health |

## Open-source audio attribution

The foreground emergency siren is stored at `floodlens-ui/public/audio/umeed-emergency-siren.mp3`. It was converted from the Wikimedia Commons recording **“Alarm or siren”**, authored by `stephan` and released into the public domain. The source and license record are stored in `floodlens-ui/public/audio/umeed-emergency-siren.source.txt`.

## Contributing

Contributions are welcome. Please open an issue before large changes so proposals remain connected to flood safety, accessibility, and operational reliability.

When opening a pull request:

- Keep emergency states obvious and readable.
- Do not rely on color alone to communicate severity.
- Preserve the distinction between resident and admin workflows.
- Never commit Firebase Admin keys, private credentials, or real resident data.
- Add validation for new API routes and data flows.
- Document new environment variables and deployment requirements.

## Safety note

Umeed AI is an open-source software project and must be validated with local disaster-management authorities before use in a real emergency operation. Browser permissions, push delivery, speech synthesis, GPS, network connectivity, and third-party services can fail. Production deployments should include independent communication channels, audit logs, access control, monitoring, and human dispatch procedures.

## License

This repository is intended for open-source collaboration. Add the project’s preferred SPDX license file and copyright holder before publishing an official release.

## Links

- **Live frontend:** [umeed-ai-delta.vercel.app](https://umeed-ai-delta.vercel.app/)
- **GitHub repository:** [annms1876-glitch/Flood-Prediction-Model-](https://github.com/annms1876-glitch/Flood-Prediction-Model-)
- **Frontend documentation:** [`floodlens-ui/README.md`](floodlens-ui/README.md)
