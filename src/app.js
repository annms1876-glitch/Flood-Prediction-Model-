// Flood Prediction Backend - Main Express Server
// Complete API server with CORS, body parsing, and all routes

// Load environment variables first
require('dotenv').config();

// Import Express and middleware
const express = require('express');
const cors = require('cors');

// Import routes
const sensorRoutes = require('./routes/sensors');
const authRoutes = require('./routes/auth');
const { rateLimitMiddleware } = require('./middleware/rateLimit');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ============================================================
// SECURITY MIDDLEWARE
// ============================================================

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ?
    process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim()) : ['http://localhost:3000', 'http://localhost:8080'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  credentials: true,
  maxAge: 86400 // 24 hours
}));

// Rate limiting
app.use('/api/', rateLimitMiddleware);

// Body parsing with size limits
app.use(express.json({
  limit: '1mb', // 1MB max request body
  strict: true // Only parse application/json
}));

app.use(express.urlencoded({
  extended: true,
  limit: '1mb'
}));

// ============================================================
// ROUTES
// ============================================================

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Flood Prediction Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/readings', sensorRoutes);
app.use('/api/auth', authRoutes);

// Risk calculation endpoint (placeholder - will be implemented with ML models)
app.get('/api/risk', async (req, res) => {
  try {
    const { location, water_level, rainfall, soil_moisture } = req.query;

    // Validate input
    if (!location && !water_level && !rainfall && !soil_moisture) {
      return res.status(400).json({
        error: 'At least one parameter required: location, water_level, rainfall, or soil_moisture',
        code: 'MISSING_PARAMETERS'
      });
    }

    // Placeholder risk calculation (to be replaced with actual ML models)
    // This is a simple rule-based system for now
    let riskScore = 0;
    let riskLevel = 'normal';
    let factors = [];

    // Water level risk
    if (water_level) {
      const wl = parseFloat(water_level);
      if (wl > 5) {
        riskScore += 40;
        factors.push({ factor: 'water_level', value: wl, weight: 40, reason: 'High water level' });
      } else if (wl > 3) {
        riskScore += 25;
        factors.push({ factor: 'water_level', value: wl, weight: 25, reason: 'Elevated water level' });
      } else if (wl > 1) {
        riskScore += 10;
        factors.push({ factor: 'water_level', value: wl, weight: 10, reason: 'Moderate water level' });
      }
    }

    // Rainfall risk
    if (rainfall) {
      const rf = parseFloat(rainfall);
      if (rf > 50) {
        riskScore += 35;
        factors.push({ factor: 'rainfall', value: rf, weight: 35, reason: 'Heavy rainfall' });
      } else if (rf > 25) {
        riskScore += 20;
        factors.push({ factor: 'rainfall', value: rf, weight: 20, reason: 'Moderate rainfall' });
      } else if (rf > 10) {
        riskScore += 10;
        factors.push({ factor: 'rainfall', value: rf, weight: 10, reason: 'Light rainfall' });
      }
    }

    // Soil moisture risk
    if (soil_moisture) {
      const sm = parseFloat(soil_moisture);
      if (sm > 80) {
        riskScore += 25;
        factors.push({ factor: 'soil_moisture', value: sm, weight: 25, reason: 'Saturated soil' });
      } else if (sm > 60) {
        riskScore += 15;
        factors.push({ factor: 'soil_moisture', value: sm, weight: 15, reason: 'Wet soil' });
      }
    }

    // Determine risk level
    if (riskScore >= 70) {
      riskLevel = 'critical';
    } else if (riskScore >= 50) {
      riskLevel = 'high';
    } else if (riskScore >= 30) {
      riskLevel = 'warning';
    } else if (riskScore >= 10) {
      riskLevel = 'watch';
    }

    // Cap risk score at 100
    riskScore = Math.min(riskScore, 100);

    // Add timestamp and location
    const response = {
      location: location || 'unknown',
      risk_score: riskScore,
      risk_level: riskLevel,
      factors: factors,
      timestamp: new Date().toISOString(),
      model_version: 'rule_based_v1.0',
      note: 'This is a placeholder risk calculation. Replace with ML model integration.'
    };

    res.json(response);
  } catch (error) {
    console.error('Risk calculation error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'CALCULATION_ERROR',
      message: NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'Flood Prediction Backend API',
    version: '1.0.0',
    description: 'Backend API for flood prediction system',
    endpoints: {
      health: {
        method: 'GET',
        path: '/api/health',
        description: 'Check API health and database connection'
      },
      readings: {
        list: {
          method: 'GET',
          path: '/api/readings',
          description: 'Get latest sensor readings'
        },
        byLocation: {
          method: 'GET',
          path: '/api/readings/:location',
          description: 'Get readings for a specific location'
        },
        create: {
          method: 'POST',
          path: '/api/readings',
          description: 'Insert a new sensor reading'
        }
      },
      auth: {
        info: {
          method: 'GET',
          path: '/api/auth',
          description: 'Get authentication information'
        },
        currentUser: {
          method: 'GET',
          path: '/api/auth/me',
          description: 'Get current authenticated user'
        },
        signUp: {
          method: 'POST',
          path: '/api/auth/signup',
          description: 'Create a new user account'
        },
        signIn: {
          method: 'POST',
          path: '/api/auth/signin',
          description: 'Sign in with email and password'
        },
        signOut: {
          method: 'POST',
          path: '/api/auth/signout',
          description: 'Sign out current user'
        },
        resetPassword: {
          method: 'POST',
          path: '/api/auth/reset-password',
          description: 'Request password reset email'
        }
      },
      risk: {
        calculate: {
          method: 'GET',
          path: '/api/risk',
          description: 'Calculate flood risk score (placeholder)'
        }
      }
    },
    authentication: {
      enabled: true,
      providers: ['firebase_auth'],
      oauth: ['google', 'github']
    },
    timestamps: {
      generated: new Date().toISOString()
    }
  });
});

