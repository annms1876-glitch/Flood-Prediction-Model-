// API Routes - Consolidated endpoints for flood prediction backend
// All routes using Supabase service for data operations

const express = require('express');
const router = express.Router();

// Import Supabase service
const supabaseService = require('../services/supabaseService');

// ============================================================
// POST /api/readings
// Insert a new sensor reading
// Request body: { location, rainfall_mm, water_level_m, soil_moisture_percent, tilt_degrees, temperature_c, humidity_percent }
// ============================================================

router.post('/readings', async (req, res) => {
  try {
    const { location, rainfall_mm, water_level_m, soil_moisture_percent, tilt_degrees, temperature_c, humidity_percent } = req.body;

    // Validate required fields
    if (!location) {
      return res.status(400).json({
        success: false,
        error: 'Location is required',
        code: 'MISSING_LOCATION',
        timestamp: new Date().toISOString()
      });
    }

    // Insert sensor reading using supabaseService
    const result = await supabaseService.insertSensorReading({
      location,
      rainfall_mm,
      water_level_m,
      soil_moisture_percent,
      tilt_degrees,
      temperature_c,
      humidity_percent
    });

    res.status(201).json({
      success: true,
      data: result,
      message: 'Sensor reading inserted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error inserting sensor reading:', error);

    // Handle specific errors
    if (error.message === 'Location is required') {
      return res.status(400).json({
        success: false,
        error: error.message,
        code: 'VALIDATION_ERROR',
        timestamp: new Date().toISOString()
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to insert sensor reading',
      code: 'INSERT_ERROR',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    });
  }
});

// ============================================================
// GET /api/readings
// Get the latest sensor readings
// Query params: limit (default: 100)
// ============================================================

router.get('/readings', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;

    // Validate limit
    if (isNaN(limit) || limit < 1) {
      return res.status(400).json({
        success: false,
        error: 'Limit must be a positive number',
        code: 'INVALID_LIMIT',
        timestamp: new Date().toISOString()
      });
    }

    // Cap limit at 1000
    const clampedLimit = Math.min(limit, 1000);

    // Get latest readings using supabaseService
    const readings = await supabaseService.getLatestReadings(clampedLimit);

    res.json({
      success: true,
      count: readings.length,
      data: readings,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching latest readings:', error);

    res.status(500).json({
      success: false,
      error: 'Failed to fetch sensor readings',
      code: 'FETCH_ERROR',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    });
  }
});

// ============================================================
// GET /api/readings/:location
// Get readings for a specific location
// ============================================================

router.get('/readings/:location', async (req, res) => {
  try {
    const { location } = req.params;
    const limit = parseInt(req.query.limit) || 100;

    // Validate limit
    if (isNaN(limit) || limit < 1) {
      return res.status(400).json({
        success: false,
        error: 'Limit must be a positive number',
        code: 'INVALID_LIMIT',
        timestamp: new Date().toISOString()
      });
    }

    const clampedLimit = Math.min(limit, 1000);

    // Get readings by location using supabaseService
    const readings = await supabaseService.getReadingsByLocation(location, clampedLimit);

    res.json({
      success: true,
      location,
      count: readings.length,
      data: readings,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Error fetching readings for location ${req.params.location}:`, error);

    // Handle specific errors
    if (error.message === 'Location parameter is required') {
      return res.status(400).json({
        success: false,
        error: error.message,
        code: 'VALIDATION_ERROR',
        timestamp: new Date().toISOString()
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to fetch sensor readings',
      code: 'FETCH_ERROR',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    });
  }
});

// ============================================================
// GET /api/risk
// Calculate and return risk score based on latest reading
// Placeholder: simple average of normalized values
// Returns: { risk_score, risk_level, timestamp }
// ============================================================

router.get('/risk', async (req, res) => {
  try {
    // Get the latest reading
    const readings = await supabaseService.getLatestReadings(1);

    if (readings.length === 0) {
      return res.json({
        risk_score: 0,
        risk_level: 'normal',
        message: 'No sensor data available',
        timestamp: new Date().toISOString(),
        model_version: 'placeholder_v1.0'
      });
    }

    const latest = readings[0];

    // Calculate risk score using placeholder logic
    // Normalize values and calculate average
    let riskScore = 0;
    let factors = [];

    // Water level contribution (0-100 scale, assume 5m = max risk)
    if (latest.water_level_m !== null && latest.water_level_m !== undefined) {
      const waterLevelRisk = Math.min((latest.water_level_m / 5) * 100, 100);
      riskScore += waterLevelRisk * 0.4; // 40% weight
      factors.push({
        factor: 'water_level',
        value: latest.water_level_m,
        unit: 'm',
        contribution: Math.round(waterLevelRisk * 0.4)
      });
    }

    // Rainfall contribution (0-100 scale, assume 50mm = max risk)
    if (latest.rainfall_mm !== null && latest.rainfall_mm !== undefined) {
      const rainfallRisk = Math.min((latest.rainfall_mm / 50) * 100, 100);
      riskScore += rainfallRisk * 0.3; // 30% weight
      factors.push({
        factor: 'rainfall',
        value: latest.rainfall_mm,
        unit: 'mm',
        contribution: Math.round(rainfallRisk * 0.3)
      });
    }

    // Soil moisture contribution (0-100 scale, assume 80% = max risk)
    if (latest.soil_moisture_percent !== null && latest.soil_moisture_percent !== undefined) {
      const soilMoistureRisk = Math.min((latest.soil_moisture_percent / 80) * 100, 100);
      riskScore += soilMoistureRisk * 0.2; // 20% weight
      factors.push({
        factor: 'soil_moisture',
        value: latest.soil_moisture_percent,
        unit: '%',
        contribution: Math.round(soilMoistureRisk * 0.2)
      });
    }

    // Tilt contribution (0-100 scale, assume 10° = max risk)
    if (latest.tilt_degrees !== null && latest.tilt_degrees !== undefined) {
      const tiltRisk = Math.min((Math.abs(latest.tilt_degrees) / 10) * 100, 100);
      riskScore += tiltRisk * 0.1; // 10% weight
      factors.push({
        factor: 'tilt',
        value: latest.tilt_degrees,
        unit: '°',
        contribution: Math.round(tiltRisk * 0.1)
      });
    }

    // Round risk score
    riskScore = Math.round(riskScore);

    // Determine risk level based on score
    let riskLevel;
    if (riskScore >= 80) {
      riskLevel = 'critical';
    } else if (riskScore >= 60) {
      riskLevel = 'high';
    } else if (riskScore >= 40) {
      riskLevel = 'warning';
    } else if (riskScore >= 20) {
      riskLevel = 'watch';
    } else {
      riskLevel = 'normal';
    }

    // Add location info if available
    const response = {
      risk_score: riskScore,
      risk_level: riskLevel,
      location: latest.location || 'unknown',
      timestamp: latest.recorded_at || new Date().toISOString(),
      model_version: 'placeholder_v1.0',
      factors: factors.length > 0 ? factors : undefined
    };

    res.json(response);
  } catch (error) {
    console.error('Error calculating risk score:', error);

    res.status(500).json({
      success: false,
      error: 'Failed to calculate risk score',
      code: 'CALCULATION_ERROR',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    });
  }
});

// ============================================================
// GET /api/readings/health
// Check if sensor readings endpoint is working
// ============================================================

router.get('/readings/health', async (req, res) => {
  try {
    const isInitialized = supabaseService.isInitialized();

    if (!isInitialized) {
      return res.status(503).json({
        status: 'unhealthy',
        database: 'not_configured',
        timestamp: new Date().toISOString()
      });
    }

    // Try a simple query
    const readings = await supabaseService.getLatestReadings(1);

    res.json({
      status: 'healthy',
      database: 'connected',
      has_data: readings.length > 0,
      reading_count: readings.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check error:', error);

    res.status(503).json({
      status: 'unhealthy',
      database: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ============================================================
// Export router
// ============================================================

module.exports = router;
