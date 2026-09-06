# Environment Variables Setup Guide

This guide walks you through configuring the `.env` file for the Flood Prediction Backend.

## Quick Start

```bash
# 1. Copy the example file
cp .env.example .env.local

# 2. Edit with your values
nano .env.local  # or use your preferred editor

# 3. The app will automatically load .env.local if present
npm run dev
```

## Required Variables

### 1. Supabase (Required)

Get your credentials from [Supabase Dashboard](https://supabase.com/dashboard):

1. Select your project
2. Click **Settings** (left sidebar) → **API**
3. Copy the values:

```
SUPABASE_URL=https://abc123def.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Why these are needed:**
- `SUPABASE_URL` - API endpoint for database operations
- `SUPABASE_ANON_KEY` - Authenticates public/read operations

### 2. Server Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server listening port |
| `NODE_ENV` | `development` | Environment mode (affects logging, error messages) |

### 3. CORS Configuration

```env
# Local development (default)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080,http://127.0.0.1:3000

# Production (update for your domains)
ALLOWED_ORIGINS=https://yourdomain.com,https://admin.yourdomain.com
```

## Optional Variables

### Firebase (For Push Notifications)

**Option A: Service Account File (Recommended for dev)**

1. Download from Firebase Console → Project Settings → Service Accounts
2. Save as `config/service-account.json`
3. Configure:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CREDENTIAL_PATH=./config/service-account.json
```

**Option B: JSON Environment Variable (For Docker/production)**

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CREDENTIAL_JSON={"type":"service_account","project_id":"...","private_key_id":"...","private_key":"...","client_email":"...","client_id":"..."}
```

### Alert System

```env
# Minimum risk score to trigger alerts (0-100)
DEFAULT_ALERT_THRESHOLD=50

# Which channels to use
ALERT_CHANNELS=fcm,sms,email
```

### Logging

```env
# Log verbosity: debug, info, warn, error
LOG_LEVEL=info
```

## Complete Example (.env.local)

```env
# Server
PORT=3000
NODE_ENV=development

# Supabase (REQUIRED)
SUPABASE_URL=https://abc123def.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Firebase (OPTIONAL - for push notifications)
FIREBASE_PROJECT_ID=flood-prediction-app
FIREBASE_CREDENTIAL_PATH=./config/service-account.json

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080

# Alerts
DEFAULT_ALERT_THRESHOLD=50
ALERT_CHANNELS=fcm

# Logging
LOG_LEVEL=info
```

## Environment-Specific Setup

### Development (Local)

```bash
# Use .env.local for local development overrides
cp .env.example .env.local
# Edit .env.local with your local credentials
```

### Production

For production, set environment variables directly in your hosting platform:

**Docker:**
```bash
docker run -e SUPABASE_URL=... -e SUPABASE_ANON_KEY=... flood-prediction-backend
```

**PM2:**
```bash
# In ecosystem.config.js
env: {
  SUPABASE_URL: 'https://...',
  SUPABASE_ANON_KEY: '...'
}
```

**Vercel/Netlify/Heroku:**
- Use the platform's environment variable UI
- Add all required variables in the dashboard

### Testing

```bash
# Test environment
NODE_ENV=test PORT=3001 npm test
```

## Security Best Practices

✅ **DO:**
- Use `.env.local` for local secrets (add to .gitignore)
- Use environment variables in production (not files)
- Rotate keys periodically
- Use different credentials per environment
- Restrict Supabase RLS policies appropriately

❌ **DON'T:**
- Commit `.env` or `.env.local` to Git
- Share service account keys publicly
- Use production credentials in development
- Hardcode credentials in source code

## Troubleshooting

### "Supabase connection failed"
```bash
# Check your URL and key
echo $SUPABASE_URL
echo $SUPABASE_ANON_KEY

# Test connection manually
curl -H "apikey: $SUPABASE_ANON_KEY" $SUPABASE_URL/rest/v1/
```

### "Firebase not initialized"
```bash
# Check if service account file exists
ls -la config/service-account.json

# Verify JSON is valid
cat config/service-account.json | python -m json.tool

# Check environment
echo $FIREBASE_PROJECT_ID
echo $FIREBASE_CREDENTIAL_PATH
```

### "CORS error in browser"
```bash
# Check ALLOWED_ORIGINS matches your frontend URL
echo $ALLOWED_ORIGINS

# Temporarily use '*' for testing (NOT for production)
ALLOWED_ORIGINS=*
```

## Verification

After configuring, verify everything works:

```bash
# Check configuration
npm run firebase:check  # If Firebase is configured

# Start server and check logs
npm run dev

# Look for:
# ✅ Supabase connected
# ✅ Firebase services ready (if configured)
```

## Environment Variable Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3000` | Server port |
| `NODE_ENV` | No | `development` | Environment mode |
| `SUPABASE_URL` | **Yes** | - | Supabase project URL |
| `SUPABASE_ANON_KEY` | **Yes** | - | Supabase anonymous key |
| `SUPABASE_SERVICE_KEY` | No | - | Service role key (admin ops) |
| `FIREBASE_PROJECT_ID` | No | - | Firebase project ID |
| `FIREBASE_CREDENTIAL_PATH` | No | - | Path to service account JSON |
| `FIREBASE_CREDENTIAL_JSON` | No | - | JSON credentials (alternative) |
| `ALLOWED_ORIGINS` | No | `*` | CORS allowed origins |
| `DEFAULT_ALERT_THRESHOLD` | No | `50` | Alert trigger threshold |
| `ALERT_CHANNELS` | No | `fcm` | Comma-separated alert channels |
| `LOG_LEVEL` | No | `info` | Logging verbosity |
| `RATE_LIMIT_WINDOW` | No | - | Rate limit window (ms) |
| `RATE_LIMIT_MAX` | No | - | Max requests per window |
| `WEATHER_API_KEY` | No | - | External weather API key |
| `TWILIO_ACCOUNT_SID` | No | - | Twilio account identifier |
| `TWILIO_AUTH_TOKEN` | No | - | Twilio auth token |
| `TWILIO_PHONE_NUMBER` | No | - | Twilio phone number |
| `SMTP_HOST` | No | - | SMTP server host |
| `SMTP_PORT` | No | - | SMTP server port |
| `SMTP_USER` | No | - | SMTP username |
| `SMTP_PASS` | No | - | SMTP password |
