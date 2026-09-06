// Data Simulator
// Generates realistic mock sensor data and inserts it into the database
// Useful for testing without real sensors

const https = require('https');
const http = require('http');

class DataSimulator {
  constructor(options = {}) {
    this.apiBaseUrl = options.apiBaseUrl || process.env.API_BASE_URL || 'http://localhost:3000';
    this.intervalMs = options.intervalMs || 5000; // 5 seconds default
    this.locations = options.locations || ['village_a', 'village_b', 'river_sensor_1', 'lake_sensor_1'];
    this.stormProbability = options.stormProbability || 0.10; // 10% chance of storm
    
    // Base values for normal conditions
    this.baseValues = {
      rainfall_mm: 5,
      water_level_m: 2.0,
      soil_moisture_percent: 50,
      tilt_degrees: 0.5,
      temperature_c: 25,
      humidity_percent: 65
    };
    
    // Storm multipliers
    this.stormMultipliers = {
      rainfall_mm: 8,        // 8x rainfall
      water_level_m: 2.5,    // 2.5x water level
      soil_moisture_percent: 1.4, // 40% increase
      tilt_degrees: 1.5,     // 50% increase
      temperature_c: 0.9,    // 10% decrease (storm clouds)
      humidity_percent: 1.3   // 30% increase
    };
    
    // Randomness ranges (normal conditions)
    this.ranges = {
      rainfall_mm: { min: 0, max: 50 },
      water_level_m: { min: 0.5, max: 8 },
      soil_moisture_percent: { min: 20, max: 90 },
      tilt_degrees: { min: 0, max: 2 },
      temperature_c: { min: 18, max: 30 },
      humidity_percent: { min: 40, max: 90 }
    };
    
    this.timer = null;
    this.isRunning = false;
    this.readingsGenerated = 0;
    this.lastReading = null;
  }

  /**
   * Generate a random value within range
   */
  randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  /**
   * Generate realistic sensor data for a location
   */
  generateReading(location) {
    const isStorm = Math.random() < this.stormProbability;
    
    let values;
    
    if (isStorm) {
      console.log(`⛈️  STORM CONDITIONS at ${location}!`);
      values = {
        rainfall_mm: this.randomInRange(25, 50) * this.stormMultipliers.rainfall_mm,
        water_level_m: this.randomInRange(3, 8) * this.stormMultipliers.water_level_m,
        soil_moisture_percent: this.randomInRange(60, 90) * this.stormMultipliers.soil_moisture_percent,
        tilt_degrees: this.randomInRange(0.5, 2) * this.stormMultipliers.tilt_degrees,
        temperature_c: this.randomInRange(18, 24) * this.stormMultipliers.temperature_c,
        humidity_percent: this.randomInRange(70, 90) * this.stormMultipliers.humidity_percent
      };
      
      // Clamp values to valid ranges
      values.rainfall_mm = Math.min(values.rainfall_mm, this.ranges.rainfall_mm.max);
      values.water_level_m = Math.min(values.water_level_m, this.ranges.water_level_m.max);
      values.soil_moisture_percent = Math.min(values.soil_moisture_percent, this.ranges.soil_moisture_percent.max);
      values.humidity_percent = Math.min(values.humidity_percent, this.ranges.humidity_percent.max);
    } else {
      // Normal conditions with some randomness
      values = {
        rainfall_mm: this.randomInRange(this.ranges.rainfall_mm.min, this.ranges.rainfall_mm.max),
        water_level_m: this.randomInRange(this.ranges.water_level_m.min, this.ranges.water_level_m.max),
        soil_moisture_percent: this.randomInRange(this.ranges.soil_moisture_percent.min, this.ranges.soil_moisture_percent.max),
        tilt_degrees: this.randomInRange(this.ranges.tilt_degrees.min, this.ranges.tilt_degrees.max),
        temperature_c: this.randomInRange(this.ranges.temperature_c.min, this.ranges.temperature_c.max),
        humidity_percent: this.randomInRange(this.ranges.humidity_percent.min, this.ranges.humidity_percent.max)
      };
    }

    // Round to reasonable precision
    values.rainfall_mm = Math.round(values.rainfall_mm * 10) / 10;
    values.water_level_m = Math.round(values.water_level_m * 100) / 100;
    values.soil_moisture_percent = Math.round(values.soil_moisture_percent);
    values.tilt_degrees = Math.round(values.tilt_degrees * 100) / 100;
    values.temperature_c = Math.round(values.temperature_c * 10) / 10;
    values.humidity_percent = Math.round(values.humidity_percent);

    return {
      location,
      ...values,
      recorded_at: new Date().toISOString()
    };
  }

