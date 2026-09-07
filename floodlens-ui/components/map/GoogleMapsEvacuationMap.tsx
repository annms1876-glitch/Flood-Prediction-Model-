"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap,
} from "@vis.gl/react-google-maps";
import {
  DemoLocation,
  EvacuationRoute3D,
  GeoLocation,
} from "./types";
import {
  DEMO_LOCATIONS,
  EVACUATION_ROUTES_3D,
  RESIDENT_HOUSE_COORDS,
  SOLAN_CENTER,
} from "./demoLocations";
import { DemoLocationSifter } from "./DemoLocationSifter";
import { EvacuationNavigator } from "./EvacuationNavigator";
import {
  Compass,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Waves,
  Building,
  Home,
  Radio,
  Key,
  Info,
  ChevronRight,
  Sparkles,
  Navigation,
  RotateCcw,
} from "lucide-react";

interface GoogleMapsEvacuationMapProps {
  initialRouteId?: "A" | "B" | "C";
  viewMode?: "2d" | "3d";
  className?: string;
}

// Native Polyline Renderer for Google Maps
function GoogleMapRoutePolyline({
  path,
  strokeColor = "#10b981",
  strokeOpacity = 0.9,
  strokeWeight = 6,
}: {
  path: GeoLocation[];
  strokeColor?: string;
  strokeOpacity?: number;
  strokeWeight?: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map || typeof window === "undefined" || !window.google?.maps) return;

    const googlePath = path.map((pt) => ({ lat: pt.lat, lng: pt.lng }));
    const polyline = new window.google.maps.Polyline({
      path: googlePath,
      geodesic: true,
      strokeColor,
      strokeOpacity,
      strokeWeight,
      map,
    });

    return () => {
      polyline.setMap(null);
    };
  }, [map, path, strokeColor, strokeOpacity, strokeWeight]);

  return null;
}

// Camera pan and tilt updater inside APIProvider
function MapCameraHandler({
  center,
  zoom,
  tilt,
  heading,
}: {
  center: GeoLocation;
  zoom: number;
  tilt: number;
  heading: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    map.panTo({ lat: center.lat, lng: center.lng });
    map.setZoom(zoom);
    if (typeof map.setTilt === "function") {
      map.setTilt(tilt);
    }
    if (typeof map.setHeading === "function") {
      map.setHeading(heading);
    }
  }, [map, center, zoom, tilt, heading]);

  return null;
}

