export const RISK_LEVELS = ["normal", "watch", "warning", "high", "critical"] as const;

export const RISK_COLORS: Record<string, string> = {
  normal: "#22c55e",
  watch: "#eab308",
  warning: "#f97316",
  high: "#ef4444",
  critical: "#dc2626",
};

export const RISK_LABELS: Record<string, string> = {
  normal: "Normal",
  watch: "Watch",
  warning: "Warning",
  high: "High",
  critical: "Critical",
};

export const RISK_ACTIONS: Record<string, string> = {
  normal: "No action needed",
  watch: "Stay alert",
  warning: "Monitor closely",
  high: "Prepare for flooding",
  critical: "Immediate evacuation",
};

export const ML_MODEL_WEIGHTS = {
  lstm: 0.4,
  xgboost: 0.3,
  gnn: 0.2,
  pinn: 0.1,
} as const;

export const FEATURES: {
  name: string;
  key: string;
  unit: string;
  min: number;
  max: number;
  label: string;
}[] = [
  {
    name: "Water Level",
    key: "water_level_m",
    unit: "m",
    min: 0,
    max: 50,
    label: "River Water Level",
  },
  {
    name: "Rainfall",
    key: "rainfall_mm",
    unit: "mm",
    min: 0,
    max: 500,
    label: "Hourly Rainfall",
  },
  {
    name: "Soil Moisture",
    key: "soil_moisture_percent",
    unit: "%",
    min: 0,
    max: 100,
    label: "Soil Saturation",
  },
  {
    name: "Tilt",
    key: "tilt_degrees",
    unit: "°",
    min: 0,
    max: 90,
    label: "Ground Tilt (Landslide)",
  },
  {
    name: "Temperature",
    key: "temperature_c",
    unit: "°C",
    min: -50,
    max: 60,
    label: "Air Temperature",
  },
  {
    name: "Humidity",
    key: "humidity_percent",
    unit: "%",
    min: 0,
    max: 100,
    label: "Relative Humidity",
  },
  {
    name: "Water Level Delta",
    key: "water_level_delta",
    unit: "m",
    min: -5,
    max: 5,
    label: "Rate of Water Level Change",
  },
  {
    name: "Rainfall Delta",
    key: "rainfall_delta",
    unit: "mm",
    min: -100,
    max: 100,
    label: "Rainfall Trend",
  },
];

export const API_BASE = {
  ml: process.env.NEXT_PUBLIC_ML_URL || "http://localhost:8000",
  backend: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000",
};
