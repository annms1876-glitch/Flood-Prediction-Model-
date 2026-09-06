// Risk Calculation Service
// Calculates flood risk scores based on sensor readings
// Can be triggered by real-time subscriptions or API calls

class RiskCalculationService {
  constructor(options = {}) {
    this.options = options;
    
    // Weights for each factor (configurable)
    this.weights = {
      water_level: options.waterLevelWeight || 0.40,    // 40% weight
      rainfall: options.rainfallWeight || 0.30,         // 30% weight
      soil_moisture: options.soilMoistureWeight || 0.20, // 20% weight
      tilt: options.tiltWeight || 0.10,                 // 10% weight
      temperature: options.temperatureWeight || 0,       // Optional
      humidity: options.humidityWeight || 0              // Optional
    };
    
    // Thresholds for normalization (can be configured per location)
    this.thresholds = {
      water_level: {
        warning: 1.0,    // meters - water level at warning threshold
        high: 3.0,       // meters - water level at high threshold
        critical: 5.0    // meters - water level at critical threshold
      },
      rainfall: {
        warning: 10,     // mm - rainfall at warning threshold
        high: 25,        // mm - rainfall at high threshold
        critical: 50     // mm - rainfall at critical threshold
      },
      soil_moisture: {
        warning: 60,     // % - soil moisture at warning threshold
        high: 75,        // % - soil moisture at high threshold
        critical: 90     // % - soil moisture at critical threshold
      },
      tilt: {
        warning: 5,      // degrees - tilt at warning threshold
        high: 10,        // degrees - tilt at high threshold
        critical: 15     // degrees - tilt at critical threshold
      }
    };
    
    // Location-specific thresholds (can override defaults)
    this.locationThresholds = {};
    
    // History for trend analysis
    this.history = new Map(); // location -> array of readings
    this.maxHistorySize = options.maxHistorySize || 100;
  }

  /**
   * Configure location-specific thresholds
   * @param {string} location - Location identifier
   * @param {Object} thresholds - Threshold overrides
   */
  setLocationThresholds(location, thresholds) {
    this.locationThresholds[location] = {
      ...this.thresholds,
      ...thresholds
    };
  }

  /**
   * Get thresholds for a location (uses location-specific or defaults)
   * @private
   */
  _getThresholds(location) {
    return this.locationThresholds[location] || this.thresholds;
  }

  /**
   * Normalize a value to 0-100 scale based on thresholds
   * @private
   */
  _normalize(value, thresholds, factorName) {
    if (value === null || value === undefined) {
      return 0;
    }

    const warnThreshold = thresholds[`${factorName}_warning`] || 0;
    const highThreshold = thresholds[`${factorName}_high`] || 1;
    const criticalThreshold = thresholds[`${factorName}_critical`] || 2;

    if (value >= criticalThreshold) {
      // Above critical: return 100
      return 100;
    } else if (value >= highThreshold) {
      // Between high and critical
      const range = criticalThreshold - highThreshold;
      const normalized = ((value - highThreshold) / range) * 50 + 50;
      return Math.min(100, Math.max(0, normalized));
    } else if (value >= warnThreshold) {
      // Between warning and high
      const range = highThreshold - warnThreshold;
      const normalized = ((value - warnThreshold) / range) * 50;
      return Math.min(50, Math.max(0, normalized));
    } else {
      // Below warning: proportional to warning threshold
      if (warnThreshold === 0) return 0;
      return Math.min(50, (value / warnThreshold) * 50);
    }
  }

  /**
   * Calculate risk contribution from a single factor
   * @private
   */
  _calculateFactorRisk(value, factorName, thresholds) {
    const normalized = this._normalize(value, thresholds, factorName);
    const weight = this.weights[factorName] || 0;
    return {
      raw: normalized,
      weighted: normalized * weight,
      contribution: Math.round(normalized * weight)
    };
  }

