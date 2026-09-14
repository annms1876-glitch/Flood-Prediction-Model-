"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
  Polyline,
} from "@vis.gl/react-google-maps";
import {
  enrichRouteWithLiveData,
  calculateRouteStats,
  getStatusColor,
  type RouteWithHazards,
} from "@/lib/api/routeService";
import { EVACUATION_ROUTES_3D } from "./demoLocations";
import type { EvacuationRoute3D, GeoLocation } from "./types";
import { RouteDetailsPanel } from "./RouteDetailsPanel";
import {
  Navigation,
  RotateCcw,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface EvacuationRoute3DViewProps {
  initialRouteId?: "A" | "B" | "C";
  height?: string;
}

export default function EvacuationRoute3DView({
  initialRouteId = "A",
  height = "600px",
}: EvacuationRoute3DViewProps) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const [selectedRouteId, setSelectedRouteId] = useState<"A" | "B" | "C">(initialRouteId);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [selectedStepInfo, setSelectedStepInfo] = useState<{
    step: any;
    position: GeoLocation;
  } | null>(null);
  const [enrichedRoute, setEnrichedRoute] = useState<RouteWithHazards | null>(null);
  const [mapCenter, setMapCenter] = useState<GeoLocation>({
    lat: 30.9084,
    lng: 77.0982,
  });
  const [mapZoom, setMapZoom] = useState(15);
  const [mapTilt, setMapTilt] = useState(45);
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [showRouteList, setShowRouteList] = useState(false);

  useEffect(() => {
    const route = EVACUATION_ROUTES_3D[selectedRouteId];
    if (route) {
      const enriched = enrichRouteWithLiveData(route);
      setEnrichedRoute(enriched);
      setActiveStepIndex(0);
      setMapCenter(route.waypoints[0]);
    }
  }, [selectedRouteId]);

  const handleFlyToStep = useCallback(
    (coords: GeoLocation, zoom: number, tilt: number, heading: number) => {
      setMapCenter(coords);
      setMapZoom(zoom);
      setMapTilt(tilt);
    },
    []
  );

  const handleSelectStep = useCallback((index: number) => {
    setActiveStepIndex(index);
    setSelectedStepInfo(null);
  }, []);

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;

  const route = enrichedRoute;
  if (!route) return <div>Loading route...</div>;

  const stats = calculateRouteStats(route);

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-4" style={{ minHeight: height }}>
      {/* Map Section */}
      <div className="flex-1 relative rounded-2xl overflow-hidden shadow-xl">
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%", minHeight: "500px" }}
          center={mapCenter}
          zoom={mapZoom}
          options={{
            mapTypeControl: true,
            streetViewControl: false,
            fullscreenControl: true,
            tilt: mapTilt,
            heading: 0,
          }}
        >
          {/* Route Polyline */}
          <Polyline
            path={route.waypoints.map((wp) => ({ lat: wp.lat, lng: wp.lng }))}
            options={{
              strokeColor: getStatusColor(route.liveStatus),
              strokeOpacity: 0.9,
              strokeWeight: 6,
              geodesic: true,
            }}
          />

          {/* Step Markers */}
          {route.steps.map((step, idx) => {
            const isActive = idx === activeStepIndex;
            return (
              <React.Fragment key={`step-${step.stepNumber}`}>
                <Marker
                  position={{
                    lat: step.coordinates.lat,
                    lng: step.coordinates.lng,
                  }}
                  label={{
                    text: `${step.stepNumber}`,
                    color: "white",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                  icon={{
                    path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
                    scale: isActive ? 12 : 8,
                    fillColor: isActive ? "#f97316" : step.isSafeHighGround ? "#22c55e" : "#6b7280",
                    fillOpacity: 1,
                    strokeColor: "#ffffff",
                    strokeWeight: 2,
                  }}
                  onClick={() => {
                    setActiveStepIndex(idx);
                    setSelectedStepInfo({
                      step,
                      position: step.coordinates,
                    });
                  }}
                />
              </React.Fragment>
            );
          })}

          {/* Hazard Markers */}
          {route.hazards.map((hazard) => {
            const hazardColor = getStatusColor(route.liveStatus);
            const hazardSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="' + hazardColor + '"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>';
            const hazardUrl = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(hazardSvg);
            const hazardLabel = "Hazard: " + hazard.type;
            const hazardDepth = (hazard.waterDepthM || 0).toFixed(1) + "m water depth";
            return (
              <Marker
                key={hazard.id}
                position={{
                  lat: hazard.location.lat,
                  lng: hazard.location.lng,
                }}
                icon={{
                  url: hazardUrl,
                  scaledSize: new window.google.maps.Size(24, 24),
                }}
                onClick={() => {
                  setSelectedStepInfo({
                    step: {
                      instruction: hazard.description,
                      safetyCaution: hazardLabel,
                      distanceText: hazardDepth,
                    },
                    position: hazard.location,
                  });
                }}
              />
            );
          })}

          {/* InfoWindow for selected step */}
          {selectedStepInfo && (
            <InfoWindow
              position={{
                lat: selectedStepInfo.position.lat,
                lng: selectedStepInfo.position.lng,
              }}
              onCloseClick={() => setSelectedStepInfo(null)}
            >
              <div className="p-2 max-w-[200px]">
                <p className="text-sm font-medium">{selectedStepInfo.step.instruction}</p>
                {selectedStepInfo.step.safetyCaution && (
                  <p className="text-xs text-amber-600 mt-1">
                    ⚠️ {selectedStepInfo.step.safetyCaution}
                  </p>
                )}
                {selectedStepInfo.step.distanceText && (
                  <p className="text-xs text-gray-500 mt-1">
                    📍 {selectedStepInfo.step.distanceText}
                  </p>
                )}
              </div>
            </InfoWindow>
          )}
        </GoogleMap>

        {/* Map Controls Overlay */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button
            onClick={() => setMapTilt(Math.min(mapTilt + 15, 67.5))}
            className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50"
            title="Increase tilt"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMapTilt(Math.max(mapTilt - 15, 0))}
            className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50"
            title="Decrease tilt"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setMapCenter(route.waypoints[0]);
              setMapZoom(15);
              setMapTilt(45);
            }}
            className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50"
            title="Reset view"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Route Selector Overlay */}
        <div className="absolute top-4 left-4">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <button
              onClick={() => setShowRouteList(!showRouteList)}
              className="px-4 py-2 flex items-center gap-2 hover:bg-gray-50 w-full"
            >
              <Navigation className="w-4 h-4 text-amber-500" />
              <span className="font-semibold text-sm">Route {route.id}</span>
              <span className="text-xs text-gray-500 ml-auto">
                {showRouteList ? "▲" : "▼"}
              </span>
            </button>
            {showRouteList && (
              <div className="border-t">
                {(["A", "B", "C"] as const).map((id) => {
                  const r = EVACUATION_ROUTES_3D[id];
                  const isSelected = id === selectedRouteId;
                  return (
                    <button
                      key={id}
                      onClick={() => {
                        setSelectedRouteId(id);
                        setShowRouteList(false);
                      }}
                      className={`px-4 py-2 text-left w-full hover:bg-gray-50 ${
                        isSelected ? "bg-amber-50 border-l-4 border-amber-500" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">Route {id}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                            r.tier === "recommended"
                              ? "bg-green-100 text-green-700"
                              : r.tier === "alternative"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {r.tier}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">{r.name}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">
                        {r.totalDistanceKm}km • {r.estimatedMinutes}min • Safety: {r.safetyIndexScore}/100
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div className="absolute bottom-4 left-4">
          <div
            className="px-3 py-1.5 rounded-full text-white text-sm font-semibold shadow-lg flex items-center gap-2"
            style={{ backgroundColor: getStatusColor(route.liveStatus) }}
          >
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            {route.liveStatus === "open"
              ? "Route Clear"
              : route.liveStatus === "congested"
              ? "Heavy Traffic"
              : "Route Blocked"}
          </div>
        </div>
      </div>

      {/* Panel Section */}
      <div
        className={`lg:w-[380px] transition-all duration-300 ${
          panelCollapsed ? "lg:w-12" : ""
        }`}
      >
        <div className="relative">
          <button
            onClick={() => setPanelCollapsed(!panelCollapsed)}
            className="absolute -left-4 top-4 z-10 p-1 bg-white rounded-full shadow-md hover:bg-gray-50 lg:block hidden"
          >
            {panelCollapsed ? (
              <Maximize2 className="w-4 h-4" />
            ) : (
              <Minimize2 className="w-4 h-4" />
            )}
          </button>

          {!panelCollapsed && (
            <RouteDetailsPanel
              route={route}
              activeStepIndex={activeStepIndex}
              onSelectStep={handleSelectStep}
              onFlyToStep={handleFlyToStep}
            />
          )}
        </div>
      </div>
    </div>
  );
}
