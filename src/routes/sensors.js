// Sensor API Routes
// CRUD endpoints for sensor readings using Supabase service

const express = require('express');
const supabaseService = require('../services/supabaseService');
const { validateSensorReading } = require('../middleware/validation');

const router = express.Router();

/**
 * GET /api/sensors/readings
 * Get the most recent sensor readings
 *
 * Query Parameters:
 * - limit: Number of readings to return (default: 100, max: 1000)
 */
router.get('/readings', async (req, res) => {
  try {
    const { limit } = req.query;
    const parsedLimit = limit ? parseInt(limit, 10) : 100;

    const readings = await supabaseService.getLatestReadings(parsedLimit);

    res.json({
      success: true,
      count: readings.length,
      data: readings
    });
  } catch (error) {
    console.error('Error fetching latest readings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sensor readings',
      code: 'FETCH_ERROR',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/sensors/readings/latest
 * Get the single latest sensor reading
 */
router.get('/readings/latest', async (req, res) => {
  try {
    const readings = await supabaseService.getLatestReadings(1);

    if (readings.length === 0) {
      return res.json({
        success: true,
        count: 0,
        data: null,
        message: 'No readings available'
      });
    }

    res.json({
      success: true,
      data: readings[0]
    });
  } catch (error) {
    console.error('Error fetching latest reading:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch latest reading',
      code: 'FETCH_ERROR'
    });
  }
});

/**
 * GET /api/sensors/:location/readings
 * Get sensor readings for a specific location
 *
 * Path Parameters:
 * - location: Location identifier (required)
 *
 * Query Parameters:
 * - limit: Number of readings to return (default: 100, max: 1000)
 */
router.get('/:location/readings', async (req, res) => {
  try {
    const { location } = req.params;
    const { limit } = req.query;
    const parsedLimit = limit ? parseInt(limit, 10) : 100;

    const readings = await supabaseService.getReadingsByLocation(location, parsedLimit);

    res.json({
      success: true,
      location,
      count: readings.length,
      data: readings
    });
  } catch (error) {
    console.error(`Error fetching readings for location ${req.params.location}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sensor readings',
      code: 'FETCH_ERROR',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/sensors/readings
 * Insert a new sensor reading
 *
 * Request Body:
 * - location (required): Location identifier
 * - rainfall_mm: Rainfall in mm
 * - water_level_m: Water level in meters
 * - soil_moisture_percent: Soil moisture percentage (0-100)
 * - tilt_degrees: Sensor tilt in degrees
 * - temperature_c: Temperature in Celsius
 * - humidity_percent: Humidity percentage (0-100)
 */
router.post('/readings', validateSensorReading, async (req, res) => {
  try {
    const { location, rainfall_mm, water_level_m, soil_moisture_percent, tilt_degrees, temperature_c, humidity_percent, recorded_at } = req.body;

    const result = await supabaseService.insertSensorReading({
      location,
      rainfall_mm,
      water_level_m,
      soil_moisture_percent,
      tilt_degrees,
      temperature_c,
      humidity_percent,
      recorded_at
    });

    res.status(201).json({
      success: true,
      data: result,
      message: 'Sensor reading recorded successfully'
    });
  } catch (error) {
    console.error('Error inserting sensor reading:', error);

    // Handle validation errors
    if (error.message === 'Location is required') {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: [{ field: 'location', message: 'Location is required' }]
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to insert sensor reading',
      code: 'INSERT_ERROR',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/sensors/:location/stats
 * Get statistical summary for a location
 *
 * Path Parameters:
 * - location: Location identifier (required)
 */
router.get('/:location/stats', async (req, res) => {
  try {
    const { location } = req.params;

    const stats = await supabaseService.getSensorStats(location);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error(`Error fetching stats for location ${req.params.location}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sensor statistics',
      code: 'FETCH_ERROR'
    });
  }
});

/**
 * GET /api/sensors/:location/aggregated
 * Get aggregated readings for a location over time
 *
 * Path Parameters:
 * - location: Location identifier (required)
 *
 * Query Parameters:
 * - groupBy: Time grouping - 'hour', 'day', 'week' (default: 'hour')
 * - limit: Number of groups to return (default: 24)
 */
router.get('/:location/aggregated', async (req, res) => {
  try {
    const { location } = req.params;
    const { groupBy, limit } = req.query;

    const options = {
      groupBy: ['hour', 'day', 'week'].includes(groupBy) ? groupBy : 'hour',
      limit: limit ? parseInt(limit, 10) : 24
    };

    const aggregated = await supabaseService.getAggregatedReadings(location, options);

    res.json({
      success: true,
      location,
      group_by: options.groupBy,
      count: aggregated.length,
      data: aggregated
    });
  } catch (error) {
    console.error(`Error fetching aggregated data for location ${req.params.location}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch aggregated data',
      code: 'FETCH_ERROR'
    });
  }
});

/**
 * GET /api/sensors/health
 * Check Supabase connection health
 */
router.get('/health', async (req, res) => {
  try {
    const isHealthy = await supabaseService.checkConnection();

    res.json({
      success: true,
      status: isHealthy ? 'healthy' : 'unhealthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking sensor health:', error);
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message
    });
  }
});

/**
 * GET /api/sensors/subscribe
 * Get information about real-time subscriptions
 */
router.get('/subscribe', (req, res) => {
  res.json({
    success: true,
    message: 'To subscribe to real-time updates:',
    instructions: {
      method: 'POST',
      endpoint: '/api/sensors/subscribe',
      body: {
        callback_url: 'https://your-server.com/webhook' // Optional: for HTTP webhook
      },
      description: 'Starts a real-time subscription to sensor_readings table. The callback will receive new INSERT events.'
    }
  });
});

/**
 * POST /api/sensors/subscribe
 * Start a real-time subscription (for server-side use)
 *
 * This endpoint is for demonstration - in production, subscriptions
 * are typically set up in the application logic, not via HTTP endpoint.
 *
 * Request Body (optional):
 * - callback_url: URL to send webhook notifications
 */
router.post('/subscribe', async (req, res) => {
  try {
    // In a real implementation, you might:
    // 1. Store subscription info in database
    // 2. Set up a webhook endpoint
    // 3. Return subscription ID

    const { callback_url } = req.body || {};

    res.json({
      success: true,
      message: 'Real-time subscription mock created',
      subscription: {
        id: `sub_${Date.now()}`,
        channel: 'public:sensor_readings',
        events: ['INSERT'],
        created_at: new Date().toISOString()
      },
      note: 'In production, set up subscriptions in application code using supabaseService.subscribeToReadings(callback)',
      example: {
        code: `const subscription = supabaseService.subscribeToReadings((payload) => {
  console.log('New reading:', payload.new);
});`
      }
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create subscription',
      code: 'SUBSCRIPTION_ERROR'
    });
  }
});

module.exports = router;
