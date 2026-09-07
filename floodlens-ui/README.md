# Umeed AI

### Open flood intelligence for safer communities

[![Live Demo](https://img.shields.io/badge/live_demo-umeed--ai--delta.vercel.app-f9a600?style=for-the-badge)](https://umeed-ai-delta.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-15-261b07?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-auth%20%7C%20push-ffca28?style=for-the-badge&logo=firebase&logoColor=261b07)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/license-open%20source-6f8d54?style=for-the-badge)](../../)

Umeed AI is a flood-monitoring and early-warning interface designed for residents, emergency coordinators, and rescue teams. It brings local risk context, interactive evacuation mapping, sensor telemetry, operational analytics, emergency alerts, and SOS rescue triage into one calm, high-signal workspace.

> **Umeed** means hope. The project is built around a simple idea: better information, delivered earlier, gives communities more time to act.

## Live frontend

**[Open the deployed Umeed AI frontend →](https://umeed-ai-delta.vercel.app/)**

![Umeed AI SOS emergency interface](docs/screenshots/umeed-ai-sos.webp)

The live interface uses a warm paper-and-amber visual system for everyday monitoring, with high-contrast emergency surfaces for SOS, dispatch, and rescue workflows. The frontend is responsive and supports English/Hindi labels and light/dark theme switching across the operational views.

## What is included

| Capability | What it does |
|---|---|
| **Risk overview** | Presents catchment risk, weather context, sensor connectivity, and preparedness actions in a resident-friendly dashboard. |
| **Interactive 3D evacuation map** | Shows terrain, flood-level controls, hazard layers, safe routes, and escape guidance. |
| **Advanced analytics** | Provides read-only admin intelligence views with hydrographs, forecast trends, rainfall/runoff response, sensor health, risk comparisons, radar analysis, and model contribution charts. |
| **Flood prediction workspace** | Organizes model-driven flood prediction and spatial risk information for operational review. |
| **Sensor telemetry** | Surfaces station health, connectivity, stage, rainfall, and network signals. |
| **Alert dispatch** | Gives authorized coordinators a CAP-style broadcast composer and delivery workflow. |
| **Emergency push alerts** | Uses Firebase Cloud Messaging and a service worker for browser notifications when the app is not focused. |
| **Foreground voice alerts** | Plays a public-domain emergency siren and browser speech synthesis when a voice alert arrives while the app is active. |
| **SOS distress beacon** | Captures location, household size, hazards, and medical notes, starts an emergency siren on tap, and dispatches the beacon. |
| **SOS incident triage** | Automatically syncs new SOS incidents into the admin Command Centre and persists them in Firestore. |
| **Authentication** | Supports email/password and direct Google popup authentication through Firebase Auth. |
| **Localization and themes** | Includes English/Hindi controls and a readable light/dark operational theme. |

## Architecture

```mermaid
flowchart LR
    Resident[Resident browser / PWA]
    Admin[Emergency coordinator]
    UI[Next.js App Router\nUmeed AI frontend]
    Auth[Firebase Auth\nEmail + Google popup]
    Push[Firebase Cloud Messaging\nWeb Push + service worker]
    API[Next.js API routes]
    Firestore[(Firestore\nSOS + subscriptions)]
    ML[ML services\nLSTM · XGBoost · GNN · PINN]
    Maps[Maps + terrain layer]
    Analytics[Read-only admin analytics]
    Escalation[Optional escalation\nSMS / phone / native app]

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
    UI -->|SOS beacon| API
    API -->|new incident| Firestore
    Firestore -->|poll + triage sync| Analytics
    Push -.->|extreme alert fallback| Escalation
```

## Repository layout

```text
.
├── floodlens-ui/                 # Next.js frontend
│   ├── app/                      # Routes, pages, and API handlers
│   ├── components/               # Layout, dashboard, map, analytics, auth UI
│   ├── lib/                      # Firebase, state, notification, and data helpers
│   ├── public/                   # Logo, service worker, and emergency audio
│   └── README.md                 # This document
├── flood-prediction-backend/     # Backend service workspace
├── package.json                  # Workspace scripts
└── docker-compose.yml            # Local multi-service orchestration, when configured
```

## Quick start

### Requirements

- Node.js 20+
- npm 10+
- A Firebase project for authentication, Firestore, and web messaging
- Optional ML and backend services for live model data

### Install and run

From the repository root:

```bash
git clone https://github.com/annms1876-glitch/Flood-Prediction-Model-.git
cd Flood-Prediction-Model-
npm install
npm run dev
```

The frontend is available at [http://localhost:3001](http://localhost:3001) when using the workspace scripts. To work only inside the UI package:

```bash
cd floodlens-ui
npm install
npm run dev
```

Run validation with:

```bash
npm run lint
```

## Environment configuration

Create a local `.env.local` inside `floodlens-ui/` for development. Public Firebase settings are safe to expose to the browser; server credentials must never be committed.

```env
# Browser Firebase configuration
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_web_push_vapid_key

# Server-only Firebase Admin configuration
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@your_project_id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"

# Optional AI analytics
GEMINI_API_KEY=your_gemini_api_key
```

For production, add these values to the Vercel project environment settings. The browser push permission flow is intentionally user-initiated. Users must sign in and select **Enable emergency flood alerts** before a push token is registered.

## Emergency alert flow

1. An authorized coordinator composes an alert in **Alert Dispatch**.
2. The protected server route verifies the Firebase ID token and administrator identity.
3. The alert is broadcast through Firebase Cloud Messaging to registered browser tokens.
4. The service worker displays a persistent notification when the app is backgrounded.
5. Foreground clients play the emergency siren and browser TTS when permitted by the browser.
6. Notification clicks return the user to the alert-management view.

Web browsers cannot guarantee arbitrary custom audio when the browser process is completely closed. For life-safety production deployments, pair browser push with a native app, SMS gateway, or automated voice-call escalation.

## SOS and incident triage flow

1. A resident taps the SOS beacon.
2. The emergency siren starts from the tap gesture where browser audio policy allows it.
3. The app submits location, household, dependent, hazard, and medical details to `/api/sos`.
4. The incident is persisted in Firestore under `sosIncidents`.
5. The Command Centre polls for new records and merges them into **Emergency SOS Incident Triage**.
6. Coordinators can move incidents through dispatched, in-rescue, and resolved states.

## Main routes

| Route | Audience | Purpose |
|---|---|---|
| `/` | Everyone | Local risk overview and preparedness summary |
| `/3d-map-view` | Everyone | Interactive terrain, flood, and evacuation map |
| `/sos-emergency` | Everyone | Distress beacon and emergency contact workflow |
| `/safety-tips` | Everyone | Preparedness guidance |
| `/admin-dashboard` | Coordinators | Command Centre and SOS triage |
| `/alert-management` | Coordinators | Alert composition and emergency broadcast |
| `/risk-analytics` | Admin | Locked multi-chart decision-support workspace |
| `/evacuation-tracker` | Operations | Evacuation progress and shelter status |
| `/sensor-network` | Operations | Sensor telemetry and station health |
| `/api/sos` | App API | Create and retrieve SOS incidents |
| `/api/admin/alerts/broadcast` | Admin API | Broadcast FCM alerts |
| `/api/notifications/register-token` | Authenticated API | Register browser push tokens |
| `/api/analytics-insights` | Admin API | Generate Gemini analytics insights |

## Open-source audio attribution

The foreground emergency siren is stored at `public/audio/umeed-emergency-siren.mp3`. It was converted from the Wikimedia Commons recording **“Alarm or siren”**, authored by `stephan` and released into the public domain. The original source and licensing record are included beside the asset in `public/audio/umeed-emergency-siren.source.txt`.

## Contributing

Contributions are welcome. Please open an issue before large changes so the discussion stays connected to flood safety, accessibility, and operational reliability. When submitting a pull request:

- Keep emergency states visually obvious and readable.
- Avoid introducing interactions that depend only on color.
- Preserve the distinction between resident and admin workflows.
- Never commit Firebase Admin keys, private credentials, or real resident data.
- Add or update validation for new API routes and data flows.

## Safety and deployment note

Umeed AI is an open-source software project and should be validated with local disaster-management authorities before use in a real emergency operation. Browser push, speech synthesis, location permissions, network connectivity, and third-party services can fail. A production deployment should include independent communication channels, incident audit logs, access control, monitoring, and human dispatch procedures.

## License

This repository is intended for open-source collaboration. Add the project’s preferred SPDX license file and copyright holder before publishing an official release.

## Links

- **Live frontend:** [umeed-ai-delta.vercel.app](https://umeed-ai-delta.vercel.app/)
- **GitHub repository:** [annms1876-glitch/Flood-Prediction-Model-](https://github.com/annms1876-glitch/Flood-Prediction-Model-)