  /**
   * Insert a reading via the API
   */
  async insertReading(reading) {
    const url = `${this.apiBaseUrl}/api/readings`;
    
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(reading);
      
      const options = {
        hostname: new URL(this.apiBaseUrl).hostname,
        port: new URL(this.apiBaseUrl).port || 3000,
        path: '/api/readings',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(result);
            } else {
              reject(new Error(`HTTP ${res.statusCode}: ${result.error || 'Unknown error'}`));
            }
          } catch (e) {
            reject(new Error(`Failed to parse response: ${e.message}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`Request failed: ${error.message}`));
      });

      req.write(postData);
      req.end();
    });
  }

  /**
   * Generate and insert a single reading
   */
  async generateAndInsert() {
    // Pick random location
    const location = this.locations[Math.floor(Math.random() * this.locations.length)];
    
    // Generate reading
    const reading = this.generateReading(location);
    this.lastReading = reading;
    this.readingsGenerated++;

    console.log(`\n${'='.repeat(50)}`);
    console.log(`📡 Sensor Reading #${this.readingsGenerated}`);
    console.log(`='.repeat(50)}`);
    console.log(`Location: ${reading.location}`);
    console.log(`Timestamp: ${reading.recorded_at}`);
    console.log(`─'.repeat(50)}`);
    console.log(`Rainfall: ${reading.rainfall_mm} mm`);
    console.log(`Water Level: ${reading.water_level_m} m`);
    console.log(`Soil Moisture: ${reading.soil_moisture_percent}%`);
    console.log(`Tilt: ${reading.tilt_degrees}°`);
    console.log(`Temperature: ${reading.temperature_c}°C`);
    console.log(`Humidity: ${reading.humidity_percent}%`);
    console.log(`='.repeat(50)}\n`);

    // Insert via API
    try {
      const result = await this.insertReading(reading);
      console.log('✅ Reading inserted successfully!');
      return { success: true, reading, result };
    } catch (error) {
      console.error('❌ Failed to insert reading:', error.message);
      return { success: false, reading, error: error.message };
    }
  }

  /**
   * Start the simulator
   * @param {number} intervalMs - Optional custom interval in milliseconds
   */
  start(intervalMs = null) {
    if (this.isRunning) {
      console.log('⏳ Simulator already running');
      return;
    }

    if (intervalMs !== null) {
      this.intervalMs = intervalMs;
    }

    this.isRunning = true;
    console.log(`🚀 Data Simulator started - generating readings every ${this.intervalMs}ms`);
    console.log(`   Locations: ${this.locations.join(', ')}`);
    console.log(`   Storm probability: ${(this.stormProbability * 100)}%`);
    console.log(`   API URL: ${this.apiBaseUrl}\n`);

    // Generate first reading immediately
    this.generateAndInsert().catch(console.error);

    // Set up interval
    this.timer = setInterval(() => {
      if (this.isRunning) {
        this.generateAndInsert().catch(console.error);
      }
    }, this.intervalMs);
  }

  /**
   * Stop the simulator
   */
  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
    console.log(`⏹️  Data Simulator stopped`);
  }

  /**
   * Generate multiple readings at once (for testing)
   * @param {number} count - Number of readings to generate
   * @param {number} delayMs - Delay between readings (default: 100ms)
   */
  async generateBulk(count, delayMs = 100) {
    console.log(`📊 Generating ${count} readings...\n`);
    
    for (let i = 0; i < count; i++) {
      const result = await this.generateAndInsert();
      
      if (i < count - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
    
    console.log(`\n✅ Generated ${count} readings`);
    return this.readingsGenerated;
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      isRunning: this.isRunning,
      readingsGenerated: this.readingsGenerated,
      intervalMs: this.intervalMs,
      locations: this.locations,
      stormProbability: this.stormProbability,
      apiUrl: this.apiBaseUrl,
      lastReading: this.lastReading
    };
  }

  /**
   * Update configuration
   * @param {Object} options
   */
  configure(options) {
    if (options.apiBaseUrl) this.apiBaseUrl = options.apiBaseUrl;
    if (options.intervalMs) this.intervalMs = options.intervalMs;
    if (options.locations) this.locations = options.locations;
    if (options.stormProbability !== undefined) this.stormProbability = options.stormProbability;
    if (options.baseValues) this.baseValues = { ...this.baseValues, ...options.baseValues };
    if (options.ranges) this.ranges = { ...this.ranges, ...options.ranges };
    
    console.log('🔧 Data Simulator reconfigured');
  }
}

// Singleton instance
const dataSimulator = new DataSimulator({
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
  intervalMs: 5000,
  locations: ['village_a', 'village_b', 'river_sensor_1'],
  stormProbability: 0.10
});

export { DataSimulator };
export default dataSimulator;
