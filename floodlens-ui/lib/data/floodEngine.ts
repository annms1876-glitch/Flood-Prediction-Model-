import {
  SensorReading,
  PredictionResponse,
  RiskScore,
  Sensor,
  Alert,
  DemoScenario,
  DemoPrediction,
  ModelInfo,
} from "@/lib/types";

export const SCENARIOS: Record<string, {
  name: string;
  description: string;
  icon: string;
  readings: SensorReading[];
  prediction: Omit<DemoPrediction, "scenario" | "description" | "icon" | "model_version">;
}> = {
  normal_day: {
    name: "Normal Day",
    description: "Clear weather, stable river levels",
    icon: "☀️",
    readings: [
      { location: "village_a", water_level_m: 1.2, rainfall_mm: 0.0, soil_moisture_percent: 35, tilt_degrees: 0.2, temperature_c: 28.5, humidity_percent: 55 },
      { location: "village_a", water_level_m: 1.2, rainfall_mm: 0.0, soil_moisture_percent: 34, tilt_degrees: 0.1, temperature_c: 29.0, humidity_percent: 52 },
      { location: "village_a", water_level_m: 1.18, rainfall_mm: 0.0, soil_moisture_percent: 33, tilt_degrees: 0.2, temperature_c: 29.5, humidity_percent: 50 },
    ],
    prediction: {
      risk_score: 12,
      risk_level: "normal",
      flood_probability: 0.08,
      predicted_water_level: 1.25,
      lead_time_hours: 48,
      models: {
        lstm: { prediction: 10.5, weight: 0.4 },
        xgboost: { correction: 1.2, weight: 0.3 },
        gnn: { prediction: 15.0, weight: 0.2 },
        pinn: { prediction: 11.0, weight: 0.1 },
      },
      recommendations: ["No action required", "Conditions are normal"],
    },
  },

  light_rain: {
    name: "Light Rainfall",
    description: "Moderate rain, water levels rising slowly",
    icon: "🌦️",
    readings: [
      { location: "village_a", water_level_m: 1.5, rainfall_mm: 8.2, soil_moisture_percent: 52, tilt_degrees: 0.3, temperature_c: 24.0, humidity_percent: 72 },
      { location: "village_a", water_level_m: 1.7, rainfall_mm: 12.5, soil_moisture_percent: 58, tilt_degrees: 0.4, temperature_c: 23.5, humidity_percent: 75 },
      { location: "village_a", water_level_m: 1.9, rainfall_mm: 15.0, soil_moisture_percent: 63, tilt_degrees: 0.5, temperature_c: 23.0, humidity_percent: 78 },
    ],
    prediction: {
      risk_score: 35,
      risk_level: "watch",
      flood_probability: 0.28,
      predicted_water_level: 2.2,
      lead_time_hours: 24,
      models: {
        lstm: { prediction: 32.0, weight: 0.4 },
        xgboost: { correction: 3.5, weight: 0.3 },
        gnn: { prediction: 38.0, weight: 0.2 },
        pinn: { prediction: 30.0, weight: 0.1 },
      },
      recommendations: ["Continue monitoring", "Check sensor readings regularly"],
    },
  },

  heavy_rain: {
    name: "Heavy Rainfall Warning",
    description: "Intense rain, river levels rising fast",
    icon: "🌧️",
    readings: [
      { location: "village_a", water_level_m: 2.8, rainfall_mm: 35.0, soil_moisture_percent: 78, tilt_degrees: 0.8, temperature_c: 21.0, humidity_percent: 88 },
      { location: "village_a", water_level_m: 3.4, rainfall_mm: 45.0, soil_moisture_percent: 84, tilt_degrees: 1.2, temperature_c: 20.5, humidity_percent: 90 },
      { location: "village_a", water_level_m: 4.1, rainfall_mm: 52.0, soil_moisture_percent: 89, tilt_degrees: 1.8, temperature_c: 20.0, humidity_percent: 92 },
    ],
    prediction: {
      risk_score: 68,
      risk_level: "high",
      flood_probability: 0.72,
      predicted_water_level: 5.2,
      lead_time_hours: 6,
      models: {
        lstm: { prediction: 65.0, weight: 0.4 },
        xgboost: { correction: 4.2, weight: 0.3 },
        gnn: { prediction: 72.0, weight: 0.2 },
        pinn: { prediction: 62.0, weight: 0.1 },
      },
      recommendations: [
        "Alert authorities immediately",
        "Prepare evacuation plans",
        "Notify residents about potential flooding",
      ],
    },
  },

  flood_critical: {
    name: "Critical Flood Alert",
    description: "Dangerous levels, immediate evacuation needed",
    icon: "🚨",
    readings: [
      { location: "village_a", water_level_m: 5.5, rainfall_mm: 85.0, soil_moisture_percent: 95, tilt_degrees: 2.5, temperature_c: 18.0, humidity_percent: 96 },
      { location: "village_a", water_level_m: 7.2, rainfall_mm: 120.0, soil_moisture_percent: 98, tilt_degrees: 3.8, temperature_c: 17.5, humidity_percent: 97 },
      { location: "village_a", water_level_m: 8.8, rainfall_mm: 145.0, soil_moisture_percent: 99, tilt_degrees: 5.2, temperature_c: 17.0, humidity_percent: 98 },
    ],
    prediction: {
      risk_score: 92,
      risk_level: "critical",
      flood_probability: 0.95,
      predicted_water_level: 12.5,
      lead_time_hours: 2,
      models: {
        lstm: { prediction: 88.0, weight: 0.4 },
        xgboost: { correction: 5.5, weight: 0.3 },
        gnn: { prediction: 95.0, weight: 0.2 },
        pinn: { prediction: 85.0, weight: 0.1 },
      },
      recommendations: [
        "IMMEDIATE EVACUATION RECOMMENDED",
        "CRITICAL FLOOD RISK - Send emergency alerts",
        "Deploy emergency response team",
        "Send urgent notifications to all residents",
      ],
    },
  },

  hilly_region: {
    name: "Hilly Region Landslide Risk",
    description: "Steep terrain, high tilt sensor readings",
    icon: "⛰️",
    readings: [
      { location: "hill_station_1", water_level_m: 2.1, rainfall_mm: 42.0, soil_moisture_percent: 82, tilt_degrees: 3.5, temperature_c: 19.0, humidity_percent: 85 },
      { location: "hill_station_1", water_level_m: 2.8, rainfall_mm: 58.0, soil_moisture_percent: 88, tilt_degrees: 5.2, temperature_c: 18.5, humidity_percent: 88 },
      { location: "hill_station_1", water_level_m: 3.5, rainfall_mm: 72.0, soil_moisture_percent: 92, tilt_degrees: 7.8, temperature_c: 18.0, humidity_percent: 90 },
    ],
    prediction: {
      risk_score: 78,
      risk_level: "high",
      flood_probability: 0.82,
      predicted_water_level: 4.8,
      lead_time_hours: 4,
      models: {
        lstm: { prediction: 72.0, weight: 0.4 },
        xgboost: { correction: 6.5, weight: 0.3 },
        gnn: { prediction: 85.0, weight: 0.2 },
        pinn: { prediction: 70.0, weight: 0.1 },
      },
      recommendations: [
        "HIGH landslide risk detected",
        "Evacuate downhill villages",
        "Block access to steep terrain areas",
        "Deploy emergency response to hilly areas",
      ],
    },
  },

  multi_village: {
    name: "Multi-Village Flood Scenario",
    description: "Flood affecting multiple downstream villages",
    icon: "🏘️",
    readings: [
      { location: "village_upstream", water_level_m: 4.5, rainfall_mm: 65.0, soil_moisture_percent: 85, tilt_degrees: 1.5, temperature_c: 20.0, humidity_percent: 88 },
      { location: "village_midstream", water_level_m: 3.8, rainfall_mm: 45.0, soil_moisture_percent: 78, tilt_degrees: 1.2, temperature_c: 20.5, humidity_percent: 85 },
      { location: "village_downstream", water_level_m: 2.9, rainfall_mm: 30.0, soil_moisture_percent: 72, tilt_degrees: 0.8, temperature_c: 21.0, humidity_percent: 82 },
    ],
    prediction: {
      risk_score: 71,
      risk_level: "high",
      flood_probability: 0.75,
      predicted_water_level: 5.5,
      lead_time_hours: 8,
      models: {
        lstm: { prediction: 68.0, weight: 0.4 },
        xgboost: { correction: 4.8, weight: 0.3 },
        gnn: { prediction: 78.0, weight: 0.2 },
        pinn: { prediction: 65.0, weight: 0.1 },
      },
      recommendations: [
        "Flood wave detected moving downstream",
        "Alert village_downstream immediately",
        "Prepare evacuation for midstream areas",
        "Coordinate emergency response across all villages",
      ],
    },
  },
};

