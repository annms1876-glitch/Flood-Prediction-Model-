"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  Navigation,
  MapPin,
  AlertTriangle,
  Gauge,
  Radio,
  Satellite,
  Layers,
  ChevronDown,
  ChevronUp,
  X,
  Eye,
  EyeOff,
  Wind,
  Water,
  Mountain,
  Radio as RadioIcon,
} from "lucide-react";
import {
  EVACUATION_ROUTES_3D,
  DEMO_LOCATIONS,
} from "./demoLocations";
import type { EvacuationRoute3D, GeoLocation, DemoLocation } from "./types";
import { calculateRouteStats, getStatusColor } from "@/lib/api/routeService";

const CesiumViewer = dynamic(
  () => import("@/components/map/CesiumViewer"),
  { ssr: false, loading: () => <div className="w-full h-full flex items-center justify-center bg-gray-900"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div><div className="text-gray-400">Loading 3D Globe...</div></div></div> }
);

export default function GlobePage() {
  const [selectedRouteId, setSelectedRouteId] = useState<"A" | "B" | "C">("A");
  const [showFloodZones, setShowFloodZones] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [showSensors, setShowSensors] = useState(true);
  const [showShelters, setShowShelters] = useState(true);
  const [hoveredLocation, setHoveredLocation] = useState<DemoLocation | null>(null);
  const [activeTooltip, setActiveTooltip] = useState<{ x: number; y: number; location: DemoLocation } | null>(null);

  const route = EVACUATION_ROUTES_3D[selectedRouteId];
  const stats = route ? calculateRouteStats(route) : null;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <div className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Umeed AI — God's Eye View</h1>
              <p className="text-xs text-gray-400">3D Geospatial Flood Intelligence Globe</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-green-900/50 text-green-400 rounded text-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              Live Data
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Controls */}
        <div className="w-72 bg-gray-900/50 border-r border-gray-800 flex flex-col overflow-y-auto">
          {/* Layer Toggles */}
          <div className="p-4 border-b border-gray-800">
            <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Layers
            </h3>
            {[
              { label: "Flood Zones", icon: Water, active: showFloodZones, toggle: () => setShowFloodZones(!showFloodZones) },
              { label: "Evacuation Routes", icon: Navigation, active: showRoutes, toggle: () => setShowRoutes(!showRoutes) },
              { label: "Sensors", icon: Gauge, active: showSensors, toggle: () => setShowSensors(!showSensors) },
              { label: "Shelters", icon: MapPin, active: showShelters, toggle: () => setShowShelters(!showShelters) },
            ].map(({ label, icon: Icon, active, toggle }) => (
              <button key={label} onClick={toggle} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm mb-1 transition-colors ${active ? "bg-amber-500/10 text-amber-400" : "text-gray-400 hover:bg-gray-800"}`}>
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Route Selector */}
          <div className="p-4 border-b border-gray-800">
            <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <Navigation className="w-4 h-4" />
              Evacuation Routes
            </h3>
            {(["A", "B", "C"] as const).map((id) => {
              const r = EVACUATION_ROUTES_3D[id];
              const isSelected = id === selectedRouteId;
              return (
                <button key={id} onClick={() => setSelectedRouteId(id)} className={`w-full text-left p-3 rounded-lg mb-2 transition-colors ${isSelected ? "bg-amber-500/10 border border-amber-500/30" : "bg-gray-800/50 border border-transparent hover:bg-gray-800"}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">Route {id}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${r.tier === "recommended" ? "bg-green-900/50 text-green-400" : r.tier === "alternative" ? "bg-yellow-900/50 text-yellow-400" : "bg-red-900/50 text-red-400"}`}>{r.tier}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{r.name}</p>
                  <div className="flex gap-3 mt-1 text-[10px] text-gray-500">
                    <span>{r.totalDistanceKm}km</span>
                    <span>{r.estimatedMinutes}min</span>
                    <span>Safety: {r.safetyIndexScore}/100</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Stats */}
          {stats && (
            <div className="p-4 border-b border-gray-800">
              <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                <Gauge className="w-4 h-4" />
                Route Stats
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-blue-400">{stats.totalDistKm}</div>
                  <div className="text-[10px] text-gray-500">KM</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-amber-400">{stats.estimatedTimeMin}m</div>
                  <div className="text-[10px] text-gray-500">EST. TIME</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-green-400">+{stats.elevationGain}</div>
                  <div className="text-[10px] text-gray-500">ELEVATION</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-purple-400">{route.evacuationCount}</div>
                  <div className="text-[10px] text-gray-500">EVACUATED</div>
                </div>
              </div>
            </div>
          )}

          {/* Flood Zones List */}
          {showFloodZones && (
            <div className="p-4 border-b border-gray-800">
              <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Active Hazards ({DEMO_LOCATIONS.filter(d => d.category === "flood_zone").length})
              </h3>
              <div className="space-y-2">
                {DEMO_LOCATIONS.filter(d => d.category === "flood_zone").map((loc) => (
                  <button key={loc.id} onClick={() => { setHoveredLocation(loc); setActiveTooltip({ x: 400, y: 300, location: loc }); setTimeout(() => setActiveTooltip(null), 3000); }} className="w-full text-left p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${loc.severity === "inundated" ? "bg-red-500" : loc.severity === "hazardous" ? "bg-orange-500" : "bg-yellow-500"}`} />
                      <span className="text-xs font-medium">{loc.shortName}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-0.5">{loc.waterDepthMeters}m water • {loc.flowVelocityMs}m/s</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Shelters List */}
          {showShelters && (
            <div className="p-4 border-b border-gray-800">
              <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Shelters ({DEMO_LOCATIONS.filter(d => d.category === "shelter").length})
              </h3>
              <div className="space-y-2">
                {DEMO_LOCATIONS.filter(d => d.category === "shelter").map((loc) => (
                  <button key={loc.id} className="w-full text-left p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-xs font-medium">{loc.shortName}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-0.5">{loc.currentOccupancy}/{loc.safeCapacity} • Elev {loc.elevationMeters}m</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sensors */}
          {showSensors && (
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                <Gauge className="w-4 h-4" />
                IoT Sensors
              </h3>
              <div className="space-y-2">
                {DEMO_LOCATIONS.filter(d => d.category === "sensor").map((loc) => (
                  <div key={loc.id} className="p-2 rounded-lg bg-gray-800/50">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                      <span className="text-xs font-medium">{loc.shortName}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-0.5">Stage: {loc.waterDepthMeters}m • Rising</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Globe Area */}
        <div className="flex-1 relative">
          <CesiumViewer
            showFloodZones={showFloodZones}
            showRoutes={showRoutes}
            showSensors={showSensors}
            showShelters={showShelters}
            selectedRouteId={selectedRouteId}
            onRouteSelect={setSelectedRouteId}
            hoveredLocation={hoveredLocation}
            onLocationHover={setHoveredLocation}
          />

          {/* HUD Overlay */}
          <div className="absolute top-3 left-3 bg-gray-900/80 backdrop-blur-xl rounded-lg border border-gray-700 p-3 max-w-xs">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-green-400">GEOSPATIAL VIEW ACTIVE</span>
            </div>
            <p className="text-[10px] text-gray-400">
              Solan District, Himachal Pradesh • Elevation range: 1430m–1680m
            </p>
            <div className="mt-2 flex gap-2">
              <span className="px-1.5 py-0.5 bg-red-900/50 text-red-400 rounded text-[10px]">{route.safetyIndexScore < 50 ? "HIGH RISK" : "MODERATE"}</span>
              <span className="px-1.5 py-0.5 bg-blue-900/50 text-blue-400 rounded text-[10px]">Route {selectedRouteId}</span>
            </div>
          </div>

          {/* Camera Controls */}
          <div className="absolute bottom-3 right-3 flex flex-col gap-2">
            <button className="w-10 h-10 bg-gray-900/80 backdrop-blur-xl rounded-lg border border-gray-700 flex items-center justify-center hover:bg-gray-800 transition-colors" title="Zoom In">
              <ChevronUp className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 bg-gray-900/80 backdrop-blur-xl rounded-lg border border-gray-700 flex items-center justify-center hover:bg-gray-800 transition-colors" title="Zoom Out">
              <ChevronDown className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 bg-gray-900/80 backdrop-blur-xl rounded-lg border border-gray-700 flex items-center justify-center hover:bg-gray-800 transition-colors" title="Reset View">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tooltip */}
          {activeTooltip && (
            <div className="absolute top-4 right-4 w-64 bg-gray-900/90 backdrop-blur-xl rounded-lg border border-gray-700 p-4 z-20">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm">{activeTooltip.location.name}</span>
                <button onClick={() => setActiveTooltip(null)}><X className="w-4 h-4 text-gray-400" /></button>
              </div>
              <p className="text-xs text-gray-400 mb-2">{activeTooltip.location.description}</p>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="bg-gray-800/50 rounded p-1"><span className="text-gray-500">Water:</span> <span className="text-red-400">{activeTooltip.location.waterDepthMeters}m</span></div>
                <div className="bg-gray-800/50 rounded p-1"><span className="text-gray-500">Flow:</span> <span className="text-orange-400">{activeTooltip.location.flowVelocityMs}m/s</span></div>
                <div className="bg-gray-800/50 rounded p-1"><span className="text-gray-500">Elevation:</span> <span className="text-blue-400">{activeTooltip.location.elevationMeters}m</span></div>
                <div className="bg-gray-800/50 rounded p-1"><span className="text-gray-500">Distance:</span> <span className="text-gray-300">{activeTooltip.location.distanceFromUserKm}km</span></div>
              </div>
              <p className="text-[10px] text-amber-400 mt-2">{activeTooltip.location.recommendedAction}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
