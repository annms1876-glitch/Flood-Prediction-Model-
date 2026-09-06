/**
 * ML Service Client
 * Handles communication with the Python ML microservice
 */

const ML_API_URL = process.env.ML_API_URL || 'http://localhost:8000';

class MLService {
  constructor() {
    this.baseUrl = ML_API_URL;
    this.timeout = 10000;
  }

  /**
   * Make a request to the ML service
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`ML service error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('ML service request timeout');
      }
      throw error;
    }
  }

  /**
   * Check ML service health
   */
  async healthCheck() {
    return this.request('/health');
  }

  /**
   * Get model information
   */
  async getModelInfo() {
    return this.request('/model/info');
  }

  /**
   * Run ML prediction for a location
   * @param {string} location - Location identifier
   * @param {Array} readings - Array of sensor readings
   * @param {number} prevWaterLevel - Previous water level
   * @returns {Object} ML prediction result
   */
  async predict(location, readings, prevWaterLevel = 0) {
    return this.request('/predict', {
      method: 'POST',
      body: JSON.stringify({
        location,
        readings,
        prev_water_level: prevWaterLevel,
      }),
    });
  }

  /**
   * Run rule-based prediction (fallback)
   * @param {string} location - Location identifier
   * @param {Array} readings - Array of sensor readings
   * @returns {Object} Rule-based prediction result
   */
  async predictRuleBased(location, readings) {
    return this.request('/predict/rule-based', {
      method: 'POST',
      body: JSON.stringify({
        location,
        readings,
      }),
    });
  }

  /**
   * Run batch predictions for multiple locations
   * @param {Array} locations - Array of location identifiers
   * @returns {Object} Batch prediction results
   */
  async predictBatch(locations) {
    return this.request('/predict/batch', {
      method: 'POST',
      body: JSON.stringify({
        locations,
        readings_per_location: 15,
      }),
    });
  }

  /**
   * Get ML service statistics
   */
  async getStats() {
    return this.request('/stats');
  }

  /**
   * Get prediction with fallback to rule-based
   * @param {string} location - Location identifier
   * @param {Array} readings - Array of sensor readings
   * @returns {Object} Prediction result
   */
  async getPrediction(location, readings) {
    try {
      return await this.predict(location, readings);
    } catch (error) {
      console.warn('ML prediction failed, falling back to rule-based:', error.message);
      return this.predictRuleBased(location, readings);
    }
  }
}

// Export singleton instance
const mlService = new MLService();
module.exports = mlService;
module.exports.MLService = MLService;
