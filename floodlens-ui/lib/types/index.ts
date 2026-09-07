export interface SensorReading {
  location: string;
  timestamp?: string;
  water_level_m?: number;
  rainfall_mm?: number;
  soil_moisture_percent?: number;
  tilt_degrees?: number;
  temperature_c?: number;
  humidity_percent?: number;
}

export interface PredictionResponse {
  location: string;
  risk_score: number;
  risk_level: string;
  flood_probability: number;
  predicted_water_level?: number;
  lead_time_hours?: number;
  models?: {
    lstm?: { prediction: number; weight: number };
    xgboost?: { correction?: number; prediction?: number; weight: number };
    gnn?: { prediction: number; weight: number };
    pinn?: { prediction: number; weight: number };
  };
  recommendations?: string[];
  model_version?: string;
}

export interface RiskScore {
  risk_score: number;
  risk_level: string;
  location?: string;
  timestamp: string;
  model_version?: string;
  factors?: Array<{
    factor: string;
    value: number;
    unit: string;
    contribution: number;
  }>;
}

export interface Sensor {
  location: string;
  last_reading?: SensorReading;
  status: "online" | "offline" | "warning";
  risk_level?: string;
  last_updated?: string;
}

export interface Alert {
  id: string;
  location: string;
  severity: "normal" | "watch" | "warning" | "high" | "critical";
  message: string;
  status: "sent" | "delivered" | "failed";
  timestamp: string;
}

export interface DemoScenario {
  key: string;
  name: string;
  description: string;
  icon: string;
}

export interface DemoPrediction {
  scenario: string;
  description: string;
  icon: string;
  risk_score: number;
  risk_level: string;
  flood_probability: number;
  predicted_water_level: number;
  lead_time_hours: number;
  models: {
    lstm: { prediction: number; weight: number };
    xgboost: { correction: number; weight: number };
    gnn: { prediction: number; weight: number };
    pinn: { prediction: number; weight: number };
  };
  recommendations: string[];
  model_version: string;
}

export interface ModelInfo {
  model_version: string;
  models: string[];
  formula: string;
}

export interface EnsembleBreakdown {
  lstm: { prediction: number; weight: number; contribution: number };
  xgboost: { prediction: number; weight: number; contribution: number };
  gnn: { prediction: number; weight: number; contribution: number };
  pinn: { prediction: number; weight: number; contribution: number };
}

export interface FeatureConfig {
  name: string;
  key: string;
  unit: string;
  min: number;
  max: number;
  label: string;
}

export interface SensorFormData {
  location: string;
  water_level_m: number;
  rainfall_mm: number;
  soil_moisture_percent: number;
  tilt_degrees: number;
  temperature_c: number;
  humidity_percent: number;
  water_level_delta: number;
  rainfall_delta: number;
}
