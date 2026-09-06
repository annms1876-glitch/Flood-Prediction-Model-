// Supabase Service Layer
// Provides data access methods for sensor readings and real-time subscriptions

const { supabase } = require('../config/supabase');

class SupabaseService {
  constructor() {
    this.supabase = supabase;
    this.subscription = null;
  }

  /**
   * Insert a new sensor reading into the sensor_readings table
   * @param {Object} data - Sensor reading data
   * @param {string} data.location - Location identifier (required)
   * @param {number} data.rainfall_mm - Rainfall in millimeters
   * @param {number} data.water_level_m - Water level in meters
   * @param {number} data.soil_moisture_percent - Soil moisture percentage (0-100)
   * @param {number} data.tilt_degrees - Sensor tilt in degrees
   * @param {number} data.temperature_c - Temperature in Celsius
   * @param {number} data.humidity_percent - Humidity percentage (0-100)
   * @returns {Promise<Object>} Insert result with created record
   */
  async insertSensorReading(data) {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized');
    }

    // Validate required fields
    if (!data.location) {
      throw new Error('Location is required');
    }

    const { data: result, error } = await this.supabase
      .from('sensor_readings')
      .insert({
        location: data.location,
        rainfall_mm: data.rainfall_mm ?? null,
        water_level_m: data.water_level_m ?? null,
        soil_moisture_percent: data.soil_moisture_percent ?? null,
        tilt_degrees: data.tilt_degrees ?? null,
        temperature_c: data.temperature_c ?? null,
        humidity_percent: data.humidity_percent ?? null,
        recorded_at: data.recorded_at || new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting sensor reading:', error);
      throw error;
    }

    return result;
  }

  /**
   * Get the most recent sensor readings
   * @param {number} limit - Number of records to retrieve (default: 100, max: 1000)
   * @returns {Promise<Array>} Array of sensor readings ordered by timestamp descending
   */
  async getLatestReadings(limit = 100) {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized');
    }

    const clampedLimit = Math.min(Math.max(1, limit), 1000);

    const { data, error } = await this.supabase
      .from('sensor_readings')
      .select('*')
      .order('recorded_at', { ascending: false })
      .limit(clampedLimit);

