// Supabase Service Layer
// Provides abstracted data access methods for the flood prediction system

const supabaseConfig = require('../config/supabase');


class SupabaseService {
  constructor() {
    this.supabase = supabaseConfig.supabase;
    this.initialized = supabaseConfig.isInitialized();
  }

  /**
   * Check if service is ready
   */
  isReady() {
    return this.initialized;
  }

  /**
   * Insert a new flood sensor reading
   * @param {Object} data - Sensor reading data
   * @param {number} data.sensor_id - Sensor identifier
   * @param {number} data.water_level - Water level in meters
   * @param {number} data.rainfall - Rainfall in mm
   * @param {number} data.soil_moisture - Soil moisture percentage
   * @param {number} data.temperature - Temperature in Celsius
   * @param {string} data.location - Location identifier
   * @returns {Promise<Object>} Insert result
   */
  async insertSensorReading(data) {
    if (!this.supabase) {
      throw new Error('Supabase not initialized');
    }

    const { data: result, error } = await this.supabase
      .from('sensor_readings')
      .insert({
        sensor_id: data.sensor_id,
        water_level: data.water_level,
        rainfall: data.rainfall,
        soil_moisture: data.soil_moisture,
        temperature: data.temperature,
        location: data.location,
        recorded_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  /**
   * Get recent sensor readings for a location
   * @param {string} location - Location identifier
   * @param {number} limit - Number of records to retrieve
   * @returns {Promise<Array>} Sensor readings
   */
  async getSensorReadings(location, limit = 100) {
    if (!this.supabase) {
      throw new Error('Supabase not initialized');
    }

    const { data, error } = await this.supabase
      .from('sensor_readings')
      .select('*')
      .eq('location', location)
      .order('recorded_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  /**
   * Get all active sensors
   * @returns {Promise<Array>} Active sensors list
   */
  async getActiveSensors() {
    if (!this.supabase) {
      throw new Error('Supabase not initialized');
    }

    const { data, error } = await this.supabase
      .from('sensors')
      .select('*')
      .eq('status', 'active')
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * Insert flood prediction result
   * @param {Object} prediction - Prediction data
   * @returns {Promise<Object>} Insert result
   */
  async insertPrediction(prediction) {
    if (!this.supabase) {
      throw new Error('Supabase not initialized');
    }

    const { data, error } = await this.supabase
      .from('predictions')
      .insert({
        location: prediction.location,
        risk_score: prediction.risk_score,
        risk_level: prediction.risk_level,
        water_level: prediction.water_level,
        confidence: prediction.confidence,
        predicted_at: new Date().toISOString(),
        model_version: prediction.model_version || 'v1.0'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get flood alerts above threshold
   * @param {number} minRiskScore - Minimum risk score to filter
   * @returns {Promise<Array>} Active alerts
   */
  async getActiveAlerts(minRiskScore = 50) {
    if (!this.supabase) {
      throw new Error('Supabase not initialized');
    }

    const { data, error } = await this.supabase
      .from('predictions')
      .select('*')
      .gte('risk_score', minRiskScore)
      .order('risk_score', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];
  }
}

// Singleton instance
const supabaseService = new SupabaseService();

module.exports = supabaseService;