  /**
   * Calculate risk score from sensor reading
   * @param {Object} reading - Sensor reading data
   * @param {string} reading.location - Location identifier
   * @param {number} reading.water_level_m - Water level in meters
   * @param {number} reading.rainfall_mm - Rainfall in mm
   * @param {number} reading.soil_moisture_percent - Soil moisture %
   * @param {number} reading.tilt_degrees - Tilt in degrees
   * @param {number} reading.temperature_c - Temperature (optional)
   * @param {number} reading.humidity_percent - Humidity (optional)
   * @returns {Object} Risk calculation result
   */
  calculateRisk(reading) {
    if (!reading || !reading.location) {
      throw new Error('Location is required for risk calculation');
    }

    const thresholds = this._getThresholds(reading.location);
    const factors = [];
    let totalRisk = 0;

    // Water level risk
    if (reading.water_level_m !== null && reading.water_level_m !== undefined) {
      const waterLevelRisk = this._calculateFactorRisk(
        reading.water_level_m,
        'water_level',
        thresholds
      );
      totalRisk += waterLevelRisk.weighted;
      factors.push({
        factor: 'water_level',
        value: reading.water_level_m,
        unit: 'm',
        normalized: Math.round(waterLevelRisk.raw),
        contribution: waterLevelRisk.contribution,
        threshold: thresholds.water_level
      });
    }

    // Rainfall risk
    if (reading.rainfall_mm !== null && reading.rainfall_mm !== undefined) {
      const rainfallRisk = this._calculateFactorRisk(
        reading.rainfall_mm,
        'rainfall',
        thresholds
      );
      totalRisk += rainfallRisk.weighted;
      factors.push({
        factor: 'rainfall',
        value: reading.rainfall_mm,
        unit: 'mm',
        normalized: Math.round(rainfallRisk.raw),
        contribution: rainfallRisk.contribution,
        threshold: thresholds.rainfall
      });
    }

    // Soil moisture risk
    if (reading.soil_moisture_percent !== null && reading.soil_moisture_percent !== undefined) {
      const soilMoistureRisk = this._calculateFactorRisk(
        reading.soil_moisture_percent,
        'soil_moisture',
        thresholds
      );
      totalRisk += soilMoistureRisk.weighted;
      factors.push({
        factor: 'soil_moisture',
        value: reading.soil_moisture_percent,
        unit: '%',
        normalized: Math.round(soilMoistureRisk.raw),
        contribution: soilMoistureRisk.contribution,
        threshold: thresholds.soil_moisture
      });
    }

    // Tilt risk
    if (reading.tilt_degrees !== null && reading.tilt_degrees !== undefined) {
      const tiltRisk = this._calculateFactorRisk(
        Math.abs(reading.tilt_degrees),
        'tilt',
        thresholds
      );
      totalRisk += tiltRisk.weighted;
      factors.push({
        factor: 'tilt',
        value: reading.tilt_degrees,
        unit: '°',
        normalized: Math.round(tiltRisk.raw),
        contribution: tiltRisk.contribution,
        threshold: thresholds.tilt
      });
    }

    // Temperature risk (optional - heat can affect soil conditions)
    if (reading.temperature_c !== null && reading.temperature_c !== undefined && this.weights.temperature > 0) {
      // High temperature (>35°C) can indicate potential drought/flood conditions
      const tempRisk = this._calculateFactorRisk(
        Math.max(0, reading.temperature_c - 25),
        'temperature',
        { warning: 10, high: 20, critical: 30 }
      );
      totalRisk += tempRisk.weighted;
      factors.push({
        factor: 'temperature',
        value: reading.temperature_c,
        unit: '°C',
        normalized: Math.round(tempRisk.raw),
        contribution: tempRisk.contribution
      });
    }

    // Humidity risk (optional)
    if (reading.humidity_percent !== null && reading.humidity_percent !== undefined && this.weights.humidity > 0) {
      const humidityRisk = this._calculateFactorRisk(
        reading.humidity_percent,
        'humidity',
        thresholds
      );
      totalRisk += humidityRisk.weighted;
      factors.push({
        factor: 'humidity',
        value: reading.humidity_percent,
        unit: '%',
        normalized: Math.round(humidityRisk.raw),
        contribution: humidityRisk.contribution
      });
    }

    // Round total risk score
    totalRisk = Math.round(Math.min(100, Math.max(0, totalRisk)));

    // Determine risk level
    const riskLevel = this._getRiskLevel(totalRisk);

    // Check if this reading requires immediate action
    const requiresAction = riskLevel === 'critical' || riskLevel === 'high';

    return {
      location: reading.location,
      risk_score: totalRisk,
      risk_level: riskLevel,
      factors: factors,
      requires_action: requiresAction,
      timestamp: new Date().toISOString(),
      model_version: 'risk_calculator_v1.0',
      // Recommendations based on risk level
      recommendations: this._getRecommendations(riskLevel, reading.location)
    };
  }