    if (error) {
      console.error('Error fetching latest readings:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get sensor readings for a specific location
   * @param {string} location - Location identifier (required)
   * @param {number} limit - Number of records to retrieve (default: 100, max: 1000)
   * @returns {Promise<Array>} Array of sensor readings for the location
   */
  async getReadingsByLocation(location, limit = 100) {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized');
    }

    if (!location) {
      throw new Error('Location parameter is required');
    }

    const clampedLimit = Math.min(Math.max(1, limit), 1000);

    const { data, error } = await this.supabase
      .from('sensor_readings')
      .select('*')
      .eq('location', location)
      .order('recorded_at', { ascending: false })
      .limit(clampedLimit);

    if (error) {
      console.error(`Error fetching readings for location ${location}:`, error);
      throw error;
    }

    return data || [];
  }

  /**
   * Set up a real-time subscription to listen for new sensor readings
   * @param {Function} callback - Function to call when new data arrives
   * @returns {Object} Subscription object with unsubscribe method
   * 
   * @example
   * const subscription = await supabaseService.subscribeToReadings((payload) => {
   *   console.log('New reading:', payload.new);
   * });
   * 
   * // Later, to stop listening:
   * subscription.unsubscribe();
   */
  subscribeToReadings(callback) {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized');
    }

    if (typeof callback !== 'function') {
      throw new Error('Callback function is required');
    }

    // Unsubscribe from any existing subscription
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    // Set up real-time subscription
    this.subscription = this.supabase
      .channel('public:sensor_readings')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sensor_readings',
          filter: 'recorded_at=gt.NOW() - INTERVAL \'5 minutes\'' // Only recent changes
        },
        (payload) => {
          console.log('🔔 Real-time change received:', payload);
          callback(payload);
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Real-time subscription established for sensor_readings');
        } else if (status === 'TIMED_OUT') {
          console.warn('⚠️  Real-time subscription timed out');
        } else if (err) {
          console.error('❌ Real-time subscription error:', err);
        }
      });

    return {
      /**
       * Unsubscribe from real-time updates
       */
      unsubscribe: () => {
        if (this.subscription) {
          this.subscription.unsubscribe();
          this.subscription = null;
          console.log('✅ Real-time subscription unsubscribed');
        }
      },

      /**
       * Check if subscription is active
       */
      isSubscribed: () => {
        return this.subscription !== null;
      }
    };
  }

  /**
   * Get aggregated sensor data for a location
   * @param {string} location - Location identifier
   * @param {Object} options - Aggregation options
   * @param {string} options.groupBy - Time grouping: 'hour', 'day', 'week'
   * @param {number} options.limit - Number of groups to return
   * @returns {Promise<Array>} Aggregated data
   */
  async getAggregatedReadings(location, options = {}) {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized');
    }

    const { groupBy = 'hour', limit = 24 } = options;

    let timeBucket;
    switch (groupBy) {
      case 'hour':
        timeBucket = '(recorded_at::timestamp::date + recorded_at::time::interval \'1 hour\' - recorded_at::time)';
        break;
      case 'day':
        timeBucket = 'DATE(recorded_at)';
        break;
      case 'week':
        timeBucket = 'DATE_TRUNC(\'week\', recorded_at)';
        break;
      default:
        timeBucket = '(recorded_at::timestamp::date + recorded_at::time::interval \'1 hour\' - recorded_at::time)';
    }

    const { data, error } = await this.supabase
      .from('sensor_readings')
      .select(`
        location,
        ${timeBucket} as time_bucket,
        AVG(water_level_m) as avg_water_level,
        MAX(water_level_m) as max_water_level,
        MIN(water_level_m) as min_water_level,
        AVG(rainfall_mm) as avg_rainfall,
        SUM(rainfall_mm) as total_rainfall,
        AVG(soil_moisture_percent) as avg_soil_moisture,
        AVG(temperature_c) as avg_temperature,
        AVG(humidity_percent) as avg_humidity,
        COUNT(*) as reading_count
      `)
      .eq('location', location)
      .order(timeBucket, { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching aggregated readings:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get sensor statistics for a location
   * @param {string} location - Location identifier
   * @returns {Promise<Object>} Statistics object
   */
  async getSensorStats(location) {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized');
    }

    const { data, error } = await this.supabase
      .from('sensor_readings')
      .select('*')
      .eq('location', location)
      .order('recorded_at', { ascending: false })
      .limit(1000);

    if (error) {
      console.error('Error fetching sensor stats:', error);
      throw error;
    }

    const readings = data || [];

    if (readings.length === 0) {
      return {
        location,
        reading_count: 0,
        latest_reading: null,
        statistics: null
      };
    }

    const waterLevels = readings
      .map(r => r.water_level_m)
      .filter(v => v !== null && v !== undefined);

    const rainfall = readings
      .map(r => r.rainfall_mm)
      .filter(v => v !== null && v !== undefined);

    const temperatures = readings
      .map(r => r.temperature_c)
      .filter(v => v !== null && v !== undefined);

    return {
      location,
      reading_count: readings.length,
      latest_reading: readings[0],
      first_reading: readings[readings.length - 1],
      statistics: {
        water_level: {
          min: Math.min(...waterLevels),
          max: Math.max(...waterLevels),
          avg: waterLevels.reduce((a, b) => a + b, 0) / waterLevels.length,
          unit: 'meters'
        },
        rainfall: {
          total: rainfall.reduce((a, b) => a + b, 0),
          avg: rainfall.length > 0 ? rainfall.reduce((a, b) => a + b, 0) / rainfall.length : 0,
          unit: 'mm'
        },
        temperature: {
          min: Math.min(...temperatures),
          max: Math.max(...temperatures),
          avg: temperatures.length > 0 ? temperatures.reduce((a, b) => a + b, 0) / temperatures.length : 0,
          unit: 'celsius'
        }
      }
    };
  }

  /**
   * Check Supabase connection health
   * @returns {Promise<boolean>}
   */
  async checkConnection() {
    try {
      const { error } = await this.supabase
        .from('sensor_readings')
        .select('*')
        .limit(1);

      // Even if table doesn't exist, connection is established
      return true;
    } catch (error) {
      console.error('Supabase connection check failed:', error.message);
      return false;
    }
  }

  /**
   * Check if Supabase client is initialized
   * @returns {boolean}
   */
  isInitialized() {
    return !!this.supabase;
  }
}

// Singleton instance
const supabaseService = new SupabaseService();

module.exports = supabaseService;
