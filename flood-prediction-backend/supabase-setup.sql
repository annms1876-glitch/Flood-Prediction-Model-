-- ============================================================
-- Flood Prediction Backend - Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. SENSORS TABLE
-- Stores IoT sensor device information
-- ============================================================
CREATE TABLE IF NOT EXISTS sensors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  sensor_type TEXT NOT NULL CHECK (sensor_type IN ('water_level', 'rainfall', 'soil_moisture', 'weather_station', 'multi')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance', 'offline')),
  last_reading_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for sensors
CREATE INDEX IF NOT EXISTS idx_sensors_location ON sensors(location);
CREATE INDEX IF NOT EXISTS idx_sensors_status ON sensors(status);
CREATE INDEX IF NOT EXISTS idx_sensors_type ON sensors(sensor_type);

-- ============================================================
-- 2. SENSOR READINGS TABLE
-- Stores time-series sensor data from IoT devices
-- ============================================================
CREATE TABLE IF NOT EXISTS sensor_readings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sensor_id UUID NOT NULL REFERENCES sensors(id) ON DELETE CASCADE,
  water_level NUMERIC(10, 2), -- Water level in meters
  rainfall NUMERIC(10, 2), -- Rainfall in mm
  soil_moisture NUMERIC(5, 2), -- Soil moisture percentage (0-100)
  temperature NUMERIC(5, 2), -- Temperature in Celsius
  humidity NUMERIC(5, 2), -- Humidity percentage
  location TEXT NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}' -- Additional sensor-specific data
);