export const INITIAL_SENSORS: Sensor[] = [
  {
    location: "hill_station_1",
    status: "warning",
    risk_level: "warning",
    last_updated: new Date().toISOString(),
    last_reading: {
      location: "hill_station_1",
      water_level_m: 2.8,
      rainfall_mm: 42.5,
      soil_moisture_percent: 68.2,
      tilt_degrees: 4.5,
      temperature_c: 19.8,
      humidity_percent: 82.0,
      timestamp: new Date().toISOString(),
    },
  },
  {
    location: "village_upstream",
    status: "warning",
    risk_level: "warning",
    last_updated: new Date().toISOString(),
    last_reading: {
      location: "village_upstream",
      water_level_m: 3.2,
      rainfall_mm: 48.0,
      soil_moisture_percent: 74.0,
      tilt_degrees: 3.2,
      temperature_c: 20.5,
      humidity_percent: 85.0,
      timestamp: new Date().toISOString(),
    },
  },
  {
    location: "village_midstream",
    status: "online",
    risk_level: "watch",
    last_updated: new Date().toISOString(),
    last_reading: {
      location: "village_midstream",
      water_level_m: 2.1,
      rainfall_mm: 22.5,
      soil_moisture_percent: 56.0,
      tilt_degrees: 1.8,
      temperature_c: 22.3,
      humidity_percent: 71.0,
      timestamp: new Date().toISOString(),
    },
  },
  {
    location: "village_downstream",
    status: "online",
    risk_level: "normal",
    last_updated: new Date().toISOString(),
    last_reading: {
      location: "village_downstream",
      water_level_m: 1.6,
      rainfall_mm: 12.0,
      soil_moisture_percent: 45.0,
      tilt_degrees: 0.9,
      temperature_c: 24.1,
      humidity_percent: 62.0,
      timestamp: new Date().toISOString(),
    },
  },
  {
    location: "valley_junction_1",
    status: "warning",
    risk_level: "high",
    last_updated: new Date().toISOString(),
    last_reading: {
      location: "valley_junction_1",
      water_level_m: 3.8,
      rainfall_mm: 54.0,
      soil_moisture_percent: 81.5,
      tilt_degrees: 5.4,
      temperature_c: 18.9,
      humidity_percent: 89.0,
      timestamp: new Date().toISOString(),
    },
  },
  {
    location: "river_bend_north",
    status: "online",
    risk_level: "watch",
    last_updated: new Date().toISOString(),
    last_reading: {
      location: "river_bend_north",
      water_level_m: 2.4,
      rainfall_mm: 28.0,
      soil_moisture_percent: 61.0,
      tilt_degrees: 2.1,
      temperature_c: 21.0,
      humidity_percent: 76.0,
      timestamp: new Date().toISOString(),
    },
  },
];