export function GoogleMapsEvacuationMap({
  initialRouteId = "A",
  viewMode = "3d",
  className = "",
}: GoogleMapsEvacuationMapProps) {
  // Config & Keys
  const envKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const [apiKey, setApiKey] = useState<string>(envKey);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [inputKeyVal, setInputKeyVal] = useState("");

  // Route State
  const [selectedRouteId, setSelectedRouteId] = useState<"A" | "B" | "C">(initialRouteId);
  const currentRoute = EVACUATION_ROUTES_3D[selectedRouteId];
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  // Map Controls State
  const [cameraCenter, setCameraCenter] = useState<GeoLocation>(RESIDENT_HOUSE_COORDS);
  const [zoom, setZoom] = useState(15.5);
  const [tilt, setTilt] = useState(45); // 3D Tilt perspective
  const [heading, setHeading] = useState(0); // 3D Camera Heading
  const [mapType, setMapType] = useState<"hybrid" | "terrain" | "satellite">("hybrid");

  // Selection & Modal State
  const [selectedLocation, setSelectedLocation] = useState<DemoLocation | null>(DEMO_LOCATIONS[0]);
  const [infoWindowLocation, setInfoWindowLocation] = useState<DemoLocation | null>(null);

  useEffect(() => { setTilt(viewMode === "3d" ? 45 : 0); }, [viewMode]);

  // Smooth Fly-to handler
  const handleFlyToLocation = useCallback(
    (coords: GeoLocation, targetZoom = 16.5, targetTilt = 50, targetHeading = 0) => {
      setCameraCenter(coords);
      setZoom(targetZoom);
      setTilt(targetTilt);
      setHeading(targetHeading);
    },
    []
  );

  const getRouteColor = (tier: EvacuationRoute3D["tier"]) => {
    switch (tier) {
      case "recommended":
        return "#10b981"; // Emerald
      case "alternative":
        return "#f59e0b"; // Amber
      case "hazardous":
        return "#ef4444"; // Rose/Red
    }
  };

  return (
    <div
      id="google-maps-evacuation-container"
      className={`flex flex-col space-y-5 ${className}`}
    >
      {/* Route Selection Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-3 rounded-2xl shadow-xl">
        <div className="flex items-center gap-2">
          <Navigation className="w-5 h-5 text-cyan-400" />
          <span className="text-sm font-extrabold text-white uppercase tracking-wider font-mono">
            Evacuation Corridor
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(["A", "B", "C"] as const).map((rId) => {
            const r = EVACUATION_ROUTES_3D[rId];
            const isSelected = selectedRouteId === rId;
            return (
              <button
                key={rId}
                id={`btn-select-route-${rId}`}
                type="button"
                onClick={() => {
                  setSelectedRouteId(rId);
                  setActiveStepIndex(0);
                  setCameraCenter(r.waypoints[0]);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? r.tier === "recommended"
                      ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20"
                      : r.tier === "alternative"
                      ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
                      : "bg-rose-600 text-white shadow-lg shadow-rose-600/30"
                    : "bg-slate-800/80 text-slate-300 hover:bg-slate-700"
                }`}
              >
                <span>Route {rId}: {r.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    isSelected
                      ? "bg-black/20 text-slate-950"
                      : "bg-slate-700 text-slate-300"
                  }`}
                >
                  {r.tier === "recommended"
                    ? "Safest (+70m)"
                    : r.tier === "alternative"
                    ? "Forest Path"
                    : "HAZARDOUS FLOOD"}
                </span>
              </button>
            );
          })}
        </div>

        {/* API Key Configure Button */}
        <div className="flex items-center gap-2">
          <button
            id="toggle-gmp-key-btn"
            type="button"
            onClick={() => setShowKeyInput(!showKeyInput)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 hover:border-cyan-500 text-cyan-300 text-xs font-mono transition-colors"
          >
            <Key className="w-3.5 h-3.5" />
            <span>{apiKey ? "Google Maps Connected" : "Set Maps API Key"}</span>
          </button>
        </div>
      </div>

      {/* API Key Modal / Dropdown */}
      {showKeyInput && (
        <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/40 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white font-mono flex items-center gap-2">
              <Key className="w-4 h-4 text-cyan-400" />
              Google Maps Platform Configuration
            </span>
            <button
              onClick={() => setShowKeyInput(false)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <p className="text-slate-400">
            For production, set <code className="text-cyan-300">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> in your environment variables.
            You can also test directly by pasting your Google Maps API Key below:
          </p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputKeyVal}
              onChange={(e) => setInputKeyVal(e.target.value)}
              placeholder="AIzaSy..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100 text-xs font-mono focus:border-cyan-500 focus:outline-none"
            />
            <button
              onClick={() => {
                if (inputKeyVal.trim()) {
                  setApiKey(inputKeyVal.trim());
                  setShowKeyInput(false);
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
            >
              Apply Key
            </button>
          </div>
        </div>
      )}

      {/* Main Interactive Map Canvas Container */}
      <div
        id="google-maps-canvas-wrapper"
        className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950"
      >
        {apiKey ? (
          /* Live Google Maps Platform Instance */
          <APIProvider apiKey={apiKey}>
            <Map
              mapId="bf51a910020fa25a"
              defaultCenter={RESIDENT_HOUSE_COORDS}
              center={cameraCenter}
              defaultZoom={15.5}
              zoom={zoom}
              heading={heading}
              tilt={viewMode === "3d" ? tilt : 0}
              gestureHandling="greedy"
              disableDefaultUI={false}
              mapTypeId={mapType}
              internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
              className="w-full h-full"
            >
              <MapCameraHandler
                center={cameraCenter}
                zoom={zoom}
                tilt={tilt}
                heading={heading}
              />

              {/* Draw 3D Route Polyline */}
              <GoogleMapRoutePolyline
                path={currentRoute.waypoints}
                strokeColor={getRouteColor(currentRoute.tier)}
                strokeWeight={currentRoute.tier === "hazardous" ? 7 : 6}
                strokeOpacity={currentRoute.tier === "hazardous" ? 0.75 : 0.95}
              />

              {/* Markers for all demo locations */}
              {DEMO_LOCATIONS.map((loc) => {
                const isHouse = loc.category === "resident_house";
                const isShelter = loc.category === "shelter";
                const isFlood = loc.category === "flood_zone";

                return (
                  <AdvancedMarker
                    key={loc.id}
                    position={loc.coordinates}
                    title={loc.name}
                    onClick={() => {
                      setSelectedLocation(loc);
                      setInfoWindowLocation(loc);
                    }}
                  >
                    {isHouse ? (
                      /* Resident House 3D Marker */
                      <div className="flex flex-col items-center group cursor-pointer animate-bounce">
                        <div className="px-2 py-0.5 rounded-full bg-cyan-500 text-slate-950 font-mono font-extrabold text-[10px] shadow-lg border border-cyan-300">
                          YOUR HOUSE
                        </div>
                        <div className="w-8 h-8 rounded-xl bg-cyan-900/90 border-2 border-cyan-400 flex items-center justify-center shadow-2xl">
                          <Home className="w-4 h-4 text-cyan-300" />
                        </div>
                      </div>
                    ) : isShelter ? (
                      /* Safe Shelter Pin */
                      <div className="flex flex-col items-center group cursor-pointer">
                        <div className="px-1.5 py-0.5 rounded bg-emerald-600 text-white font-mono text-[9px] font-bold shadow-md">
                          SAFE SHELTER
                        </div>
                        <Pin
                          background="#059669"
                          borderColor="#10b981"
                          glyphColor="#ffffff"
                          scale={1.1}
                        />
                      </div>
                    ) : isFlood ? (
                      /* Flood Inundation Pin */
                      <div className="flex flex-col items-center group cursor-pointer animate-pulse">
                        <div className="px-1.5 py-0.5 rounded bg-rose-600 text-white font-mono text-[9px] font-bold shadow-md">
                          FLOOD SURGE
                        </div>
                        <Pin
                          background="#dc2626"
                          borderColor="#f87171"
                          glyphColor="#ffffff"
                          scale={1.2}
                        />
                      </div>
                    ) : (
                      <Pin background="#d97706" borderColor="#f59e0b" glyphColor="#ffffff" />
                    )}
                  </AdvancedMarker>
                );
              })}

              {/* InfoWindow for Clicked Location */}
              {infoWindowLocation && (
                <InfoWindow
                  position={infoWindowLocation.coordinates}
                  onCloseClick={() => setInfoWindowLocation(null)}
                >
                  <div className="p-1 max-w-xs text-slate-900 font-sans">
                    <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <span>{infoWindowLocation.name}</span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1">
                      {infoWindowLocation.description}
                    </div>
                    <div className="mt-2 text-[10px] font-mono bg-slate-100 p-1.5 rounded border border-slate-200">
                      <div>Elev: {infoWindowLocation.elevationMeters}m MSL</div>
                      {infoWindowLocation.waterDepthMeters !== undefined && (
                        <div className="text-red-600 font-bold">
                          Water Depth: {infoWindowLocation.waterDepthMeters}m
                        </div>
                      )}
                      {infoWindowLocation.safeCapacity && (
                        <div className="text-emerald-700 font-bold">
                          Shelter Capacity: {infoWindowLocation.currentOccupancy} / {infoWindowLocation.safeCapacity}
                        </div>
                      )}
                    </div>
                  </div>
                </InfoWindow>
              )}
            </Map>
          </APIProvider>
        ) : (
          /* Smooth Interactive 3D Terrain Fallback Canvas (Zero Blank Screens) */
          <Interactive3DTerrainEngine
            route={currentRoute}
            selectedLocation={selectedLocation}
            onSelectLocation={(loc) => {
              setSelectedLocation(loc);
              handleFlyToLocation(loc.coordinates, 17, 55);
            }}
            tilt={tilt}
            heading={heading}
            zoom={zoom}
            activeStepIndex={activeStepIndex}
          />
        )}

        {/* 3D Camera Floating HUD Controls */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-2 z-20 pointer-events-auto">
          {/* Tilt Angle Selector */}
          <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-xl shadow-lg backdrop-blur-md">
            <span className="text-[10px] font-mono text-slate-400 px-1.5 uppercase">
              3D Tilt
            </span>
            {[30, 45, 60].map((tVal) => (
              <button
                key={tVal}
                type="button"
                onClick={() => setTilt(tVal)}
                className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-colors ${
                  tilt === tVal
                    ? "bg-cyan-500 text-slate-950"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                {tVal}°
              </button>
            ))}
          </div>

          {/* Heading Compass Rotation Controls */}
          <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-xl shadow-lg backdrop-blur-md">
            <span className="text-[10px] font-mono text-slate-400 px-1.5 uppercase">
              Rotate
            </span>
            {[0, 90, 180, 270].map((hVal) => (
              <button
                key={hVal}
                type="button"
                onClick={() => setHeading(hVal)}
                className={`px-1.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-colors ${
                  heading === hVal
                    ? "bg-cyan-500 text-slate-950"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                {hVal === 0 ? "N" : hVal === 90 ? "E" : hVal === 180 ? "S" : "W"}
              </button>
            ))}
          </div>

          {/* Zoom and Reset Controls */}
          <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-xl shadow-lg backdrop-blur-md">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(z + 1, 19))}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(z - 1, 12))}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setCameraCenter(RESIDENT_HOUSE_COORDS);
                setZoom(15.5);
                setTilt(45);
                setHeading(0);
              }}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-cyan-400"
              title="Fly to Your House"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Floating Legend / Live Telemetry Pill */}
        <div className="absolute bottom-3 left-3 bg-slate-900/95 border border-slate-800 px-3 py-2 rounded-xl text-xs font-mono shadow-2xl backdrop-blur-md z-20 pointer-events-auto space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-white font-bold">Corridor: {currentRoute.name}</span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-2">
            <span>Distance: {currentRoute.totalDistanceKm} km</span>
            <span>•</span>
            <span className="text-emerald-400 font-bold">
              +{currentRoute.totalElevationGainM}m High Ground
            </span>
          </div>
        </div>
      </div>

      {/* 3D Turn-By-Turn Navigator ("Where to Go, How to Go") */}
          <EvacuationNavigator
            route={currentRoute}
            activeStepIndex={activeStepIndex}
        onSelectStep={setActiveStepIndex}
        onFlyToStep={(coords, targetZoom, targetTilt, targetHeading) => {
          handleFlyToLocation(coords, targetZoom, targetTilt, targetHeading);
        }}
          />

      {/* Sift Every Demo Location Where Floods Come */}
      <DemoLocationSifter
        locations={DEMO_LOCATIONS}
        selectedLocationId={selectedLocation?.id || null}
        onSelectLocation={(loc) => setSelectedLocation(loc)}
        onFlyToLocation={(coords, targetZoom, targetTilt) => {
          handleFlyToLocation(coords, targetZoom, targetTilt);
        }}
      />
    </div>
  );
}

// -------------------------------------------------------------
// Resilient Interactive 3D Terrain Fallback Engine
// Provides high-fidelity 3D contours, isometric house structure,
// animated flood plane surge, and interactive route nodes.
// -------------------------------------------------------------
function Interactive3DTerrainEngine({
  route,
  selectedLocation,
  onSelectLocation,
  tilt,
  heading,
  zoom,
  activeStepIndex,
}: {
  route: EvacuationRoute3D;
  selectedLocation: DemoLocation | null;
  onSelectLocation: (loc: DemoLocation) => void;
  tilt: number;
  heading: number;
  zoom: number;
  activeStepIndex: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrame: number;
    let waveOffset = 0;

    const render = () => {
      waveOffset += 0.03;
      const width = (canvas.width = canvas.parentElement?.clientWidth || 800);
      const height = (canvas.height = canvas.parentElement?.clientHeight || 520);

      ctx.clearRect(0, 0, width, height);

      // 1. Mountain Topography Base Gradient
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, "#090d16");
      bgGrad.addColorStop(0.5, "#0d1424");
      bgGrad.addColorStop(1, "#070a10");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. 3D Isometric Grid Transform based on Tilt and Heading
      ctx.save();
      ctx.translate(width / 2, height / 2);
      const radHeading = (heading * Math.PI) / 180;
      ctx.rotate(radHeading * 0.2); // Subtle smooth rotation
      const scaleFactor = (zoom / 15.5) * (1 + (tilt - 30) * 0.005);
      ctx.scale(scaleFactor, scaleFactor * (0.65 + (60 - tilt) * 0.005));

      // 3. Draw Topographic Elevation Contours (1400m to 1700m MSL)
      const contourLevels = [
        { elev: 1420, color: "#141c2e", stroke: "#1e293b", radiusX: 340, radiusY: 200 },
        { elev: 1480, color: "#16233b", stroke: "#25344d", radiusX: 280, radiusY: 160 },
        { elev: 1540, color: "#1b2d4b", stroke: "#2e4263", radiusX: 210, radiusY: 120 },
        { elev: 1600, color: "#20375c", stroke: "#3b5580", radiusX: 140, radiusY: 80 },
        { elev: 1680, color: "#254370", stroke: "#49699e", radiusX: 70, radiusY: 40 },
      ];

      contourLevels.forEach((level) => {
        ctx.beginPath();
        ctx.ellipse(0, 40, level.radiusX, level.radiusY, 0, 0, Math.PI * 2);
        ctx.fillStyle = level.color;
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = level.stroke;
        ctx.stroke();

        // Contour Elevation Label
        ctx.fillStyle = "#64748b";
        ctx.font = "9px monospace";
        ctx.fillText(`${level.elev}m MSL`, -level.radiusX + 10, 40);
      });

      // 4. Animated 3D Floodwater Surge Plane in Low Khad Basin
      ctx.beginPath();
      ctx.ellipse(120, 110, 160, 90, 0.2, 0, Math.PI * 2);
      const floodGrad = ctx.createLinearGradient(0, 50, 200, 180);
      floodGrad.addColorStop(0, "rgba(225, 29, 72, 0.25)");
      floodGrad.addColorStop(0.5, "rgba(239, 68, 68, 0.45)");
      floodGrad.addColorStop(1, "rgba(185, 28, 28, 0.35)");
      ctx.fillStyle = floodGrad;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(244, 63, 94, 0.8)";
      ctx.stroke();

      // Flood ripple rings
      for (let r = 0; r < 3; r++) {
        const rippleR = 30 + ((waveOffset * 25 + r * 35) % 90);
        ctx.beginPath();
        ctx.ellipse(120, 110, rippleR * 1.5, rippleR * 0.8, 0.2, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(251, 113, 133, ${Math.max(0, 1 - rippleR / 90) * 0.4})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // 5. Draw 3D Evacuation Route Ribbon Path
      // Screen coordinates mapped from Solan geo coordinates
      const mapGeoToScreen = (lat: number, lng: number, elev = 1550) => {
        const dx = (lng - RESIDENT_HOUSE_COORDS.lng) * 9000;
        const dy = (lat - RESIDENT_HOUSE_COORDS.lat) * -9000;
        // Apply elevation displacement up along Z-axis
        const zDisplace = (elev - 1550) * 0.8;
        return { x: dx, y: dy - zDisplace };
      };

      // Draw Route Path Lines
      const waypoints = route.waypoints.map((pt) => mapGeoToScreen(pt.lat, pt.lng, pt.elevation));
      if (waypoints.length > 1) {
        ctx.beginPath();
        ctx.moveTo(waypoints[0].x, waypoints[0].y);
        for (let i = 1; i < waypoints.length; i++) {
          ctx.lineTo(waypoints[i].x, waypoints[i].y);
        }

        const isHazardous = route.tier === "hazardous";
        ctx.lineWidth = 8;
        ctx.strokeStyle = isHazardous ? "rgba(239, 68, 68, 0.3)" : "rgba(16, 185, 129, 0.3)";
        ctx.stroke();

        ctx.lineWidth = 3;
        ctx.strokeStyle = isHazardous ? "#ef4444" : "#10b981";
        ctx.stroke();

        // Pulsing active step waypoint
        const activeWp = waypoints[Math.min(activeStepIndex, waypoints.length - 1)];
        if (activeWp) {
          ctx.beginPath();
          ctx.arc(activeWp.x, activeWp.y, 10 + Math.sin(waveOffset * 3) * 3, 0, Math.PI * 2);
          ctx.fillStyle = "#06b6d4";
          ctx.fill();
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      // 6. 3D Isometric Resident House Model at (0, 0)
      const housePos = mapGeoToScreen(RESIDENT_HOUSE_COORDS.lat, RESIDENT_HOUSE_COORDS.lng, 1550);
      draw3DHouse(ctx, housePos.x, housePos.y);

      // 7. Shelter 3D Marker
      const shelterPos = mapGeoToScreen(route.destinationCoords.lat, route.destinationCoords.lng, route.destinationElevM);
      draw3DShelter(ctx, shelterPos.x, shelterPos.y, route.destinationName);

      // 8. Flood Hazard Demo Locations Pins
      DEMO_LOCATIONS.filter((l) => l.category === "flood_zone").forEach((floodLoc) => {
        const p = mapGeoToScreen(floodLoc.coordinates.lat, floodLoc.coordinates.lng, floodLoc.elevationMeters);
        drawFloodHazardPin(ctx, p.x, p.y, floodLoc.shortName, floodLoc.waterDepthMeters || 1.5);
      });

      ctx.restore();

      animFrame = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animFrame);
  }, [route, tilt, heading, zoom, activeStepIndex]);

  return (
    <div className="relative w-full h-full">
      <canvas ref={canvasRef} className="w-full h-full block cursor-grab active:cursor-grabbing" />
      {/* 3D Visual Banner */}
      <div className="absolute top-3 left-3 bg-slate-900/90 border border-cyan-500/30 px-3 py-1.5 rounded-xl text-xs font-mono text-cyan-300 shadow-xl backdrop-blur-md flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
        <span>3D Terrain Engine (Solan Catchment • Elev. 1,420m–1,680m)</span>
      </div>
    </div>
  );
}

// 3D House Isometric Drawing Helper
function draw3DHouse(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.translate(x, y);

  // House Base Shadow
  ctx.beginPath();
  ctx.ellipse(0, 10, 22, 12, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fill();

  // Walls (Isometric Box)
  // Front Wall
  ctx.fillStyle = "#0284c7"; // Sky Blue
  ctx.fillRect(-12, -12, 24, 18);

  // Roof (Pyramidal / Gable)
  ctx.beginPath();
  ctx.moveTo(-16, -12);
  ctx.lineTo(0, -26);
  ctx.lineTo(16, -12);
  ctx.closePath();
  ctx.fillStyle = "#38bdf8"; // Bright Cyan Roof
  ctx.fill();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Door
  ctx.fillStyle = "#0c4a6e";
  ctx.fillRect(-3, -2, 6, 8);

  // Label
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 10px monospace";
  ctx.textAlign = "center";
  ctx.fillText("YOUR RESIDENCE", 0, -32);
  ctx.fillStyle = "#38bdf8";
  ctx.font = "9px monospace";
  ctx.fillText("1,550m MSL", 0, -20);

  ctx.restore();
}

// 3D Shelter Drawing Helper
function draw3DShelter(ctx: CanvasRenderingContext2D, x: number, y: number, name: string) {
  ctx.save();
  ctx.translate(x, y);

  // Shield Base
  ctx.beginPath();
  ctx.arc(0, 0, 18, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(16, 185, 129, 0.2)";
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#10b981";
  ctx.stroke();

  // Shelter Building Block
  ctx.fillStyle = "#059669";
  ctx.fillRect(-10, -10, 20, 16);

  // Roof
  ctx.beginPath();
  ctx.moveTo(-14, -10);
  ctx.lineTo(0, -22);
  ctx.lineTo(14, -10);
  ctx.closePath();
  ctx.fillStyle = "#34d399";
  ctx.fill();

  // Label
  ctx.fillStyle = "#34d399";
  ctx.font = "bold 10px monospace";
  ctx.textAlign = "center";
  ctx.fillText("SAFE SHELTER", 0, -26);
  ctx.fillStyle = "#94a3b8";
  ctx.font = "8px monospace";
  ctx.fillText(name.slice(0, 22), 0, 18);

  ctx.restore();
}

// Flood Hazard Pin Helper
function drawFloodHazardPin(ctx: CanvasRenderingContext2D, x: number, y: number, name: string, depth: number) {
  ctx.save();
  ctx.translate(x, y);

  ctx.beginPath();
  ctx.arc(0, 0, 8, 0, Math.PI * 2);
  ctx.fillStyle = "#ef4444";
  ctx.fill();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = "#f87171";
  ctx.font = "bold 9px monospace";
  ctx.textAlign = "center";
  ctx.fillText(`FLOOD ${depth}m`, 0, -12);
  ctx.fillStyle = "#cbd5e1";
  ctx.font = "8px monospace";
  ctx.fillText(name, 0, 16);

  ctx.restore();
}
