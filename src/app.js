// Flood Prediction Backend Application
// Main Express server entry point with security best practices

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables
dotenv.config();

// Security middleware
const { securityHeaders, sanitizeInput, secureLogging, validateContentType, rateLimit, rateLimits } = require('./middleware/security');

// Import routes
const apiRoutes = require('./routes/api');
const supabaseConfig = require('./config/supabase');
const firebaseConfig = require('./config/firebase');

// Initialize Firebase Admin SDK from environment variables
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

// ============================================================
// TRUST PROXY (for rate limiting behind CDN/proxy)
// ============================================================
app.set('trust proxy', process.env.TRUSTED_PROXIES?.split(',').length > 0 ? 1 : 0);

// ============================================================
// SECURITY MIDDLEWARE
// ============================================================

// 1. Security headers (helmet, XSS protection, CSP, etc.)
app.use(securityHeaders({
  corsOrigin: process.env.ALLOWED_ORIGINS || '*',
  enableHSTS: process.env.NODE_ENV === 'production'
}));

// 2. Input sanitization (remove potential XSS, SQL injection)
app.use(sanitizeInput());

// 3. Secure request logging (mask sensitive data)
const logLevel = process.env.LOG_LEVEL || 'info';
if (process.env.LOG_REQUESTS !== 'false') {
  app.use(secureLogging({
    logLevel,
    maskFields: (process.env.LOG_MASK_FIELDS || 'password,token,authorization,api_key,secret,key').split(',')
  }));
}

// 4. Rate limiting
if (process.env.RATE_LIMIT_ENABLED !== 'false') {
  app.use('/api/', rateLimit(rateLimits.read));

  // Stricter rate limiting for auth endpoints
  app.use('/api/auth/', rateLimit(rateLimits.auth));

  // Stricter rate limiting for write operations
  app.use('/api/alerts/', rateLimit(rateLimits.write));
}

// 5. Content-Type validation
app.use(validateContentType(['application/json', 'application/x-www-form-urlencoded']));

// ============================================================
// STANDARD MIDDLEWARE
// ============================================================

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || '*',
  methods: (process.env.ALLOWED_METHODS || 'GET,POST,PUT,DELETE,OPTIONS').split(','),
  allowedHeaders: (process.env.ALLOWED_HEADERS || 'Origin,X-Requested-With,Content-Type,Accept,Authorization').split(','),
  credentials: true,
  maxAge: 86400 // 24 hours
}));

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ============================================================
// API ROUTES
// ============================================================
app.use('/api', apiRoutes);

// ============================================================
// ROOT ENDPOINT
// ============================================================
app.get('/', (req, res) => {
  res.json({
    name: 'Flood Prediction Backend API',
    version: '1.0.0',
    status: 'running',
    security: {
      cors: true,
      rateLimiting: process.env.RATE_LIMIT_ENABLED !== 'false',
      inputSanitization: true,
      securityHeaders: true
    },
    endpoints: {
      health: '/api/health',
      sensors: '/api/sensors',
      predictions: '/api/predictions',
      alerts: '/api/alerts',
      dashboard: '/api/dashboard'
    },
    timestamp: new Date().toISOString()
  });
});

// ============================================================
// 404 HANDLER
// ============================================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path,
    timestamp: new Date().toISOString()
  });
});

// ============================================================
// ERROR HANDLER
// ============================================================
app.use((err, req, res, next) => {
  console.error('Unhandled error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method
  });

  res.status(500).json({
    success: false,
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    timestamp: new Date().toISOString()
  });
});

// ============================================================
// START SERVER
// ============================================================
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║        FLOOD PREDICTION BACKEND SERVICE                  ║
╠═══════════════════════════════════════════════════════════╣
║  Port: ${PORT.toString().padEnd(50)}║
║  Environment: ${process.env.NODE_ENV || 'development'.padEnd(47)}║
║  Supabase: ${supabaseConfig.isInitialized() ? 'Connected'.padEnd(49) : 'Not configured'.padEnd(49)}║
║  Firebase: ${firebaseConfig.isInitialized() ? 'Connected'.padEnd(49) : 'Not configured'.padEnd(49)}║
╠═══════════════════════════════════════════════════════════╣
║  Security Features:                                       ║
║  - CORS: ${process.env.ALLOWED_ORIGINS ? 'Configured'.padEnd(41) : 'Not configured'.padEnd(41)}║
║  - Rate Limiting: ${(process.env.RATE_LIMIT_ENABLED !== 'false').toString().padEnd(41)}║
║  - Input Sanitization: ${'Enabled'.padEnd(41)}║
║  - Security Headers: ${'Enabled'.padEnd(41)}║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// ============================================================
// GRACEFUL SHUTDOWN
// ============================================================
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  
  // Close server connections
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });

  // Force exit after 10 seconds
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

const server = app.listen(PORT);

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

module.exports = app;
