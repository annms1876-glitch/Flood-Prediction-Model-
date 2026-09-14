"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  Polyline,
  useMap,
} from "@vis.gl/react-google-maps";
import {
  enrichRouteWithLiveData,
  calculateRouteStats,
  getStatusColor,
  type RouteWithHazards,
} from "@/lib/api/routeService";
import { EVACUATION_ROUTES_3D } from "./demoLocations";
import type { GeoLocation } from "./types";
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

function MapCameraController({
  center,
  zoom,
}: {
  center: GeoLocation;
  zoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (map) {
      map.panTo({ lat: center.lat, lng: center.lng });
      map.setZoom(zoom);
    }
  }, [map, center, zoom]);

  return null;
}

function RoutePolyline({ route }: { route: RouteWithHazards }) {
  const map = useMap();

  useEffect(() => {
    if (!map || typeof window === "undefined" || !window.google?.maps) return;

    const path = route.waypoints.map((wp) => ({ lat: wp.lat, lng: wp.lng }));
    const polyline = new window.google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: getStatusColor(route.liveStatus),
      strokeOpacity: 0.9,
      strokeWeight: 6,
      map,
    });

    return () => {
      polyline.setMap(null);
    };
  }, [map, route]);

  return null;
}

function MapContent({
  route,
  activeStepIndex,
  onSelectStep,
  setSelectedStepInfo,
}: {
  route: RouteWithHazards;
  activeStepIndex: number;
  onSelectStep: (index: number) => void;
  setSelectedStepInfo: (info: { step: any; position: GeoLocation } | null) => void;
}) {
  return (
    <>
      <RoutePolyline route={route} />

      {route.steps.map((step, idx) => {
        const isActive = idx === activeStepIndex;
        return (
          <AdvancedMarker
            key={`step-${step.stepNumber}`}
            position={{
              lat: step.coordinates.lat,
              lng: step.coordinates.lng,
            }}
            onClick={() => {
              onSelectStep(idx);
              setSelectedStepInfo({
                step,
                position: step.coordinates,
              });
            }}
          >
            <div
              className="rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg border-2 border-white"
              style={{
                backgroundColor: isActive ? "#f97316" : step.isSafeHighGround ? "#22c55e" : "#6b7280",
                width: isActive ? "40px" : "32px",
                height: isActive ? "40px" : "32px",
              }}
            >
              {step.stepNumber}
            </div>
          </AdvancedMarker>
        );
      })}

      {route.hazards.map((hazard) => {
        const hazardColor = getStatusColor(route.liveStatus);
        return (
          <AdvancedMarker
            key={hazard.id}
            position={{
              lat: hazard.location.lat,
              lng: hazard.location.lng,
            }}
            onClick={() => {
              setSelectedStepInfo({
                step: {
                  instruction: hazard.description,
                  safetyCaution: "Hazard: " + hazard.type,
                  distanceText: (hazard.waterDepthM || 0).toFixed(1) + "m water depth",
                },
                position: hazard.location,
              });
            }}
          >
            <div
              className="rounded-full flex items-center justify-center text-white text-sm shadow-lg border-2 border-white"
              style={{
                backgroundColor: hazardColor,
                width: "28px",
                height: "28px",
              }}
            >
              !
            </div>
          </AdvancedMarker>
        );
      })}
    </>
  );
}

export default function EvacuationRoute3DView({
  initialRouteId = "A",
  height = "600px",
}: EvacuationRoute3DViewProps) {
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
    },
    []
  );

  const handleSelectStep = useCallback((index: number) => {
    setActiveStepIndex(index);
    setSelectedStepInfo(null);
  }, []);

  const route = enrichedRoute;
  if (!route) return <div>Loading route...</div>;

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-4" style={{ minHeight: height }}>
      {/* Map Section */}
      <div className="flex-1 relative rounded-2xl overflow-hidden shadow-xl">
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
          <Map
            mapId="evacuation-route-map"
            style={{ width: "100%", height: "100%", minHeight: "500px" }}
            defaultCenter={mapCenter}
            defaultZoom={mapZoom}
            gestureHandling="greedy"
            disableDefaultUI={false}
          >
            <MapCameraController center={mapCenter} zoom={mapZoom} />
            <MapContent
              route={route}
              activeStepIndex={activeStepIndex}
              onSelectStep={handleSelectStep}
              setSelectedStepInfo={setSelectedStepInfo}
            />
          </Map>
        </APIProvider>

        {/* Map Controls Overlay */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
          <button
            onClick={() => setMapZoom(Math.min(mapZoom + 1, 20))}
            className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50"
            title="Zoom in"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMapZoom(Math.max(mapZoom - 1, 10))}
            className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50"
            title="Zoom out"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setMapCenter(route.waypoints[0]);
              setMapZoom(15);
            }}
            className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50"
            title="Reset view"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Route Selector Overlay */}
        <div className="absolute top-4 left-4 z-10">
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
                        {r.totalDistanceKm}km · {r.estimatedMinutes}min · Safety: {r.safetyIndexScore}/100
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div className="absolute bottom-4 left-4 z-10">
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
                  {selectedStepInfo.step.safetyCaution}
                </p>
              )}
              {selectedStepInfo.step.distanceText && (
                <p className="text-xs text-gray-500 mt-1">
                  {selectedStepInfo.step.distanceText}
                </p>
              )}
            </div>
          </InfoWindow>
        )}
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
