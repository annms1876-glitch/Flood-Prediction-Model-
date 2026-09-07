# Umeed AI

### Open flood intelligence for safer communities

<div align="center">

[![Live Demo](https://img.shields.io/badge/live_demo-umeed--ai--delta.vercel.app-f9a600?style=for-the-badge)](https://umeed-ai-delta.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-15-261b07?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-auth%20%7C%20push-ffca28?style=for-the-badge&logo=firebase&logoColor=261b07)](https://firebase.google.com/)
[![Python](https://img.shields.io/badge/Python-3.10%2B-f2c14e?style=for-the-badge&logo=python&logoColor=261b07)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-ML%20API-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Open source](https://img.shields.io/badge/open%20source-ready-6f8d54?style=for-the-badge)](https://github.com/annms1876-glitch/Flood-Prediction-Model-)

**A flood-monitoring, early-warning, and emergency coordination platform for hilly regions.**

[Open the live frontend](https://umeed-ai-delta.vercel.app/) · [Browse the source](https://github.com/annms1876-glitch/Flood-Prediction-Model-) · [Open an issue](https://github.com/annms1876-glitch/Flood-Prediction-Model-/issues)

</div>

> **Umeed** means hope. Better information, delivered earlier, gives communities more time to act.

![Umeed AI SOS emergency interface](floodlens-ui/docs/screenshots/umeed-ai-sos.webp)

## Contents

- [Project overview](#project-overview)
- [What the platform does](#what-the-platform-does)
- [System architecture](#system-architecture)
- [Repository structure](#repository-structure)
- [Technology stack](#technology-stack)
- [Quick start](#quick-start)
- [Configuration](#configuration)
- [Frontend experience](#frontend-experience)
- [Prediction service](#prediction-service)
- [Backend service](#backend-service)
- [Emergency alerting](#emergency-alerting)
- [SOS and incident triage](#sos-and-incident-triage)
- [API reference](#api-reference)
- [Security model](#security-model)
- [Testing and validation](#testing-and-validation)
- [Deployment](#deployment)
- [Known limitations](#known-limitations)
- [Contributing](#contributing)
- [License and attribution](#license-and-attribution)

## Project overview

Umeed AI is a multi-service flood prediction and emergency-response workspace. The repository combines a Next.js web application, a Python/FastAPI prediction service, and a Node.js backend for sensor, risk, authentication, and notification integrations.

The frontend serves two audiences. Residents receive a concise local risk view, preparedness guidance, evacuation routes, and an SOS distress workflow. Authorized coordinators receive a Command Centre with telemetry, alert dispatch, advanced analytics, shelter context, and an Emergency SOS Incident Triage queue.

The current implementation supports model-assisted prediction, rule-based fallback prediction, demo scenarios, Google and email authentication, Firebase Cloud Messaging, Firestore-backed SOS records, and a public-domain foreground emergency siren. The repository is suitable for continued prototyping and open-source collaboration; it must be validated with local authorities before being used for real emergency operations.

## What the platform does

| Capability | Description | Primary surface |
|---|---|---|
| **Local risk overview** | Shows catchment status, weather context, connected sensors, current risk, preparedness actions, and emergency contacts. | `/` |
| **Flood prediction** | Accepts time-series sensor readings and produces model or rule-based risk estimates. | `/predict`, `/api/predict` |
| **Spatial risk mapping** | Visualizes terrain, flood zones, safe routes, and evacuation context in an interactive map. | `/3d-map-view`, `/evacuation-routes` |
| **3D escape guidance** | Provides turn-by-turn route guidance with safe/hazard visibility and flood-level controls. | Map components |
| **Sensor telemetry** | Displays station health, readings, connectivity, and network state. | `/sensor-network` |
| **Alert dispatch** | Allows an authorized administrator to compose and broadcast critical alerts through FCM. | `/alert-management` |
| **Background notifications** | Registers browser push tokens and uses a Firebase messaging service worker for notifications outside the focused page. | FCM + `public/firebase-messaging-sw.js` |
| **Foreground voice alerts** | Plays the bundled public-domain siren and browser speech synthesis when browser policy permits foreground audio. | Notification listener |
| **SOS distress beacon** | Captures location, household size, hazards, and medical notes and submits a rescue request. | `/sos-emergency` |
| **Incident triage** | Persists SOS records and synchronizes new incidents into the admin queue every ten seconds. | `/admin-dashboard` |
| **Advanced analytics** | Provides read-only ECharts panels for trends, volatility, rainfall/runoff, risk factors, network health, and model contributions. | `/risk-analytics` |
| **AI analytics insights** | Sends a controlled analytics snapshot to a server-side Gemini route for summary and recommendations. | `/api/analytics-insights` |
| **Authentication** | Supports Firebase email/password and direct Google popup authentication. | Sign-in modal |
| **Localization and themes** | Provides English/Hindi controls and light/dark UI themes. | Global header |

## System architecture

```mermaid
flowchart TB
    subgraph Users[People and devices]
        Resident[Resident browser / PWA]
        Coordinator[Emergency coordinator]
        Sensors[IoT sensors / external feeds]
    end

    subgraph Frontend[Umeed AI frontend]
        UI[Next.js 15 App Router]
        Map[Interactive map and evacuation UI]
        Ops[Command Centre and operations views]
        Charts[Read-only ECharts analytics]
        Worker[Firebase messaging service worker]
    end

    subgraph Application[Application services]
        Routes[Next.js API routes]
        Backend[Node.js / Express backend]
        ML[Python / FastAPI ML service]
    end

    subgraph Data[Storage and external services]
        Auth[Firebase Auth]
        Firestore[(Firestore)]
        Supabase[(Supabase / PostgreSQL)]
        FCM[Firebase Cloud Messaging]
        Gemini[Gemini server-side insights]
        Maps[Google Maps platform]
    end

    Resident --> UI
    Coordinator --> UI
    Sensors --> Backend
    UI --> Map
    UI --> Ops
    UI --> Charts
    UI --> Auth
    UI --> Routes
    UI --> Maps
    Routes --> Backend
    Routes --> ML
    Routes --> Firestore
    Routes --> FCM
    Routes --> Gemini
    Backend --> Supabase
    Backend --> ML
    FCM --> Worker
    Worker --> Resident
    UI -->|SOS beacon| Routes
    Routes -->|persist incident| Firestore
    Firestore -->|poll and triage sync| Ops
    Coordinator -->|compose alert| Routes
```

### Data and decision flow

1. Sensors and external integrations provide readings such as water level, rainfall, soil moisture, tilt, temperature, and humidity.
2. The Node backend can ingest readings, retrieve location data, and call the ML service.
3. The ML service enriches readings with buffered history and returns an ensemble prediction when model artifacts are available.
4. The frontend presents risk and operational context in resident and coordinator views.
5. Coordinators can dispatch alerts through the protected frontend API route.
6. Residents can submit an SOS beacon, which is stored and surfaced to the Command Centre.

## Repository structure

```text
Flood-Prediction-Model-/
├── README.md                      # Canonical project documentation
├── package.json                   # Root npm workspace scripts
├── docker-compose.yml             # Backend, ML, and frontend orchestration
├── .env.example                   # Backend environment template
├── firestore.rules                # Firestore access rules
├── firebase-blueprint.json        # Firebase project blueprint
├── security_spec.md               # Firestore security invariants and test vectors
├── floodlens-ui/                  # Umeed AI Next.js frontend workspace
│   ├── app/                       # Pages, route handlers, and API endpoints
│   ├── components/                # Auth, map, analytics, dashboard, and layout UI
│   ├── lib/                       # Firebase, notifications, state, and API helpers
│   ├── public/                    # Logo, service worker, and emergency audio
│   ├── docs/screenshots/          # README preview image
│   ├── package.json               # Frontend dependencies and scripts
│   └── README.md                  # Frontend-specific notes
├── flood-prediction-backend/     # Node.js / Express service
│   ├── src/app.js                 # Server bootstrap and health endpoints
│   ├── src/routes/                # Auth, sensor, and API routes
│   ├── src/services/              # ML, alert, email, Firebase, and data services
│   ├── tests/                     # Backend tests and system tests
│   ├── supabase-setup.sql         # Database schema setup
│   └── README.md                  # Backend-specific setup
└── ml-service/                   # Python / FastAPI prediction service
    ├── app.py                     # ML API entrypoint
    ├── models/                    # LSTM, XGBoost, GNN, PINN, and ensemble code
    ├── services/                  # Predictor and sensor data processing
    ├── pretrained/                # Committed model configuration/artifacts
    ├── demo_data.py               # Demo scenarios
    └── README.md                  # ML-specific setup and endpoint notes
```

The directory name `floodlens-ui` is retained as a workspace path for compatibility with existing scripts and deployment configuration. The product and user-facing project name is **Umeed AI**.

## Technology stack

| Layer | Technologies | Responsibility |
|---|---|---|
| Web application | Next.js 15, React 18, TypeScript, Tailwind CSS | Resident, admin, map, analytics, auth, and API surfaces |
| UI behavior | Zustand, Framer Motion, Lucide React | Client state, transitions, icons, and interaction feedback |
| Charts | Apache ECharts through `echarts-for-react` | Read-only advanced analytics visualizations |
| Maps | `@vis.gl/react-google-maps` and Google Maps APIs | Map, terrain, route, and location features |
| Browser identity | Firebase Auth | Email/password and Google sign-in |
| Push | Firebase Cloud Messaging | Browser push token registration and notification delivery |
| Application API | Next.js route handlers and Node.js/Express | Frontend integrations, backend APIs, alerts, and health checks |
| Prediction | Python, FastAPI, PyTorch, XGBoost, Pydantic | Sensor processing, model inference, demos, and fallbacks |
| Data | Firestore and Supabase integrations | User profiles, SOS incidents, subscriptions, readings, and backend data |
| AI insights | Google GenAI server SDK | Server-side analytics summary and recommendations |
| Delivery | Docker Compose, Vercel-compatible frontend | Local orchestration and frontend deployment |

## Quick start

### Requirements

- Node.js 18 or newer for the backend; Node.js 20 or newer is recommended for the full workspace.
- npm 9 or newer.
- Python 3.10 or newer for the ML service.
- A Firebase project for authentication, Firestore, and web messaging.
- Optional Supabase credentials for the Node backend.
- Docker Desktop if you want to run the services together.

### Frontend-only development

From the repository root:

```bash
git clone https://github.com/annms1876-glitch/Flood-Prediction-Model-.git
cd Flood-Prediction-Model-
npm install
npm run dev
```

The frontend package starts Next.js on port `3000` when run directly. With Docker Compose, the frontend is exposed at `http://localhost:3001` and maps to port `3000` inside the container.

To work directly in the frontend package:

```bash
cd floodlens-ui
npm install
npm run dev
```

Useful root scripts:

| Command | Effect |
|---|---|
| `npm run dev` | Starts the frontend workspace in development mode. |
| `npm run build` | Builds the frontend for production. |
| `npm run start` | Starts the built frontend. |
| `npm run lint` | Runs the frontend TypeScript check. |

### Full local stack with Docker

```bash
docker-compose up --build
```

| Container | Host port | Internal role |
|---|---:|---|
| `backend` | `3000` | Express API, sensor data, risk, and integrations |
| `ml-service` | `8000` | FastAPI model inference and demo endpoints |
| `floodlens-ui` | `3001` | Next.js frontend on container port `3000` |

The Compose file passes `ML_API_URL=http://ml-service:8000` to the backend and exposes the service network to the frontend through the configured public URLs.

### Run services manually

```bash
# Frontend
cd floodlens-ui
npm install
npm run dev

# Backend and its development ML process
cd ../flood-prediction-backend
npm install
npm run dev

# ML service independently
cd ../ml-service
pip install -r requirements.txt
python -m uvicorn app:app --reload --port 8000
```

## Configuration

### Frontend environment variables

Create `floodlens-ui/.env.local`. The public Firebase browser configuration is normally supplied through the checked-in app configuration or deployment settings. Server-only credentials must never be exposed to client code.

```env
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_web_push_vapid_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID=your_google_maps_map_id
GEMINI_API_KEY=your_gemini_api_key

FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@your_project_id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"
```

`GEMINI_API_KEY` is used only by the server-side analytics insights route. `FIREBASE_PRIVATE_KEY` and `FIREBASE_CLIENT_EMAIL` are used only by Firebase Admin routes. Add these values to Vercel Project Settings → Environment Variables for production.

### Backend environment variables

The root `.env.example` documents the broader Node service configuration:

| Variable group | Examples | Purpose |
|---|---|---|
| Supabase | `SUPABASE_URL`, `SUPABASE_ANON_KEY` | Database and backend data integration |
| Firebase | `FIREBASE_PROJECT_ID`, `FIREBASE_CREDENTIAL_PATH`, messaging fields | Admin SDK and notifications |
| Security | `JWT_SECRET`, `API_KEY`, rate-limit settings | Authentication and abuse controls |
| Server | `PORT`, `ALLOWED_ORIGINS`, `LOG_LEVEL` | Runtime and observability configuration |
| Maps | `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`, `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID` | Frontend map configuration |

Do not commit `.env` files, service-account JSON files, private keys, API tokens, or real resident records.

## Frontend experience

### Resident surfaces

| Route | Function |
|---|---|
| `/` | Local risk overview, weather, sensor availability, status, and preparedness |
| `/3d-map-view` | Interactive map with terrain, flood controls, hazards, safe routes, and escape guide |
| `/evacuation-routes` | Evacuation route-focused view |
| `/sos-emergency` | Distress beacon, GPS context, household details, hazards, hotlines, and siren trigger |
| `/safety-tips` | Flood preparedness guidance |
| `/settings` | User settings and account-related controls |

### Coordinator and admin surfaces

| Route | Function |
|---|---|
| `/admin-dashboard` | Command Centre, risk KPIs, telemetry summary, and Emergency SOS Incident Triage |
| `/alert-management` | Alert composer, broadcast history, emergency notification permission, and siren preview |
| `/risk-analytics` | Read-only multi-chart analytics board and Gemini-powered insights |
| `/evacuation-tracker` | Evacuation progress and shelter capacity context |
| `/sensor-network` | Sensor telemetry, station health, and network state |
| `/3d-map-view` | Operational map layers and flood-level controls |

Analytics controls are intentionally presented as read-only snapshots for the current admin workflow. Future automation can replace the static snapshot inputs with validated telemetry streams and audit-backed time-series data.

## Prediction service

The ML service is a FastAPI application in `ml-service/app.py`. It initializes a predictor, sensor data processor, and ensemble aggregator during application startup. The prediction pipeline can use buffered readings and model artifacts from `ml-service/pretrained/`.

### Model composition

The current model metadata exposes the following ensemble composition:

```text
Risk = LSTM × 0.40 + XGBoost × 0.30 + GNN × 0.20 + PINN × 0.10
```

| Component | Role |
|---|---|
| **LSTM** | Learns temporal behavior from sequential sensor readings. |
| **XGBoost** | Corrects residual error using engineered features. |
| **GNN** | Represents spatial relationships between catchment or sensor locations. |
| **PINN** | Adds physics-informed hydrological constraints. |
| **Rule-based fallback** | Produces a transparent score when the trained predictor is unavailable. |

### ML endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/` | Service identity and running state |
| `GET` | `/health` | Service and predictor health |
| `GET` | `/model/info` | Model version, component list, and formula |
| `POST` | `/predict` | Model-backed prediction from a location and readings |
| `POST` | `/predict/rule-based` | Transparent fallback risk calculation |
| `GET` | `/demo/scenarios` | List available demo scenarios |
| `GET` | `/demo/predict/{scenario_name}` | Evaluate one demo scenario |
| `POST` | `/demo/run-all` | Evaluate all demo scenarios |

Example rule-based request:

```bash
curl -X POST http://localhost:8000/predict/rule-based \
  -H 'Content-Type: application/json' \
  -d '{
    "location": "sector-4",
    "readings": [{
      "location": "sector-4",
      "water_level_m": 2.84,
      "rainfall_mm": 40,
      "soil_moisture_percent": 82,
      "tilt_degrees": 3.1
    }]
  }'
```

## Backend service

The Node.js service in `flood-prediction-backend/` is an Express application. It provides operational API routes, sensor data handling, authentication routes, risk calculations, ML proxy calls, and integration points for Firebase and Supabase.

Important backend command scripts include:

| Command | Purpose |
|---|---|
| `npm run start` | Start the Express server. |
| `npm run dev` | Run backend and ML development processes concurrently. |
| `npm test` | Run Jest tests with coverage. |
| `npm run test:system` | Run system-level tests. |
| `npm run test:integration` | Run integration scripts. |
| `npm run test:demo` | Run demo test scenarios. |
| `npm run simulate` | Run simulation-oriented test scripts. |
| `npm run firebase:setup` | Configure or inspect Firebase setup. |
| `npm run firebase:check` | Check Firebase configuration. |
| `npm run ml:health` | Query the local ML health endpoint. |
| `npm run ml:info` | Query ML model metadata. |

Backend route groups include readings, risk, ML prediction, sensor network, authentication, and service health. The backend README and Swagger configuration contain the service-specific details.

## Emergency alerting

### Browser push flow

1. A signed-in user selects **Enable emergency flood alerts**.
2. The browser requests notification permission.
3. Firebase Messaging registers `public/firebase-messaging-sw.js`.
4. A browser token is sent to `/api/notifications/register-token`.
5. An authorized administrator submits an alert to `/api/admin/alerts/broadcast`.
6. The server verifies the Firebase ID token and administrator identity.
7. Firebase Cloud Messaging sends a notification to registered browser tokens.
8. The service worker displays the notification and routes clicks back to `/alert-management`.

### Voice behavior

When the app is active, a `voice_alert` payload can trigger the bundled siren at `floodlens-ui/public/audio/umeed-emergency-siren.mp3` followed by browser speech synthesis. When a browser is fully closed, web platform autoplay restrictions prevent a website from guaranteeing arbitrary MP3 or TTS playback. Production life-safety deployments should pair web push with a native application, SMS provider, or automated voice-call escalation.

## SOS and incident triage

### Resident submission

The SOS page collects:

- GPS coordinates, when location permission is available.
- A landmark or specific house description.
- The number of people trapped.
- Selected hazards and vulnerabilities.
- Medical notes and rescue context.
- Contact details supplied by the resident.

The request is sent to `POST /api/sos`. The route assigns an incident ID, timestamp, dispatch status, rescue unit metadata, team lead, radio channel, and estimated arrival time. The current implementation writes the record to Firestore when Firebase Admin is configured and retains a runtime fallback log when persistence is unavailable.

### Admin triage

The Command Centre calls `GET /api/sos` immediately and then polls every ten seconds. It merges incoming records by incident ID, so newly submitted SOS alerts appear in **Emergency SOS Incident Triage** without requiring a manual refresh. Coordinators can move an incident through `DISPATCHED`, `IN_RESCUE`, and `RESOLVED` states in the admin UI.

## API reference

### Next.js application routes

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `POST` | `/api/sos` | Resident | Create an SOS incident |
| `GET` | `/api/sos` | Operations | Retrieve recent SOS incidents |
| `POST` | `/api/notifications/register-token` | Signed-in user | Register a browser FCM token |
| `POST` | `/api/admin/alerts/broadcast` | Administrator | Broadcast a critical FCM alert |
| `POST` | `/api/analytics-insights` | Admin analytics | Generate a server-side Gemini summary |
| `GET/POST` | `/api/evacuation/*` | App | Route and evacuation integrations |
| `GET/POST` | `/api/readings`, `/api/sensors` | App | Sensor and readings integrations |
| `GET/POST` | `/api/risk/*` | App | Risk and history integrations |
| `GET/POST` | `/api/ml/*` | App | ML service proxy routes |
| `GET` | `/api/health` | Monitoring | Frontend API health check |

### Node backend route groups

The Express backend includes route groups for:

- `/api/readings`
- `/api/risk`
- `/api/risk/ml`
- `/api/ml/predict`
- `/api/ml/predict/batch`
- `/api/ml/health`
- `/api/ml/model-info`
- `/api/sensors`
- `/api/auth`
- `/api/health`

Refer to `flood-prediction-backend/src/routes/` and `flood-prediction-backend/swagger.yaml` for the implementation-level contract.

## Security model

The repository includes a default-deny Firestore ruleset and a security specification in `security_spec.md`.

The current Firestore rules enforce the following principles:

| Control | Behavior |
|---|---|
| Default deny | Unmapped collections and paths deny reads and writes. |
| User ownership | A user can access only their own `/users/{userId}` document. |
| Identity integrity | The profile document ID must match the authenticated UID. |
| Profile validation | Required fields, string lengths, enums, and optional age/phone fields are validated. |
| PII isolation | User profile data cannot be listed or read by unrelated users. |
| Immutable identity | Updates cannot change the stored identity ID. |

The Express backend also contains security middleware, rate limiting, validation, CORS handling, secure headers, and error handling. These controls should be reviewed and tested again before production deployment.

## Testing and validation

### Frontend

```bash
cd floodlens-ui
npm run lint
npm run build
```

The frontend `lint` script currently runs `tsc --noEmit`, so it functions as a TypeScript validation step.

### Backend

```bash
cd flood-prediction-backend
npm test
npm run test:system
npm run test:integration
```

### ML service

```bash
cd ml-service
curl http://localhost:8000/health
curl http://localhost:8000/model/info
```

### Manual smoke checks

For a useful end-to-end smoke test, verify that the following flows work in a browser:

1. The home page loads without runtime errors.
2. Google sign-in opens the Firebase/Google account flow and returns to the app after authentication.
3. The SOS button starts its countdown and submits an incident.
4. The Command Centre displays the submitted incident.
5. The alert permission card registers a push token when configured.
6. The map renders the expected terrain, route, and flood controls.
7. The admin analytics page remains read-only.

## Deployment

### Vercel frontend

The Next.js frontend can be deployed to Vercel from the `floodlens-ui` workspace. Configure the browser and server environment variables described in [Configuration](#configuration), then set the correct project root and build command in Vercel.

The deployed frontend is currently available at [umeed-ai-delta.vercel.app](https://umeed-ai-delta.vercel.app/).

### Container deployment

The repository includes Dockerfiles for the frontend, backend, and ML service. Docker Compose exposes:

- Frontend: `http://localhost:3001`
- Backend: `http://localhost:3000`
- ML service: `http://localhost:8000`

### Production checklist

Before production use:

- Configure a Vercel project root that includes `floodlens-ui/public/` so static audio and the service worker are deployed.
- Add all Firebase browser and Admin credentials through secret management.
- Configure Google OAuth authorized domains and Firebase sign-in providers.
- Configure Firestore rules and verify them against `security_spec.md`.
- Configure the real backend, ML endpoint, map keys, and alert channels.
- Add monitoring and alert-delivery logs.
- Add an independent SMS, phone, or native notification fallback for extreme alerts.
- Test on the target mobile browsers and networks.
- Do not treat browser-only voice playback as a guaranteed emergency channel.

## Known limitations

- Browser autoplay policy can block custom siren playback outside a direct user gesture.
- A closed mobile browser cannot guarantee arbitrary custom MP3 or speech playback.
- The current browser push flow requires a VAPID key and explicit user permission.
- SOS triage polling is intentionally simple and should be replaced with a realtime subscription or event stream at larger scale.
- Some operational analytics currently use locked demo snapshots rather than a live telemetry warehouse.
- The Firestore rules currently describe user-profile protection; operational collections should receive their own least-privilege rules before production.
- The open-source repository does not include an official release license file yet.

## Contributing

Contributions are welcome. Please open an issue before large changes so proposals remain connected to flood safety, accessibility, reliability, and community needs.

When opening a pull request:

- Keep emergency states obvious and readable.
- Do not rely on color alone to communicate severity.
- Preserve the distinction between resident and admin workflows.
- Never commit Firebase Admin keys, private credentials, or real resident data.
- Add validation for new API routes and data flows.
- Document new environment variables and deployment requirements.
- Include screenshots or a short reproduction path for UI changes.

## License and attribution

This repository is intended for open-source collaboration. Add the project’s preferred SPDX license file and copyright holder before publishing an official release.

The foreground emergency siren is stored at `floodlens-ui/public/audio/umeed-emergency-siren.mp3`. It was converted from the Wikimedia Commons recording **“Alarm or siren”**, authored by `stephan` and released into the public domain. The source and license record are stored in `floodlens-ui/public/audio/umeed-emergency-siren.source.txt`.

## References

[1]: https://nextjs.org/docs "Next.js documentation"
[2]: https://firebase.google.com/docs "Firebase documentation"
[3]: https://fastapi.tiangolo.com/ "FastAPI documentation"
[4]: https://echarts.apache.org/en/index.html "Apache ECharts documentation"
[5]: https://commons.wikimedia.org/wiki/File:Alarm_or_siren.ogg "Wikimedia Commons public-domain siren source"
[6]: https://github.com/annms1876-glitch/Flood-Prediction-Model- "Umeed AI source repository"
[7]: https://umeed-ai-delta.vercel.app/ "Umeed AI live frontend"
