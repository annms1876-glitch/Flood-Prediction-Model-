"use client";

import React, { useMemo } from "react";
import {
  RouteWithHazards,
  calculateRouteStats,
  getHazardIcon,
  getHazardColor,
  getStatusColor,
} from "@/lib/api/routeService";
import type { EvacuationStep } from "./types";
import {
  Navigation,
  Mountain,
  AlertTriangle,
  ChevronRight,
  MapPin,
  TrendingUp,
  Footprints,
  Radio,
  Users,
  Info,
} from "lucide-react";

interface RouteDetailsPanelProps {
  route: RouteWithHazards;
  activeStepIndex: number;
  onSelectStep: (index: number) => void;
  onFlyToStep: (coords: any, zoom: number, tilt: number, heading: number) => void;
}

function ElevationProfileSvg({ route }: { route: RouteWithHazards }) {
  const { fillPath, linePath, minElev, maxElev } = useMemo(() => {
    const profile = route.elevationProfile;
    if (!profile || profile.length === 0) {
      return { fillPath: "M0,80 L300,80 Z", linePath: "", minElev: 0, maxElev: 0 };
    }

    const elevations = profile.map((p) => p.elevation);
    const min = Math.min(...elevations);
    const max = Math.max(...elevations);
    const range = max - min || 1;

    const points = profile.map((p, i) => {
      const x = (i / (profile.length - 1)) * 300;
      const y = 80 - ((p.elevation - min) / range) * 60;
      return x + "," + y;
    });

    const fill = "M0,80 " + points.map((pt) => "L" + pt).join(" ") + " L300,80 Z";
    const line = points.map((pt) => "L" + pt).join(" ");

    return { fillPath: fill, linePath: line, minElev: min, maxElev: max };
  }, [route.elevationProfile]);

  return (
    <svg width="100%" height="100%" viewBox="0 0 300 80" preserveAspectRatio="none">
      <defs>
        <linearGradient id={"elevGrad-" + route.id} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <path d={fillPath} fill={"url(#elevGrad-" + route.id + ")"} />
      {linePath && (
        <path d={"M" + linePath.substring(1)} fill="none" stroke="#22c55e" strokeWidth="2" />
      )}
    </svg>
  );
}

export function RouteDetailsPanel({
  route,
  activeStepIndex,
  onSelectStep,
  onFlyToStep,
}: RouteDetailsPanelProps) {
  const stats = useMemo(() => calculateRouteStats(route), [route]);

  const getDirectionIcon = (direction: EvacuationStep["direction"]) => {
    switch (direction) {
      case "uphill":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "right":
        return <ChevronRight className="w-4 h-4 text-amber-500 rotate-90" />;
      case "left":
        return <ChevronRight className="w-4 h-4 text-amber-500 -rotate-90" />;
      case "cross_bridge":
        return <Navigation className="w-4 h-4 text-amber-500" />;
      default:
        return <ChevronRight className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-md">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold opacity-90">
              <Navigation className="w-3.5 h-3.5" />
              <span className="uppercase tracking-wider">Evacuation Route</span>
            </div>
            <h3 className="text-lg font-bold mt-1">{route.name}</h3>
            <p className="text-xs opacity-80">{route.subtitle}</p>
          </div>
          <div className="text-right">
            <div
              className="px-3 py-1 rounded-full text-sm font-bold"
              style={{ backgroundColor: getStatusColor(route.liveStatus) }}
            >
              {route.liveStatus.toUpperCase()}
            </div>
            <div className="text-xs mt-1 opacity-80">
              Safety: {route.safetyIndexScore}/100
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-2 p-4 bg-gray-50 border-b">
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600">{stats.totalDistKm}</div>
          <div className="text-[10px] text-gray-500">KM</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-amber-600">{stats.estimatedTimeMin}</div>
          <div className="text-[10px] text-gray-500">MIN</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">+{stats.elevationGain}</div>
          <div className="text-[10px] text-gray-500">ELEVATION</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-purple-600">{route.evacuationCount}</div>
          <div className="text-[10px] text-gray-500">EVACUATED</div>
        </div>
      </div>

      {/* Elevation Profile */}
      <div className="p-4 border-b">
        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-1">
          <Mountain className="w-3 h-3" />
          Elevation Profile
        </h4>
        <div className="h-20 bg-gray-100 rounded-lg overflow-hidden relative">
          <ElevationProfileSvg route={route} />
          <div className="absolute bottom-1 left-2 text-[10px] text-gray-500">
            {route.waypoints[0]?.elevation || 1550}m
          </div>
          <div className="absolute bottom-1 right-2 text-[10px] text-gray-500">
            {route.destinationElevM}m
          </div>
        </div>
      </div>

      {/* Hazards */}
      {route.hazards.length > 0 && (
        <div className="p-4 border-b bg-red-50">
          <h4 className="text-xs font-semibold text-red-600 uppercase mb-2 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Nearby Hazards ({route.hazards.length})
          </h4>
          <div className="space-y-2">
            {route.hazards.map((hazard) => (
              <div
                key={hazard.id}
                className="flex items-start gap-2 p-2 bg-white rounded-lg border"
              >
                <span className="text-lg">{getHazardIcon(hazard.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">
                    {hazard.description}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="px-1.5 py-0.5 rounded text-[10px] text-white font-medium"
                      style={{ backgroundColor: getHazardColor(hazard.severity) }}
                    >
                      {hazard.severity}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        hazard.clearanceStatus === "clear"
                          ? "bg-green-100 text-green-700"
                          : hazard.clearanceStatus === "partial"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {hazard.clearanceStatus}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Turn-by-Turn Steps */}
      <div className="p-4">
        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3 flex items-center gap-1">
          <Footprints className="w-3 h-3" />
          Turn-by-Turn Directions
        </h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {route.steps.map((step, idx) => (
            <div
              key={step.stepNumber}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                idx === activeStepIndex
                  ? "border-amber-400 bg-amber-50 shadow-md"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
              onClick={() => {
                onSelectStep(idx);
                onFlyToStep(step.coordinates, 17, 45, 0);
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    step.isSafeHighGround
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {getDirectionIcon(step.direction)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500">
                      Step {step.stepNumber}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {step.distanceText}
                    </span>
                  </div>
                  <p className="text-sm text-gray-800 mt-0.5">{step.instruction}</p>
                  {step.safetyCaution && (
                    <div className="flex items-start gap-1 mt-2 text-[11px] text-amber-700 bg-amber-50 p-1.5 rounded">
                      <Info className="w-3 h-3 shrink-0 mt-0.5" />
                      <span>{step.safetyCaution}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {step.coordinates.lat.toFixed(4)}, {step.coordinates.lng.toFixed(4)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mountain className="w-3 h-3" />
                      +{step.elevationGainMeters}m
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-50 border-t">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Radio className="w-3 h-3" />
            <span>Last survey: {new Date(route.lastSurveyTime).toLocaleTimeString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{route.evacuationCount} evacuated</span>
          </div>
        </div>
      </div>
    </div>
  );
}
