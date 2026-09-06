// Flood Prediction Backend Application
// Main Express server entry point

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables
dotenv.config();

// Import routes
const apiRoutes = require('./routes/api');
const supabaseConfig = require('./config/supabase');
const firebaseConfig = require('./config/firebase');

// Initialize Firebase Admin SDK from environment variables
// This will automatically use FIREBASE_CREDENTIAL_PATH or FIREBASE_CREDENTIAL_JSON
const firebaseApp = firebaseConfig.initializeFromEnv();

if (firebaseApp) {
  console.log('✅ Firebase services ready (Messaging, Firestore)');
} else if (firebaseConfig.isAvailable()) {
  console.log('ℹ️  Firebase configured but not initialized (missing credentials)');
} else {
  console.log('ℹ️  Firebase Admin SDK not installed (push notifications unavailable)');
}

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging (development only)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
  });
}

// API Routes
app.use('/api', apiRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Flood Prediction Backend API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      sensors: '/api/sensors',
      predictions: '/api/predictions',
      alerts: '/api/alerts',
      dashboard: '/api/dashboard'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║        FLOOD PREDICTION BACKEND SERVICE                  ║
╠═══════════════════════════════════════════════════════════╣
║  Port: ${PORT.toString().padEnd(50)}║
║  Environment: ${process.env.NODE_ENV || 'development'.padEnd(47)}║
║  Supabase: ${supabaseConfig.isInitialized() ? 'Connected'.padEnd(49) : 'Not configured'.padEnd(49)}║
║  Firebase: ${firebaseConfig.isInitialized() ? 'Connected'.padEnd(49) : 'Not configured'.padEnd(49)}║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

module.exports = app;