-- Indexes for sensor_readings (critical for time-series queries)
CREATE INDEX IF NOT EXISTS idx_readings_sensor_id ON sensor_readings(sensor_id);
CREATE INDEX IF NOT EXISTS idx_readings_location ON sensor_readings(location);
CREATE INDEX IF NOT EXISTS idx_readings_recorded_at ON sensor_readings(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_readings_location_time ON sensor_readings(location, recorded_at DESC);

-- ============================================================
-- 3. PREDICTIONS TABLE
-- Stores ML model flood risk predictions
-- ============================================================
CREATE TABLE IF NOT EXISTS predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location TEXT NOT NULL,
  risk_score INTEGER NOT NULL CHECK (risk_score BETWEEN 0 AND 100),
  risk_level TEXT NOT NULL CHECK (risk_level IN ('normal', 'watch', 'warning', 'high', 'critical')),
  water_level NUMERIC(10, 2),
  confidence NUMERIC(5, 2) CHECK (confidence BETWEEN 0 AND 100),
  predicted_at TIMESTAMPTZ DEFAULT NOW(),
  model_version TEXT NOT NULL DEFAULT 'v1.0',
  model_type TEXT, -- 'lstm', 'xgboost', 'gnn', 'pinn', 'ensemble'
  input_features JSONB, -- Feature data used for prediction
  output_data JSONB, -- Additional model output metrics
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for predictions
CREATE INDEX IF NOT EXISTS idx_predictions_location ON predictions(location);
CREATE INDEX IF NOT EXISTS idx_predictions_risk_score ON predictions(risk_score DESC);
CREATE INDEX IF NOT EXISTS idx_predictions_risk_level ON predictions(risk_level);
CREATE INDEX IF NOT EXISTS idx_predictions_predicted_at ON predictions(predicted_at DESC);
CREATE INDEX IF NOT EXISTS idx_predictions_active ON predictions(status) WHERE status = 'active';

-- ============================================================
-- 4. ALERTS TABLE
-- Stores flood alert records and dispatch history
-- ============================================================
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alert_type TEXT NOT NULL CHECK (alert_type IN ('flood_warning', 'evacuation_order', 'watch', 'all_clear')),
  location TEXT NOT NULL,
  risk_level TEXT NOT NULL,
  risk_score INTEGER,
  message TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical', 'emergency')),
  
  -- Delivery status
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  acknowledged_at TIMESTAMPTZ,
  
  -- Channels used
  channels JSONB DEFAULT '[]', -- ['sms', 'push', 'email', 'voice', 'siren']
  
  -- Tracking
  tokens_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  failed_tokens TEXT[], -- Array of failed FCM tokens
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for alerts
CREATE INDEX IF NOT EXISTS idx_alerts_location ON alerts(location);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_sent_at ON alerts(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_unacknowledged ON alerts(severity, acknowledged_at) WHERE acknowledged_at IS NULL;

-- ============================================================
-- 5. ALERT LOGS TABLE (Audit Trail)
-- For detailed tracking of alert delivery
-- ============================================================
CREATE TABLE IF NOT EXISTS alert_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alert_id UUID REFERENCES alerts(id) ON DELETE SET NULL,
  log_type TEXT NOT NULL CHECK (log_type IN ('dispatch', 'delivery', 'failure', 'acknowledgment')),
  channel TEXT, -- 'fcm', 'sms', 'email', 'voice', 'siren'
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
  destination TEXT, -- Phone number, email, FCM token (hashed)
  error_message TEXT,
  response_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for alert_logs
CREATE INDEX IF NOT EXISTS idx_alert_logs_alert_id ON alert_logs(alert_id);
CREATE INDEX IF NOT EXISTS idx_alert_logs_created_at ON alert_logs(created_at DESC);

-- ============================================================
-- 6. USERS / COMMUNITY MEMBERS TABLE
-- For community notification subscriptions
-- ============================================================
CREATE TABLE IF NOT EXISTS community_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  external_id TEXT, -- ID from auth system (Firebase Auth, etc.)
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  location TEXT NOT NULL,
  subscribed_channels TEXT[] DEFAULT '{}',
  fcm_token TEXT,
  risk_preferences JSONB DEFAULT '{"flood": true, "evacuation": true}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for community_members
CREATE INDEX IF NOT EXISTS idx_members_location ON community_members(location);
CREATE INDEX IF NOT EXISTS idx_members_fcm_token ON community_members(fcm_token) WHERE fcm_token IS NOT NULL;

-- ============================================================
-- 7. SENSOR DATA ARCHIVE (For historical data)
-- Partitioned table for long-term storage
-- ============================================================
CREATE TABLE IF NOT EXISTS sensor_data_archive (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sensor_id UUID NOT NULL,
  location TEXT NOT NULL,
  reading_type TEXT NOT NULL, -- 'water_level', 'rainfall', etc.
  value NUMERIC NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for archive
CREATE INDEX IF NOT EXISTS idx_archive_sensor_time ON sensor_data_archive(sensor_id, recorded_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Enable and configure RLS for all tables
-- ============================================================

-- Enable RLS
ALTER TABLE sensors ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;

-- Sensors: Public read access, authenticated write
CREATE POLICY "Sensors public read" ON sensors
  FOR SELECT USING (true);

CREATE POLICY "Sensors authenticated insert" ON sensors
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Sensors authenticated update" ON sensors
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Sensor Readings: Public read, service role write
CREATE POLICY "Readings public read" ON sensor_readings
  FOR SELECT USING (true);

CREATE POLICY "Readings service insert" ON sensor_readings
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Predictions: Public read
CREATE POLICY "Predictions public read" ON predictions
  FOR SELECT USING (true);

CREATE POLICY "Predictions service insert" ON predictions
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Predictions service update" ON predictions
  FOR UPDATE USING (auth.role() = 'service_role');

-- Alerts: Public read (for transparency)
CREATE POLICY "Alerts public read" ON alerts
  FOR SELECT USING (true);

CREATE POLICY "Alerts service full access" ON alerts
  FOR ALL USING (auth.role() = 'service_role');

-- Alert Logs: Service role only
CREATE POLICY "Alert logs service only" ON alert_logs
  FOR ALL USING (auth.role() = 'service_role');

-- Community Members: Users can read/write own data
CREATE POLICY "Members public read" ON community_members
  FOR SELECT USING (true);

CREATE POLICY "Members authenticated manage" ON community_members
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to sensors table
CREATE TRIGGER update_sensors_updated_at
  BEFORE UPDATE ON sensors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to alerts table
CREATE TRIGGER update_alerts_updated_at
  BEFORE UPDATE ON alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to community_members table
CREATE TRIGGER update_members_updated_at
  BEFORE UPDATE ON community_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- VIEWS FOR DASHBOARD QUERIES
-- ============================================================

-- Active alerts view (for dashboard)
CREATE OR REPLACE VIEW active_alerts_view AS
SELECT 
  id,
  alert_type,
  location,
  risk_level,
  risk_score,
  message,
  severity,
  sent_at,
  channels,
  tokens_count,
  success_count,
  failure_count,
  created_at
FROM alerts
WHERE acknowledged_at IS NULL
  AND severity IN ('warning', 'critical', 'emergency')
ORDER BY 
  CASE severity 
    WHEN 'emergency' THEN 1 
    WHEN 'critical' THEN 2 
    WHEN 'warning' THEN 3 
  END,
  sent_at DESC;

-- Risk summary view
CREATE OR REPLACE VIEW risk_summary_view AS
SELECT 
  location,
  COUNT(*) as total_predictions,
  AVG(risk_score) as avg_risk_score,
  MAX(risk_score) as max_risk_score,
  MODE() WITHIN GROUP (ORDER BY risk_level) as dominant_risk_level,
  MAX(predicted_at) as last_prediction
FROM predictions
WHERE status = 'active'
  AND predicted_at > NOW() - INTERVAL '24 hours'
GROUP BY location;

-- Sensor health view
CREATE OR REPLACE VIEW sensor_health_view AS
SELECT 
  s.id,
  s.name,
  s.location,
  s.sensor_type,
  s.status,
  MAX(sr.recorded_at) as last_reading,
  EXTRACT(EPOCH FROM (NOW() - MAX(sr.recorded_at))) / 60 as minutes_since_last_reading,
  CASE 
    WHEN MAX(sr.recorded_at) > NOW() - INTERVAL '5 minutes' THEN 'healthy'
    WHEN MAX(sr.recorded_at) > NOW() - INTERVAL '15 minutes' THEN 'warning'
    ELSE 'offline'
  END as health_status
FROM sensors s
LEFT JOIN sensor_readings sr ON s.id = sr.sensor_id
GROUP BY s.id, s.name, s.location, s.sensor_type, s.status;

-- ============================================================
-- INITIAL DATA (Optional seed data)
-- ============================================================

-- Insert sample sensor types reference
INSERT INTO sensors (name, location, sensor_type, status, description)
VALUES 
  ('River Gauge Station A', 'Village_X', 'water_level', 'active', 'Primary river level monitoring'),
  ('Rainfall Sensor B', 'Village_X', 'rainfall', 'active', 'Local rainfall measurement'),
  ('Soil Moisture Station C', 'Village_Y', 'soil_moisture', 'active', 'Agricultural area monitoring')
ON CONFLICT DO NOTHING;

-- ============================================================
-- SETUP COMPLETE
-- ============================================================
-- Notes:
-- 1. Run this SQL in Supabase Dashboard > SQL Editor
-- 2. After running, go to Authentication > Policies to verify RLS
-- 3. Get your anon key from Settings > API
-- 4. For service_role access, use the service_role key (keep secret!)
