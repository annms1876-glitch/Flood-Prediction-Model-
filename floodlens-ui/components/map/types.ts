export interface GeoLocation {
  lat: number;
  lng: number;
  elevation?: number;
}

export type LocationCategory =
  | "resident_house"
  | "flood_zone"
  | "shelter"
  | "sensor"
  | "convoy";

export type FloodSeverity = "safe" | "watch" | "warning" | "inundated" | "hazardous";

export interface DemoLocation {
  id: string;
  name: string;
  shortName: string;
  category: LocationCategory;
  severity: FloodSeverity;
  coordinates: GeoLocation;
  elevationMeters: number;
  description: string;
  threatDetails: string;
  waterDepthMeters?: number;
  flowVelocityMs?: number;
  safeCapacity?: number;
  currentOccupancy?: number;
  distanceFromUserKm?: number;
  recommendedAction: string;
  tags: string[];
}

export interface EvacuationStep {
  stepNumber: number;
  instruction: string;
  direction: "straight" | "left" | "right" | "uphill" | "cross_bridge";
  distanceText: string;
  distanceMeters: number;
  coordinates: GeoLocation;
  elevationGainMeters: number;
  safetyCaution: string;
  isSafeHighGround: boolean;
}

export interface EvacuationRoute3D {
  id: "A" | "B" | "C";
  name: string;
  subtitle: string;
  tier: "recommended" | "alternative" | "hazardous";
  destinationName: string;
  destinationCoords: GeoLocation;
  destinationElevM: number;
  totalDistanceKm: number;
  estimatedMinutes: number;
  totalElevationGainM: number;
  safetyIndexScore: number; // 0 to 100
  floodRiskLevel: FloodSeverity;
  surfaceType: string;
  waypoints: GeoLocation[];
  steps: EvacuationStep[];
  currentStatus: string;
}

export interface MapCameraState {
  center: GeoLocation;
  zoom: number;
  tilt: number; // 0 to 67.5 degrees
  heading: number; // 0 to 360 degrees
}