  /**
   * Calculate risk with trend analysis
   * Compares current reading with historical data to detect trends
   * @param {Object} reading - Current sensor reading
   * @param {Array} history - Optional historical readings for trend analysis
   * @returns {Object} Risk calculation with trend analysis
   */
  calculateRiskWithTrend(reading, history = null) {
    // Calculate current risk
    const currentRisk = this.calculateRisk(reading);

    // Store in history
    const location = reading.location;
    if (!this.history.has(location)) {
      this.history.set(location, []);
    }
    const historyArr = this.history.get(location);
    historyArr.push({
      ...reading,
      risk_score: currentRisk.risk_score,
      risk_level: currentRisk.risk_level,
      calculated_at: currentRisk.timestamp
    });

    // Trim history
    if (historyArr.length > this.maxHistorySize) {
      historyArr.shift();
    }

    // Calculate trend if we have enough history
    let trend = 'stable';
    let trendDescription = 'No significant change';
    let trendRate = 0;

    if (historyArr.length >= 3) {
      const recentReadings = historyArr.slice(-5);
      const scores = recentReadings.map(r => r.risk_score);

      // Simple linear trend
      const n = scores.length;
      const sumX = (n * (n - 1)) / 2;
      const sumY = scores.reduce((a, b) => a + b, 0);
      const sumXY = scores.reduce((acc, score, i) => acc + i * score, 0);
      const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;

      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

      trendRate = slope;

      if (slope > 2) {
        trend = 'increasing';
        trendDescription = `Risk increasing by ~${Math.round(slope)} points per reading`;
      } else if (slope < -2) {
        trend = 'decreasing';
        trendDescription = `Risk decreasing by ~${Math.round(Math.abs(slope))} points per reading`;
      }
    }

    // Check for rapid changes
    const hasRapidChange = historyArr.length >= 2 &&
      Math.abs(historyArr[historyArr.length - 1].risk_score - historyArr[historyArr.length - 2].risk_score) >= 20;

    return {
      ...currentRisk,
      trend,
      trend_description: trendDescription,
      trend_rate: Math.round(trendRate),
      has_rapid_change: hasRapidChange,
      history_size: historyArr.length
    };
  }

  /**
   * Get recommendations based on risk level and location
   * @private
   */
  _getRecommendations(riskLevel, location) {
    const recommendations = {
      normal: [
        { action: 'No action required', priority: 'low', message: `Conditions are normal in ${location}` }
      ],
      watch: [
        { action: 'Monitor', priority: 'low', message: `Continue monitoring conditions in ${location}` }
      ],
      warning: [
        { action: 'Prepare', priority: 'medium', message: `Be prepared for potential flooding in ${location}` },
        { action: 'Monitor', priority: 'medium', message: `Check sensors regularly in ${location}` }
      ],
      high: [
        { action: 'Alert', priority: 'high', message: `Flood risk is high in ${location}. Alert authorities.` },
        { action: 'Prepare', priority: 'high', message: `Prepare evacuation plans for ${location}` },
        { action: 'Notify', priority: 'high', message: `Notify residents in ${location} about potential flooding` }
      ],
      critical: [
        { action: 'Evacuate', priority: 'emergency', message: `IMMEDIATE EVACUATION RECOMMENDED for ${location}` },
        { action: 'Alert', priority: 'emergency', message: `CRITICAL FLOOD RISK in ${location}. Send emergency alerts.` },
        { action: 'Deploy', priority: 'emergency', message: `Deploy emergency response team to ${location}` },
        { action: 'Notify', priority: 'emergency', message: `Send urgent notifications to all residents in ${location}` }
      ]
    };

    return recommendations[riskLevel] || recommendations.normal;
  }

  /**
   * Get risk level from score
   * @private
   */
  _getRiskLevel(score) {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 40) return 'warning';
    if (score >= 20) return 'watch';
    return 'normal';
  }

  /**
   * Clear history for a location
   */
  clearHistory(location) {
    this.history.delete(location);
  }

  /**
   * Clear all history
   */
  clearAllHistory() {
    this.history.clear();
  }

  /**
   * Get history size for a location
   */
  getHistorySize(location) {
    return this.history.get(location)?.length || 0;
  }

  /**
   * Export history for a location (for external storage)
   */
  exportHistory(location) {
    return this.history.get(location) || [];
  }
}

// Singleton instance
const riskService = new RiskCalculationService();

// Export the class and singleton
module.exports = riskService;
module.exports.RiskCalculationService = RiskCalculationService;
module.exports.default = riskService;