export const INITIAL_ALERTS: Alert[] = [
  {
    id: "alt-1",
    location: "valley_junction_1",
    severity: "high",
    message: "Water level reached 3.8m, exceeding critical threshold by 0.8m",
    status: "delivered",
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: "alt-2",
    location: "hill_station_1",
    severity: "warning",
    message: "Slope tilt detected at 4.5° with high ground soil saturation",
    status: "delivered",
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: "alt-3",
    location: "village_upstream",
    severity: "warning",
    message: "Heavy upstream rainfall of 48.0mm recorded over past 2 hours",
    status: "delivered",
    timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
  },
];

let alertsStore: Alert[] = [...INITIAL_ALERTS];
let sensorsStore: Sensor[] = [...INITIAL_SENSORS];

export function getSensors(): Sensor[] {
  return sensorsStore;
}

export function getSensorReadings(limit = 100): SensorReading[] {
  const readings: SensorReading[] = [];
  for (const s of sensorsStore) {
    if (s.last_reading) {
      readings.push(s.last_reading);
    }
  }
  return readings.slice(0, limit);
}

export function getAlerts(): Alert[] {
  return alertsStore;
}

export function addAlert(alert: Alert): Alert {
  alertsStore = [alert, ...alertsStore];
  return alert;
}

export function getCurrentRisk(): RiskScore {
  return {
    risk_score: 48,
    risk_level: "warning",
    location: "Basin Alpha (Regional)",
    timestamp: new Date().toISOString(),
    model_version: "2.1.0-ensemble",
    factors: [
      { factor: "Water Level", value: 3.8, unit: "m", contribution: 38 },
      { factor: "Rainfall (24h)", value: 54.0, unit: "mm", contribution: 30 },
      { factor: "Soil Saturation", value: 81.5, unit: "%", contribution: 20 },
      { factor: "Slope Tilt", value: 5.4, unit: "°", contribution: 12 },
    ],
  };
}

