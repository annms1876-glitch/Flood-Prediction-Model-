// TypeScript Type Definitions for Sensor Readings
// These types can be used with TypeScript or as documentation for JavaScript

/**
 * Sensor reading data for insertion
 */
export interface SensorReadingInput {
  /**
   * Location identifier (e.g., "village_a", "sensor_001")
   */
  location: string;

  /**
   * Rainfall in millimeters
   * Range: 0-500 mm
   */
  rainfall_mm?: number | null;

  /**
   * Water level in meters
   * Range: 0-100 meters
   */
  water_level_m?: number | null;

  /**
   * Soil moisture percentage
   * Range: 0-100%
   */
  soil_moisture_percent?: number | null;

  /**
   * Sensor tilt in degrees
   * Range: -90 to 90 degrees
   */
  tilt_degrees?: number | null;

  /**
   * Temperature in Celsius
   * Range: -50 to 60°C
   */
  temperature_c?: number | null;

  /**
   * Humidity percentage
   * Range: 0-100%
   */
  humidity_percent?: number | null;

  /**
   * Timestamp of reading (ISO 8601 format)
   * Defaults to current time if not provided
   */
  recorded_at?: string | null;
}

/**
 * Complete sensor reading from database
 */
export interface SensorReading extends SensorReadingInput {
  /**
   * Unique identifier
   */
  id: string;

  /**
   * Creation timestamp
   */
  created_at: string;

  /**
   * Update timestamp
   */
  updated_at?: string;
}

/**
 * Aggregated sensor reading data
 */
export interface AggregatedSensorReading {
  location: string;
  time_bucket: string;
  avg_water_level: number | null;
  max_water_level: number | null;
  min_water_level: number | null;
  avg_rainfall: number | null;
  total_rainfall: number | null;
  avg_soil_moisture: number | null;
  avg_temperature: number | null;
  avg_humidity: number | null;
  reading_count: number;
}

/**
 * Statistical summary for a location
 */
export interface SensorStats {
  location: string;
  reading_count: number;
  latest_reading: SensorReading | null;
  first_reading: SensorReading | null;
  statistics: {
    water_level: {
      min: number;
      max: number;
      avg: number;
      unit: 'meters';
    };
    rainfall: {
      total: number;
      avg: number;
      unit: 'mm';
    };
    temperature: {
      min: number;
      max: number;
      avg: number;
      unit: 'celsius';
    };
  };
}

/**
 * Real-time subscription payload
 */
export interface RealtimePayload {
  /**
   * Operation type: INSERT, UPDATE, DELETE
   */
  event: 'INSERT' | 'UPDATE' | 'DELETE';

  /**
   * New data (for INSERT/UPDATE)
   */
  new: SensorReading | null;

  /**
   * Old data (for UPDATE/DELETE)
   */
  old: SensorReading | null;

  /**
   * Table name
   */
  table: string;

  /**
   * Schema name
   */
  schema: string;
}

/**
 * Subscription instance returned from subscribeToReadings
 */
export interface RealtimeSubscription {
  /**
   * Unsubscribe from real-time updates
   */
  unsubscribe: () => void;

  /**
   * Check if subscription is active
   */
  isSubscribed: () => boolean;
}

/**
 * API Response types
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  message?: string;
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  /**
   * Number of items to return (default: 100, max: 1000)
   */
  limit?: number;

  /**
   * Offset for pagination
   */
  offset?: number;

  /**
   * Sort order
   */
  sort?: 'asc' | 'desc';
}

/**
 * Aggregation options
 */
export interface AggregationOptions {
  /**
   * Time grouping: 'hour', 'day', 'week'
   */
  groupBy?: 'hour' | 'day' | 'week';

  /**
   * Number of groups to return (default: 24)
   */
  limit?: number;
}

/**
 * Sensor reading validation errors
 */
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

/**
 * Validation result
 */
export interface ValidationResult {
  success: boolean;
  errors?: ValidationError[];
}

/**
 * Convert JavaScript object to TypeScript-friendly format
 */
export type SensorReadingInputSanitized = Omit<SensorReadingInput, 'recorded_at'> & {
  recorded_at?: string;
};

/**
 * Query parameters for API endpoints
 */
export interface SensorQueryParams extends PaginationOptions {
  location?: string;
  min_risk?: number;
  risk_level?: string;
  start_date?: string;
  end_date?: string;
}
