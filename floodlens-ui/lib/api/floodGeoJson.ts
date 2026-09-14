import type { PredictionResponse } from "@/lib/types";

export interface FloodFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: {
    id: string;
    name: string;
    riskScore: number;
    riskLevel: string;
    riskLabel: string;
    riskColor: string;
    floodProbability: number;
    modelVersion: string;
    updatedAt: string;
  };
}

export interface FloodFeatureCollection {
  type: "FeatureCollection";
  features: FloodFeature[];
}

export const FLOOD_RISK_COLORS: Record<string, string> = {
  normal: "#22c55e",
  watch: "#eab308",
  warning: "#f97316",
  high: "#ef4444",
  critical: "#dc2626",
};

export const FLOOD_RISK_LABELS: Record<string, string> = {
  normal: "Normal",
  watch: "Watch",
  warning: "Warning",
  high: "High Risk",
  critical: "Critical",
};

export function riskScoreToLevel(score: number): string {
  if (score >= 80) return "critical";
  if (score >= 60) return "high";
  if (score >= 40) return "warning";
  if (score >= 20) return "watch";
  return "normal";
}

export function riskColor(level: string): string {
  return FLOOD_RISK_COLORS[level] || FLOOD_RISK_COLORS.normal;
}

export function riskLabel(level: string): string {
  return FLOOD_RISK_LABELS[level] || "Unknown";
}

export function buildFloodFeature(
  lat: number,
  lon: number,
  prediction: PredictionResponse
): FloodFeature {
  const level = prediction.risk_level || riskScoreToLevel(prediction.risk_score);
  return {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [lon, lat],
    },
    properties: {
      id: `flood-${prediction.location}-${Date.now()}`,
      name: prediction.location || "Unknown Location",
      riskScore: prediction.risk_score || 0,
      riskLevel: level,
      riskLabel: riskLabel(level),
      riskColor: riskColor(level),
      floodProbability: prediction.flood_probability || prediction.risk_score / 100,
      modelVersion: prediction.model_version || "unknown",
      updatedAt: new Date().toISOString(),
    },
  };
}

export function buildFloodGeoJSON(
  predictions: Array<PredictionResponse & { lat?: number; lon?: number }>
): FloodFeatureCollection {
  return {
    type: "FeatureCollection",
    features: predictions.map((pred) =>
      buildFloodFeature(
        pred.lat || 30.7333,
        pred.lon || 76.7794,
        pred
      )
    ),
  };
}

export function buildFloodRiskZone(
  lat: number,
  lon: number,
  radiusKm: number,
  riskLevel: string,
  riskScore: number
): FloodFeature {
  const coordinates = generateCircleCoordinates(lat, lon, radiusKm);
  const level = riskLevel || riskScoreToLevel(riskScore);
  return {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [lon, lat],
    },
    properties: {
      id: `zone-${lat}-${lon}-${Date.now()}`,
      name: `Risk Zone (${radiusKm}km)`,
      riskScore,
      riskLevel: level,
      riskLabel: riskLabel(level),
      riskColor: riskColor(level),
      floodProbability: riskScore / 100,
      modelVersion: "zone_generator",
      updatedAt: new Date().toISOString(),
    },
  };
}

function generateCircleCoordinates(
  centerLat: number,
  centerLon: number,
  radiusKm: number,
  segments: number = 32
): [number, number][] {
  const coords: [number, number][] = [];
  const earthRadiusKm = 6371;
  const angularRadius = radiusKm / earthRadiusKm;
  const centerLatRad = (centerLat * Math.PI) / 180;

  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * 2 * Math.PI;
    const latRad = Math.asin(
      Math.sin(centerLatRad) * Math.cos(angularRadius) +
        Math.cos(centerLatRad) * Math.sin(angularRadius) * Math.cos(angle)
    );
    const lonRad =
      (centerLon * Math.PI) / 180 +
      Math.atan2(
        Math.sin(angle) * Math.sin(angularRadius) * Math.cos(centerLatRad),
        Math.cos(angularRadius) -
          Math.sin(centerLatRad) * Math.sin(latRad)
      );
    coords.push([
      Math.round((lonRad * 180) / Math.PI * 1000000) / 1000000,
      Math.round((latRad * 180) / Math.PI * 1000000) / 1000000,
    ]);
  }
  return coords;
}

export const DEMO_FLOOD_LOCATIONS = [
  { name: "Sector 4", lat: 30.7333, lon: 76.7794, readings: [{ water_level_m: 2.84, rainfall_mm: 40, soil_moisture_percent: 82, tilt_degrees: 3.1 }] },
  { name: "Chandigarh", lat: 30.7333, lon: 76.7794, readings: [{ water_level_m: 1.5, rainfall_mm: 25, soil_moisture_percent: 60, tilt_degrees: 1.0 }] },
  { name: "Shimla", lat: 31.1048, lon: 77.1734, readings: [{ water_level_m: 0.8, rainfall_mm: 15, soil_moisture_percent: 45, tilt_degrees: 0.5 }] },
  { name: "Manali", lat: 32.2396, lon: 77.1887, readings: [{ water_level_m: 3.2, rainfall_mm: 55, soil_moisture_percent: 88, tilt_degrees: 5.0 }] },
  { name: "Dharamshala", lat: 32.2190, lon: 76.3199, readings: [{ water_level_m: 1.8, rainfall_mm: 30, soil_moisture_percent: 55, tilt_degrees: 1.5 }] },
];
