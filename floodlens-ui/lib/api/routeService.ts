import type { GeoLocation, EvacuationRoute3D, EvacuationStep } from "@/components/map/types";

export interface RouteHazard {
  id: string;
  type: "flood" | "landslide" | "debris" | "bridge_damage" | "road_block";
  severity: "safe" | "watch" | "warning" | "inundated" | "hazardous";
  location: GeoLocation;
  description: string;
  waterDepthM?: number;
  flowVelocityMs?: number;
  clearanceStatus: "clear" | "partial" | "blocked";
  lastUpdated: string;
}

export interface ElevationPoint {
  distance: number;
  elevation: number;
  lat: number;
  lng: number;
}

export interface RouteWithHazards extends EvacuationRoute3D {
  hazards: RouteHazard[];
  elevationProfile: ElevationPoint[];
  liveStatus: "open" | "congested" | "blocked" | "emergency";
  evacuationCount: number;
  lastSurveyTime: string;
}

const DEMO_HAZARDS: RouteHazard[] = [
  {
    id: "hazard-1",
    type: "flood",
    severity: "inundated",
    location: { lat: 30.9015, lng: 77.1015, elevation: 1460 },
    description: "Solan Valley Lower Basin submerged",
    waterDepthM: 1.85,
    flowVelocityMs: 3.4,
    clearanceStatus: "blocked",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "hazard-2",
    type: "landslide",
    severity: "hazardous",
    location: { lat: 30.911, lng: 77.089, elevation: 1510 },
    description: "Shamti Bypass debris covering road",
    clearanceStatus: "partial",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "hazard-3",
    type: "debris",
    severity: "warning",
    location: { lat: 30.898, lng: 77.1055, elevation: 1440 },
    description: "Saproon Khad bank erosion",
    waterDepthM: 3.2,
    flowVelocityMs: 4.8,
    clearanceStatus: "blocked",
    lastUpdated: new Date().toISOString(),
  },
];

function interpolateElevation(
  start: GeoLocation,
  end: GeoLocation,
  numPoints: number
): ElevationPoint[] {
  const points: ElevationPoint[] = [];
  const startElev = start.elevation || 1500;
  const endElev = end.elevation || 1500;

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const lat = start.lat + (end.lat - start.lat) * t;
    const lng = start.lng + (end.lng - start.lng) * t;
    const elevation = startElev + (endElev - startElev) * t + Math.sin(t * Math.PI) * 10;
    const distance = Math.sqrt(
      Math.pow((end.lat - start.lat) * t * 111, 2) +
      Math.pow((end.lng - start.lng) * t * 111 * Math.cos((start.lat * Math.PI) / 180), 2)
    );
    points.push({ distance: Math.round(distance * 1000) / 1000, elevation: Math.round(elevation), lat, lng });
  }
  return points;
}

function generateElevationProfile(route: EvacuationRoute3D): ElevationPoint[] {
  const profile: ElevationPoint[] = [];
  let cumulativeDistance = 0;

  for (let i = 0; i < route.waypoints.length - 1; i++) {
    const start = route.waypoints[i];
    const end = route.waypoints[i + 1];
    const segmentPoints = interpolateElevation(start, end, 10);

    segmentPoints.forEach((point, idx) => {
      if (idx > 0 || i === 0) {
        profile.push({
          ...point,
          distance: cumulativeDistance + point.distance,
        });
      }
    });

    const dx = (end.lng - start.lng) * 111 * Math.cos((start.lat * Math.PI) / 180);
    const dy = (end.lat - start.lat) * 111;
    cumulativeDistance += Math.sqrt(dx * dx + dy * dy);
  }

  return profile;
}

export function enrichRouteWithLiveData(
  route: EvacuationRoute3D
): RouteWithHazards {
  const relevantHazards = DEMO_HAZARDS.filter((hazard) => {
    return route.waypoints.some((wp) => {
      const dist = Math.sqrt(
        Math.pow(wp.lat - hazard.location.lat, 2) +
        Math.pow(wp.lng - hazard.location.lng, 2)
      );
      return dist < 0.05;
    });
  });

  return {
    ...route,
    hazards: relevantHazards,
    elevationProfile: generateElevationProfile(route),
    liveStatus: route.safetyIndexScore >= 80 ? "open" : route.safetyIndexScore >= 60 ? "congested" : "emergency",
    evacuationCount: Math.floor(Math.random() * 50) + 10,
    lastSurveyTime: new Date(Date.now() - Math.random() * 3600000).toISOString(),
  };
}

export function calculateRouteStats(route: EvacuationRoute3D) {
  const totalDistKm = route.totalDistanceKm;
  const avgSpeedKmh = 4;
  const estimatedTimeMin = (totalDistKm / avgSpeedKmh) * 60;
  const elevationGain = route.totalElevationGainM;
  const difficulty = elevationGain > 100 ? "Hard" : elevationGain > 50 ? "Moderate" : "Easy";
  const safetyRating =
    route.safetyIndexScore >= 90
      ? "Excellent"
      : route.safetyIndexScore >= 75
      ? "Good"
      : route.safetyIndexScore >= 50
      ? "Fair"
      : "Poor";

  return {
    totalDistKm: totalDistKm.toFixed(2),
    estimatedTimeMin: Math.round(estimatedTimeMin),
    elevationGain,
    difficulty,
    safetyRating,
    safetyIndex: route.safetyIndexScore,
  };
}

export function getHazardIcon(type: RouteHazard["type"]): string {
  switch (type) {
    case "flood":
      return "🌊";
    case "landslide":
      return "⛰️";
    case "debris":
      return "🪨";
    case "bridge_damage":
      return "🌉";
    case "road_block":
      return "🚧";
    default:
      return "⚠️";
  }
}

export function getHazardColor(severity: RouteHazard["severity"]): string {
  switch (severity) {
    case "safe":
      return "#22c55e";
    case "watch":
      return "#eab308";
    case "warning":
      return "#f97316";
    case "inundated":
      return "#3b82f6";
    case "hazardous":
      return "#ef4444";
    default:
      return "#6b7280";
  }
}

export function getStatusColor(status: RouteWithHazards["liveStatus"]): string {
  switch (status) {
    case "open":
      return "#22c55e";
    case "congested":
      return "#eab308";
    case "blocked":
      return "#ef4444";
    case "emergency":
      return "#dc2626";
    default:
      return "#6b7280";
  }
}