export function calculateEnsemblePrediction(params: {
  location: string;
  readings: Partial<SensorReading>[];
  prev_water_level?: number;
}): PredictionResponse {
  const latest = params.readings[params.readings.length - 1] || {};
  const water = Number(latest.water_level_m || 2.0);
  const rain = Number(latest.rainfall_mm || 20.0);
  const soil = Number(latest.soil_moisture_percent || 50.0);
  const tilt = Number(latest.tilt_degrees || 1.0);

  // Model formula weights: LSTM(40%) + XGBoost(30%) + GNN(20%) + PINN(10%)
  const waterScore = Math.min((water / 5.0) * 40, 40);
  const rainScore = Math.min((rain / 50.0) * 30, 30);
  const soilScore = Math.min((soil / 100.0) * 20, 20);
  const tiltScore = Math.min((tilt / 15.0) * 10, 10);
  const totalScore = Math.min(Math.max(Math.round(waterScore + rainScore + soilScore + tiltScore), 0), 100);

  let risk_level = "normal";
  if (totalScore >= 80) risk_level = "critical";
  else if (totalScore >= 60) risk_level = "high";
  else if (totalScore >= 40) risk_level = "warning";
  else if (totalScore >= 20) risk_level = "watch";

  const flood_prob = Number((totalScore / 100).toFixed(2));
  const predWater = Number((water * (1 + (rain > 20 ? 0.25 : 0.05))).toFixed(2));
  const leadTime = totalScore > 80 ? 2 : totalScore > 60 ? 6 : totalScore > 40 ? 12 : 24;

  const recs: string[] = [];
  if (risk_level === "critical") {
    recs.push("IMMEDIATE EVACUATION RECOMMENDED");
    recs.push("Deploy emergency rescue personnel to low-lying areas");
    recs.push("Activate flood control barriers and overflow gates");
  } else if (risk_level === "high") {
    recs.push("Prepare evacuation routes and emergency shelter centers");
    recs.push("Alert downstream villages of oncoming flood wave");
  } else if (risk_level === "warning") {
    recs.push("Monitor water levels and soil saturation every 30 minutes");
    recs.push("Inspect drainage channels and culverts for blockages");
  } else {
    recs.push("Normal baseline conditions - maintain routine logging");
  }

  return {
    location: params.location || "Regional Station",
    risk_score: totalScore,
    risk_level,
    flood_probability: flood_prob,
    predicted_water_level: predWater,
    lead_time_hours: leadTime,
    models: {
      lstm: { prediction: Math.min(Math.round(totalScore * 0.95), 100), weight: 0.4 },
      xgboost: { correction: Number((totalScore * 0.05).toFixed(1)), prediction: Math.min(Math.round(totalScore * 1.02), 100), weight: 0.3 },
      gnn: { prediction: Math.min(Math.round(totalScore * 0.98), 100), weight: 0.2 },
      pinn: { prediction: Math.min(Math.round(totalScore * 0.9), 100), weight: 0.1 },
    },
    recommendations: recs,
    model_version: "2.1.0-ensemble",
  };
}

export function getAllScenarios(): DemoScenario[] {
  return Object.entries(SCENARIOS).map(([key, s]) => ({
    key,
    name: s.name,
    description: s.description,
    icon: s.icon,
  }));
}

export function getDemoPrediction(scenarioKey: string): DemoPrediction {
  const scenario = SCENARIOS[scenarioKey] || SCENARIOS.normal_day;
  return {
    scenario: scenario.name,
    description: scenario.description,
    icon: scenario.icon,
    ...scenario.prediction,
    model_version: "demo_v2.1",
  };
}

export function getModelInfo(): ModelInfo {
  return {
    model_version: "2.1.0-ensemble",
    models: [
      "LSTM Temporal Forecaster (40% Weight)",
      "XGBoost Residual Error Corrector (30% Weight)",
      "GNN Spatial Topographic Network (20% Weight)",
      "PINN Hydrological Physics Constraint (10% Weight)",
    ],
    formula: "Risk = LSTM×0.4 + XGBoost×0.3 + GNN×0.2 + PINN×0.1",
  };
}