// API health endpoint with database check
app.get('/api/health', async (req, res) => {
  try {
    // Check if services are available
    const services = {
      api: 'healthy',
      environment: NODE_ENV
    };

    // Try to connect to database (if supabase is configured)
    try {
      const { supabase } = require('./config/supabase');
      if (supabase) {
        const { error } = await supabase
          .from('sensor_readings')
          .select('*')
          .limit(1);

        services.database = error ? 'unhealthy' : 'healthy';
        services.database_error = error ? error.message : null;
      } else {
        services.database = 'not_configured';
      }
    } catch (dbError) {
      services.database = 'unhealthy';
      services.database_error = dbError.message;
    }

    // Check Firebase
    try {
      const { isConfigured } = require('./config/firebase-client');
      services.firebase = isConfigured() ? 'configured' : 'not_configured';
    } catch {
      services.firebase = 'not_configured';
    }

    // Determine overall status
    const allHealthy = Object.values(services).every(s => s === 'healthy' || s === 'configured');
    const status = allHealthy ? 'healthy' : 'degraded';

    res.status(allHealthy ? 200 : 503).json({
      status,
      services,
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ============================================================
// ERROR HANDLING
// ============================================================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// ============================================================
// START SERVER
// ============================================================

const server = app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║                    FLOOD PREDICTION BACKEND                          ║
╠══════════════════════════════════════════════════════════════════════╣
║  Port:           ${PORT.toString().padStart(5)}                                       ║
║  Environment:    ${NODE_ENV.padEnd(50)}║
║  Node Version:   ${process.version.padEnd(50)}║
║  Uptime:         ${process.uptime().toFixed(2)}s                                  ║
╠══════════════════════════════════════════════════════════════════════╣
║  Available Routes:                                                   ║
║  • GET  /                         - Health check                     ║
║  • GET  /api                      - API documentation               ║
║  • GET  /api/health               - Detailed health check          ║
║  • GET  /api/readings             - Get latest sensor readings     ║
║  • GET  /api/readings/:location   - Get readings by location       ║
║  • POST /api/readings             - Insert new sensor reading      ║
║  • GET  /api/risk                 - Calculate flood risk score     ║
║  • GET  /api/auth                 - Auth information               ║
║  • POST /api/auth/signup          - Create user account            ║
║  • POST /api/auth/signin          - Sign in user                   ║
║  • POST /api/auth/signout         - Sign out user                  ║
║  • POST /api/auth/reset-password  - Request password reset         ║
╚══════════════════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\nSIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Export for testing
module.exports = { app, server };
module.exports.default = app;
