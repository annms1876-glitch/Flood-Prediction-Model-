// Flood Prediction Backend - Main Express Server
// Complete API server with CORS, body parsing, and all routes

// Load environment variables first
require('dotenv').config();

// Import Express and middleware
const express = require('express');
const cors = require('cors');

// Import Supabase client
const { supabase } = require('./config/supabase');

// Import routes
const sensorRoutes = require('./routes/sensors');
const apiRoutes = require('./routes/api');
const authRoutes = require('./routes/auth');

// Swagger/OpenAPI setup (js-yaml parses the YAML spec; require would return an empty object)
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
let swaggerSpec = {};
try {
  swaggerSpec = yaml.load(fs.readFileSync(path.join(__dirname, '../swagger.yaml'), 'utf8'));
} catch (e) {
  console.warn('⚠️  swagger.yaml not found or invalid, docs disabled');
}
const { rateLimitMiddleware } = require('./middleware/rateLimit');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const riskService = require('./services/riskService');
const alertService = require('./services/alertService');

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
// REAL-TIME SUBSCRIPTIONS (Supabase)
// ============================================================

// Set up real-time subscription for sensor readings
// This listens for new INSERT events on the sensor_readings table
if (supabase && process.env.SUPABASE_URL && !process.env.SUPABASE_URL.includes('your-project')) {
  const previousRiskResults = new Map();
  
  try {
  const channel = supabase
    .channel('sensor-readings')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'sensor_readings'
      },
      async (payload) => {
        console.log('\n📊 New sensor reading received:', payload.new.location);
        console.log('   Rainfall:', payload.new.rainfall_mm, 'mm');
        console.log('   Water Level:', payload.new.water_level_m, 'm');
        console.log('   Soil Moisture:', payload.new.soil_moisture_percent, '%');
        
        try {
          // Calculate risk for this reading
          const riskResult = await riskService.calculateRiskWithTrend(payload.new, previousRiskResults.get(payload.new.location));
          
          // Store for trend detection
          previousRiskResults.set(payload.new.location, riskResult);
          
          // Log risk result
          console.log(`   Risk Score: ${riskResult.risk_score}/100 (${riskResult.risk_level.toUpperCase()})`);
          console.log(`   Trend: ${riskResult.trend} (${riskResult.trend_description})`);
          
          // Check for rapid changes and send alerts
          const rapidChangeAlert = alertService.checkRapidChange(riskResult, previousRiskResults.get(payload.new.location));
          
          // Process risk result and send alerts if needed
          if (riskResult.requires_action) {
            console.log(`\n🚨 REQUIRES ACTION: ${riskResult.risk_level.toUpperCase()} risk in ${payload.new.location}`);
            const alertResult = await alertService.processRiskResult(riskResult);
            console.log(`   Alert sent via: ${alertResult.channels_used?.join(', ') || 'none'}`);
          }
          
          console.log('='.repeat(60));
        } catch (error) {
          console.error('❌ Error processing sensor reading:', error.message);
        }
      }
    )
    .subscribe((status, err) => {
      if (status === 'SUBSCRIBED') {
        console.log('✅ Real-time subscription established for sensor_readings');
        console.log('   Listening for INSERT events...');
        console.log('   When new readings arrive, risk will be calculated automatically.\n');
      } else if (status === 'TIMED_OUT') {
        console.warn('⚠️  Real-time subscription timed out');
      } else if (err) {
        console.error('❌ Real-time subscription error:', err.message);
      }
    });

  // Store channel reference for cleanup on shutdown
  app.set('realtimeChannel', channel);
  } catch (e) {
    console.warn('⚠️  Real-time subscription setup failed:', e.message);
  }
} else {
  console.warn('⚠️  Supabase not configured. Real-time subscriptions disabled.');
}

// ============================================================
// ROUTES
// ============================================================

// Dead-simple health check - always responds, no dependencies
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Health check endpoint (Render health check lives at /api/health)
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
app.use('/api/readings', apiRoutes); // Consolidated API routes
app.use('/api/sensors', sensorRoutes);
app.use('/api/auth', authRoutes);

// Swagger UI documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: `
    .swagger-ui .topbar { display: none; }
    .swagger-ui .topbar-wrapper { display: none; }
  `,
  customSiteTitle: 'Flood Prediction API Documentation',
  explorer: true,
  filter: true
}));

// Redirect root to Swagger UI (Express serves the last matching route)
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

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

// Subscription health check endpoint
app.get('/api/subscription/health', (req, res) => {
  const channel = app.get('realtimeChannel');
  
  res.json({
    status: channel ? 'connected' : 'disconnected',
    channel_name: channel ? 'sensor-readings' : null,
    database: supabase ? 'connected' : 'not_configured',
    timestamp: new Date().toISOString()
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

    // Check Firebase (optional service — absence is degraded, not unhealthy)
    try {
      const { isConfigured } = require('./config/firebase-client');
      services.firebase = isConfigured() ? 'configured' : 'not_configured';
    } catch {
      services.firebase = 'not_configured';
    }

    // The API process itself is the health signal. Optional services
    // (Supabase/Firebase) are reported but must not fail Render's health
    // check — otherwise the deploy is marked unhealthy when only env vars
    // are missing.
    res.status(200).json({
      status: 'healthy',
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

// ============================================================
// KEEP-ALIVE MECHANISM (Prevent Render/Platform from sleeping)
// Pings own health endpoint every 4 minutes in production
// ============================================================

// Only enable keep-alive in production (not during local dev)
const ENABLE_KEEP_ALIVE = NODE_ENV === 'production';
const KEEP_ALIVE_INTERVAL_MINUTES = parseInt(process.env.KEEP_ALIVE_INTERVAL_MINUTES) || 4;

if (ENABLE_KEEP_ALIVE) {
  const http = require('http');
  
  console.log(`\n🔄 Keep-alive enabled: pinging /api/health every ${KEEP_ALIVE_INTERVAL_MINUTES} minutes`);
  
  // Create a simple HTTP client for keep-alive pings
  function pingHealthEndpoint() {
    const url = new URL(`/api/health`, process.env.INTERNAL_URL || `http://localhost:${PORT}`);
    
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
      method: 'GET',
      timeout: 5000 // 5 second timeout
    };
    
    const req = http.request(options, (res) => {
      res.on('data', () => {});
      res.on('end', () => {
        // Health ping successful - no need to log every time to avoid clutter
      });
    });
    
    req.on('error', (error) => {
      // Silently fail - we don't want to spam logs if health check fails
      // The server will still be running, just the health check had an issue
    });
    
    req.on('timeout', () => {
      req.destroy();
    });
    
    req.end();
  }
  
  // Start keep-alive interval
  const keepAliveIntervalMs = KEEP_ALIVE_INTERVAL_MINUTES * 60 * 1000;
  setInterval(pingHealthEndpoint, keepAliveIntervalMs);
  
  // Ping immediately on startup to ensure first keep-alive happens promptly
  setTimeout(pingHealthEndpoint, 1000);
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\nSIGTERM received. Shutting down gracefully...');
  
  // Unsubscribe from real-time channels
  const channel = app.get('realtimeChannel');
  if (channel && typeof channel.unsubscribe === 'function') {
    channel.unsubscribe();
    console.log('✅ Real-time subscriptions closed');
  }
  
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received. Shutting down gracefully...');
  
  // Unsubscribe from real-time channels
  const channel = app.get('realtimeChannel');
  if (channel && typeof channel.unsubscribe === 'function') {
    channel.unsubscribe();
    console.log('✅ Real-time subscriptions closed');
  }
  
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Export for testing
module.exports = { app, server };
module.exports.default = app;
