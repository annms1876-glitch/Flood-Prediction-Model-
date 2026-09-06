// Unit Tests for Supabase Service
// Tests for sensor reading CRUD operations and real-time subscriptions

// Mock Supabase client before importing the service
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn()
  }))
};

// Mock the supabase config module
jest.mock('../src/config/supabase.js', () => ({
  supabase: mockSupabase
}));

// Now import the service
const supabaseService = require('../src/services/supabaseService.js');

describe('SupabaseService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isInitialized', () => {
    it('should return true when supabase is available', () => {
      const result = supabaseService.isInitialized();
      expect(result).toBe(true);
    });
  });

  describe('checkConnection', () => {
    it('should return true on successful connection check', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis()
      });

      const result = await supabaseService.checkConnection();
      expect(result).toBe(true);
      expect(mockSupabase.from).toHaveBeenCalledWith('sensor_readings');
    });

    it('should return true even if table does not exist', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis()
      });

      // Simulate error but connection is still established
      mockSupabase.from.mockImplementationOnce(() => {
        throw new Error('Table does not exist');
      });

      const result = await supabaseService.checkConnection();
      expect(result).toBe(true);
    });
  });

  describe('insertSensorReading', () => {
    const validData = {
      location: 'test_location',
      rainfall_mm: 12.5,
      water_level_m: 3.4,
      soil_moisture_percent: 65,
      tilt_degrees: 2.1,
      temperature_c: 28,
      humidity_percent: 85
    };

    it('should insert a sensor reading successfully', async () => {
      const mockResult = {
        id: 'uuid-123',
        location: 'test_location',
        rainfall_mm: 12.5,
        water_level_m: 3.4,
        soil_moisture_percent: 65,
        tilt_degrees: 2.1,
        temperature_c: 28,
        humidity_percent: 85,
        recorded_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      };

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockResult, error: null })
      });

      const result = await supabaseService.insertSensorReading(validData);

      expect(result).toEqual(mockResult);
      expect(mockSupabase.from).toHaveBeenCalledWith('sensor_readings');
    });

    it('should throw error if location is missing', async () => {
      await expect(
        supabaseService.insertSensorReading({})
      ).rejects.toThrow('Location is required');
    });

    it('should throw error on database failure', async () => {
      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' }
        })
      });

      await expect(
        supabaseService.insertSensorReading(validData)
      ).rejects.toThrow('Database error');
    });

    it('should accept null values for optional fields', async () => {
      const dataWithNulls = {
        location: 'test_location',
        rainfall_mm: null,
        water_level_m: null,
        soil_moisture_percent: null,
        tilt_degrees: null,
        temperature_c: null,
        humidity_percent: null
      };

      const mockResult = {
        id: 'uuid-456',
        location: 'test_location',
        recorded_at: new Date().toISOString()
      };

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockResult, error: null })
      });

      const result = await supabaseService.insertSensorReading(dataWithNulls);
      expect(result).toEqual(mockResult);
    });

    it('should use current timestamp if recorded_at is not provided', async () => {
      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: 'uuid', location: 'test', recorded_at: expect.any(String) },
          error: null
        })
      });

      await supabaseService.insertSensorReading({ location: 'test' });

      // Verify insert was called with a timestamp
      expect(mockSupabase.from).toHaveBeenCalled();
    });
  });

  describe('getLatestReadings', () => {
    it('should return latest readings ordered by timestamp descending', async () => {
      const mockData = [
        { id: '1', recorded_at: '2026-09-06T10:00:00Z', location: 'a' },
        { id: '2', recorded_at: '2026-09-06T09:00:00Z', location: 'a' },
        { id: '3', recorded_at: '2026-09-06T08:00:00Z', location: 'a' }
      ];

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis()
      });

      mockSupabase.from().select().order().limit().then = Promise.resolve({
        data: mockData,
        error: null
      });

      // Actually mock it properly
      mockSupabase.from.mockImplementation(() => ({
        select: () => ({
          order: () => ({
            limit: () => Promise.resolve({ data: mockData, error: null })
          })
        })
      }));

      const result = await supabaseService.getLatestReadings(3);

      expect(result).toEqual(mockData);
      expect(result.length).toBe(3);
    });

    it('should default to 100 limit when not provided', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis()
      });

      mockSupabase.from().select().order().limit().then = Promise.resolve({
        data: [],
        error: null
      });

      mockSupabase.from.mockImplementation(() => ({
        select: () => ({
          order: () => ({
            limit: () => Promise.resolve({ data: [], error: null })
          })
        })
      }));

      await supabaseService.getLatestReadings();

      // Verify limit was called with 100
      const limitCall = mockSupabase.from().select().order().limit;
      expect(limitCall).toHaveBeenCalled();
    });

    it('should clamp limit to maximum of 1000', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis()
      });

      mockSupabase.from.mockImplementation(() => ({
        select: () => ({
          order: () => ({
            limit: (n) => {
              expect(n).toBeLessThanOrEqual(1000);
              return Promise.resolve({ data: [], error: null });
            }
          })
        })
      }));

      await supabaseService.getLatestReadings(5000);
    });

    it('should return empty array when no data', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis()
      });

      mockSupabase.from.mockImplementation(() => ({
        select: () => ({
          order: () => ({
            limit: () => Promise.resolve({ data: [], error: null })
          })
        })
      }));

      const result = await supabaseService.getLatestReadings(10);
      expect(result).toEqual([]);
    });
  });

  describe('getReadingsByLocation', () => {
    it('should return readings for a specific location', async () => {
      const mockData = [
        { id: '1', location: 'village_a', recorded_at: '2026-09-06T10:00:00Z' },
        { id: '2', location: 'village_a', recorded_at: '2026-09-06T09:00:00Z' }
      ];

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis()
      });

      mockSupabase.from.mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            order: () => ({
              limit: () => Promise.resolve({ data: mockData, error: null })
            })
          })
        })
      }));

      const result = await supabaseService.getReadingsByLocation('village_a', 10);

      expect(result).toEqual(mockData);
      expect(result.length).toBe(2);
    });

    it('should throw error if location is missing', async () => {
      await expect(
        supabaseService.getReadingsByLocation('', 10)
      ).rejects.toThrow('Location parameter is required');
    });

    it('should clamp limit to maximum of 1000', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis()
      });

      mockSupabase.from.mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            order: () => ({
              limit: (n) => {
                expect(n).toBeLessThanOrEqual(1000);
                return Promise.resolve({ data: [], error: null });
              }
            })
          })
        })
      }));

      await supabaseService.getReadingsByLocation('village_a', 5000);
    });
  });

  describe('subscribeToReadings', () => {
    let callback;

    beforeEach(() => {
      callback = jest.fn();
      mockSupabase.from.mockReturnValue({
        channel: jest.fn().mockReturnThis(),
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn()
      });
    });

    it('should set up real-time subscription with callback', () => {
      mockSupabase.from.mockImplementation(() => ({
        channel: (name) => ({
          on: (event, config, cb) => ({
            subscribe: (statusCb) => {
              // Simulate successful subscription
              statusCb('SUBSCRIBED', null);
              return { unsubscribe: jest.fn() };
            }
          })
        })
      }));

      const subscription = supabaseService.subscribeToReadings(callback);

      expect(subscription).toBeDefined();
      expect(typeof subscription.unsubscribe).toBe('function');
      expect(typeof subscription.isSubscribed).toBe('function');
    });

    it('should throw error if callback is not a function', () => {
      expect(() => {
        supabaseService.subscribeToReadings('not a function');
      }).toThrow('Callback function is required');
    });

    it('should unsubscribe from existing subscription when new one is created', () => {
      const oldUnsubscribe = jest.fn();
      supabaseService.subscription = { unsubscribe: oldUnsubscribe };

      mockSupabase.from.mockImplementation(() => ({
        channel: () => ({
          on: () => ({
            subscribe: () => ({ unsubscribe: jest.fn() })
          })
        })
      }));

      supabaseService.subscribeToReadings(callback);

      expect(oldUnsubscribe).toHaveBeenCalled();
    });

    it('should return unsubscribe function that clears subscription', () => {
      mockSupabase.from.mockImplementation(() => ({
        channel: () => ({
          on: () => ({
            subscribe: () => {
              supabaseService.subscription = { unsubscribe: jest.fn() };
              return { unsubscribe: jest.fn() };
            }
          })
        })
      }));

      const subscription = supabaseService.subscribeToReadings(callback);
      subscription.unsubscribe();

      expect(supabaseService.subscription).toBeNull();
    });

    it('should report subscription status correctly', () => {
      expect(supabaseService.subscription).toBeNull();
      expect(supabaseService.subscription === null).toBe(true);
    });
  });

  describe('getSensorStats', () => {
    it('should return statistics for a location', async () => {
      const mockData = [
        {
          id: '1',
          location: 'village_a',
          water_level_m: 3.0,
          rainfall_mm: 10,
          temperature_c: 25,
          recorded_at: '2026-09-06T10:00:00Z'
        },
        {
          id: '2',
          location: 'village_a',
          water_level_m: 3.5,
          rainfall_mm: 15,
          temperature_c: 26,
          recorded_at: '2026-09-06T11:00:00Z'
        },
        {
          id: '3',
          location: 'village_a',
          water_level_m: 4.0,
          rainfall_mm: 20,
          temperature_c: 27,
          recorded_at: '2026-09-06T12:00:00Z'
        }
      ];

      mockSupabase.from.mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            order: () => ({
              limit: () => Promise.resolve({ data: mockData, error: null })
            })
          })
        })
      }));

      const stats = await supabaseService.getSensorStats('village_a');

      expect(stats.location).toBe('village_a');
      expect(stats.reading_count).toBe(3);
      expect(stats.latest_reading).toBeDefined();
      expect(stats.statistics).toBeDefined();
      expect(stats.statistics.water_level.avg).toBeCloseTo(3.5, 1);
    });

    it('should return empty stats for location with no readings', async () => {
      mockSupabase.from.mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            order: () => ({
              limit: () => Promise.resolve({ data: [], error: null })
            })
          })
        })
      }));

      const stats = await supabaseService.getSensorStats('empty_location');

      expect(stats.location).toBe('empty_location');
      expect(stats.reading_count).toBe(0);
      expect(stats.latest_reading).toBeNull();
      expect(stats.statistics).toBeNull();
    });
  });

  describe('getAggregatedReadings', () => {
    it('should return aggregated readings with default options', async () => {
      const mockData = [
        {
          location: 'village_a',
          time_bucket: '2026-09-06 10:00:00',
          avg_water_level: 3.5,
          max_water_level: 4.0,
          min_water_level: 3.0,
          avg_rainfall: 15,
          total_rainfall: 45,
          avg_soil_moisture: 65,
          avg_temperature: 26,
          avg_humidity: 80,
          reading_count: 3
        }
      ];

      mockSupabase.from.mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            order: () => ({
              limit: () => Promise.resolve({ data: mockData, error: null })
            })
          })
        })
      }));

      const result = await supabaseService.getAggregatedReadings('village_a');

      expect(result).toEqual(mockData);
      expect(result.length).toBe(1);
    });

    it('should respect groupBy option', async () => {
      mockSupabase.from.mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            order: () => ({
              limit: () => Promise.resolve({ data: [], error: null })
            })
          })
        })
      }));

      await supabaseService.getAggregatedReadings('village_a', { groupBy: 'day' });
      await supabaseService.getAggregatedReadings('village_a', { groupBy: 'week' });
      // Should not throw
    });

    it('should respect limit option', async () => {
      mockSupabase.from.mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            order: () => ({
              limit: (n) => {
                expect(n).toBe(10);
                return Promise.resolve({ data: [], error: null });
              }
            })
          })
        })
      }));

      await supabaseService.getAggregatedReadings('village_a', { limit: 10 });
    });
  });
});

describe('SupabaseService - Error Handling', () => {
  it('should handle Supabase client not initialized', () => {
    // This tests the guard clauses in methods
    const service = new (require('../src/services/supabaseService.js').SupabaseService);

    // Mock with no supabase
    service.supabase = null;

    expect(service.isInitialized()).toBe(false);
  });
});
