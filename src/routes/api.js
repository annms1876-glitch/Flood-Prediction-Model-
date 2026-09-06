// API Routes Definition
// Defines all endpoint routes for the flood prediction backend

const express = require('express');
const router = express.Router();

const supabaseService = require('../services/supabaseService');
const firebaseService = require('../services/firebaseService');

/**
 * Health check endpoint
 * GET /api/health
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    services: {
      supabase: supabaseService.isReady(),
      firebase: firebaseService.isReady()
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * Get all active sensors
 * GET /api/sensors
 */
router.get('/sensors', async (req, res) => {
  try {
    const sensors = await supabaseService.getActiveSensors();
    res.json({
      success: true,
      count: sensors.length,
      data: sensors
    });
  } catch (error) {
    console.error('Error fetching sensors:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sensors',
      message: error.message
    });
  }
});

/**
 * Get sensor readings for a location
 * GET /api/sensors/:location/readings
 */
router.get('/sensors/:location/readings', async (req, res) => {
  try {
    const { location } = req.params;
    const limit = parseInt(req.query.limit) || 100;

    if (!location) {
      return res.status(400).json({
        success: false,
        error: 'Location parameter is required'
      });
    }

    const readings = await supabaseService.getSensorReadings(location, limit);
    res.json({
      success: true,
      location,
      count: readings.length,
      data: readings
    });
  } catch (error) {
    console.error('Error fetching sensor readings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sensor readings',
      message: error.message
    });
  }
});

/**
 * Create sensor reading (internal use)
 * POST /api/sensors/readings
 */
router.post('/sensors/readings', async (req, res) => {
  try {
    const { sensor_id, water_level, rainfall, soil_moisture, temperature, location } = req.body;

    if (!sensor_id || !location) {
      return res.status(400).json({
        success: false,
        error: 'sensor_id and location are required'
      });
    }

    const reading = await supabaseService.insertSensorReading({
      sensor_id,
      water_level: water_level || 0,
      rainfall: rainfall || 0,
      soil_moisture: soil_moisture || 0,
      temperature: temperature || 0,
      location
    });

    res.status(201).json({
      success: true,
      data: reading
    });
  } catch (error) {
    console.error('Error creating sensor reading:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create sensor reading',
      message: error.message
    });
  }
});

/**
 * Get flood predictions/risk scores
 * GET /api/predictions
 */
router.get('/predictions', async (req, res) => {
  try {
    const minRiskScore = parseInt(req.query.min_risk) || 50;
    const alerts = await supabaseService.getActiveAlerts(minRiskScore);

    res.json({
      success: true,
      count: alerts.length,
      min_risk_threshold: minRiskScore,
      data: alerts
    });
  } catch (error) {
    console.error('Error fetching predictions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch predictions',
      message: error.message
    });
  }
});

/**
 * Create flood prediction
 * POST /api/predictions
 */
router.post('/predictions', async (req, res) => {
  try {
    const { location, risk_score, risk_level, water_level, confidence, model_version } = req.body;

    if (!location || !risk_score) {
      return res.status(400).json({
        success: false,
        error: 'location and risk_score are required'
      });
    }

    // Determine risk level if not provided
    const level = risk_level || this.calculateRiskLevel(risk_score);

    const prediction = await supabaseService.insertPrediction({
      location,
      risk_score,
      risk_level: level,
      water_level: water_level || 0,
      confidence: confidence || 0,
      model_version
    });

    res.status(201).json({
      success: true,
      data: prediction
    });
  } catch (error) {
    console.error('Error creating prediction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create prediction',
      message: error.message
    });
  }
});

/**
 * Calculate risk level from score
 * @param {number} score - Risk score (0-100)
 * @returns {string} Risk level
 */
function calculateRiskLevel(score) {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 40) return 'warning';
  if (score >= 20) return 'watch';
  return 'normal';
}

/**
 * Send flood alert notification
 * POST /api/alerts/send
 */
router.post('/alerts/send', async (req, res) => {
  try {
    const { tokens, alert_data } = req.body;

    if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'tokens array is required'
      });
    }

    if (!alert_data) {
      return res.status(400).json({
        success: false,
        error: 'alert_data is required'
      });
    }

    const result = await firebaseService.sendFloodAlert(tokens, alert_data);

    // Log the alert
    await firebaseService.logAlert({
      type: 'flood_alert',
      risk_level: alert_data.risk_level,
      location: alert_data.location,
      tokens_count: tokens.length,
      success_count: result.success_count || 0,
      failure_count: result.failure_count || 0
    });

    res.json({
      success: true,
      sent: result.success_count || 0,
      failed: result.failure_count || 0,
      total: tokens.length
    });
  } catch (error) {
    console.error('Error sending alert:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send alert',
      message: error.message
    });
  }
});

/**
 * Get single sensor by ID
 * GET /api/sensors/:id
 */
router.get('/sensors/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!supabaseService.isReady()) {
      return res.status(503).json({
        success: false,
        error: 'Database service unavailable'
      });
    }

    // This would need implementation in supabaseService
    res.json({
      success: true,
      data: { id, message: 'Sensor detail endpoint ready' }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get risk summary for dashboard
 * GET /api/dashboard/summary
 */
router.get('/dashboard/summary', async (req, res) => {
  try {
    const alerts = await supabaseService.getActiveAlerts(40);

    const summary = {
      total_alerts: alerts.length,
      critical: alerts.filter(a => a.risk_level === 'critical').length,
      high: alerts.filter(a => a.risk_level === 'high').length,
      warning: alerts.filter(a => a.risk_level === 'warning').length,
      watch: alerts.filter(a => a.risk_level === 'watch').length,
      locations: [...new Set(alerts.map(a => a.location))].length
    };

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard summary',
      message: error.message
    });
  }
});

module.exports = router;
