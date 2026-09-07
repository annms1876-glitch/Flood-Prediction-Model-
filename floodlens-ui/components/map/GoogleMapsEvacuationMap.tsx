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
  strokeColor = "#6f8d54",
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
  const [floodLevel, setFloodLevel] = useState(42);
  const [showSafeRoutes, setShowSafeRoutes] = useState(true);
  const [showHazards, setShowHazards] = useState(true);

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
        return "#6f8d54"; // Emerald
      case "alternative":
        return "#f9a600"; // Amber
      case "hazardous":
        return "#f0624f"; // Rose/Red
    }
  };

  return (
    <div
      id="google-maps-evacuation-container"
      className={`flex flex-col space-y-5 GoogleMapsEvacuationMap ${className || ""}`}
    >
      {/* Route Selection Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#fffdf8]/95 border border-[#e3dfd5] p-3 rounded-2xl shadow-xl">
        <div className="flex items-center gap-2">
          <Navigation className="w-5 h-5 text-[#e89b01]" />
          <span className="text-sm font-extrabold text-[#261b07] uppercase tracking-wider font-mono">
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
                      : "bg-rose-600 text-[#261b07] shadow-lg shadow-rose-600/30"
                    : "bg-[#e3dfd5] text-[#61594a] hover:bg-slate-700"
                }`}
              >
                <span>Route {rId}: {r.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    isSelected
                      ? "bg-black/20 text-slate-950"
                      : "bg-slate-700 text-[#61594a]"
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


      </div>

      <div className="map-control-deck flex flex-col gap-3 rounded-2xl border border-[#e3dfd5] bg-[#fffdf8] p-4 shadow-[0_4px_8px_rgba(38,27,7,.06)] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f8da9d] text-[#261b07]"><Waves className="h-4 w-4" /></div><div><p className="text-xs font-semibold uppercase tracking-[.12em] text-[#8f897e]">Live flood level</p><p className="text-sm font-semibold text-[#261b07]">{floodLevel}% basin saturation signal</p></div></div>
        <div className="flex flex-1 items-center gap-3 sm:max-w-sm"><input aria-label="Flood level" type="range" min="0" max="100" value={floodLevel} onChange={(event) => setFloodLevel(Number(event.target.value))} className="map-flood-slider w-full accent-[#f9a600]" /><span className="w-12 text-right font-mono text-xs font-semibold text-[#e89b01]">{floodLevel}%</span></div>
        <div className="flex items-center gap-2"><button type="button" onClick={() => setFloodLevel(20)} className="map-preset rounded-md border border-[#e3dfd5] px-2 py-1.5 text-[11px] font-semibold text-[#61594a]">LOW</button><button type="button" onClick={() => setFloodLevel(55)} className="map-preset rounded-md border border-[#e3dfd5] px-2 py-1.5 text-[11px] font-semibold text-[#61594a]">WATCH</button><button type="button" onClick={() => setFloodLevel(82)} className="map-preset rounded-md border border-[#e3dfd5] px-2 py-1.5 text-[11px] font-semibold text-[#61594a]">SURGE</button></div>
        <div className="flex items-center gap-2 border-l border-[#e3dfd5] pl-3"><button type="button" aria-pressed={showSafeRoutes} onClick={() => setShowSafeRoutes((value) => !value)} className={`rounded-md px-2 py-1.5 text-[11px] font-semibold ${showSafeRoutes ? "bg-[#edf3e8] text-[#6f8d54]" : "bg-[#e3dfd5] text-[#8f897e]"}`}>Safe routes</button><button type="button" aria-pressed={showHazards} onClick={() => setShowHazards((value) => !value)} className={`rounded-md px-2 py-1.5 text-[11px] font-semibold ${showHazards ? "bg-[#fff0ed] text-[#d94b3b]" : "bg-[#e3dfd5] text-[#8f897e]"}`}>Hazards</button></div>
      </div>

      {/* API Key Modal / Dropdown */}
      {showKeyInput && (
        <div className="p-4 rounded-xl bg-[#f2efe8] border border-[#e89b01]/50 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#261b07] font-mono flex items-center gap-2">
              <Key className="w-4 h-4 text-[#e89b01]" />
              Google Maps Platform Configuration
            </span>
            <button
              onClick={() => setShowKeyInput(false)}
              className="text-[#8f897e] hover:text-[#261b07]"
            >
              ✕
            </button>
          </div>
          <p className="text-[#8f897e]">
            For production, set <code className="text-[#e89b01]">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> in your environment variables.
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
              className="px-3 py-1.5 rounded-lg bg-[#f9a600] hover:bg-cyan-400 text-slate-950 font-bold"
            >
              Apply Key
            </button>
          </div>
        </div>
      )}

      {/* Main Interactive Map Canvas Container */}
      <div
        id="google-maps-canvas-wrapper"
        className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-[#f2efe8]"
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
                strokeOpacity={showSafeRoutes ? (currentRoute.tier === "hazardous" ? 0.75 : 0.95) : 0}
              />

              {/* Route Distance Badge rendered on the map itself at the midpoint waypoint */}
              <AdvancedMarker
                position={{
                  lat: currentRoute.waypoints[Math.floor(currentRoute.waypoints.length / 2)].lat,
                  lng: currentRoute.waypoints[Math.floor(currentRoute.waypoints.length / 2)].lng
                }}
                title="Evacuation corridor distance information"
              >
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono font-bold text-[#261b07] shadow-xl border backdrop-blur-sm transition-all duration-300 hover:scale-105 active:scale-95 ${
                  currentRoute.tier === "recommended"
                    ? "bg-emerald-950/95 border-emerald-400 text-emerald-300 shadow-emerald-500/10"
                    : currentRoute.tier === "alternative"
                    ? "bg-amber-950/95 border-amber-400 text-amber-300 shadow-amber-500/10"
                    : "bg-rose-950/95 border-rose-400 text-rose-300 shadow-rose-500/10"
                }`}>
                  <Navigation className="w-3 h-3 rotate-45 text-[#e89b01]" />
                  <span>{currentRoute.totalDistanceKm} km</span>
                  <span className="opacity-40 font-normal">|</span>
                  <span className="animate-pulse">{currentRoute.estimatedMinutes} mins</span>
                </div>
              </AdvancedMarker>

              {/* Markers for all demo locations */}
              {DEMO_LOCATIONS.map((loc) => {
                if (!showHazards && loc.category === "flood_zone") return null;
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
                        <div className="px-2 py-0.5 rounded-full bg-[#f9a600] text-slate-950 font-mono font-extrabold text-[10px] shadow-lg border border-cyan-300">
                          YOUR HOUSE
                        </div>
                        <div className="w-8 h-8 rounded-xl bg-cyan-900/90 border-2 border-cyan-400 flex items-center justify-center shadow-2xl">
                          <Home className="w-4 h-4 text-[#e89b01]" />
                        </div>
                      </div>
                    ) : isShelter ? (
                      /* Safe Shelter Pin */
                      <div className="flex flex-col items-center group cursor-pointer">
                        <div className="px-1.5 py-0.5 rounded bg-emerald-600 text-[#261b07] font-mono text-[9px] font-bold shadow-md">
                          SAFE SHELTER
                        </div>
                        <Pin
                          background="#6f8d54"
                          borderColor="#6f8d54"
                          glyphColor="#ffffff"
                          scale={1.1}
                        />
                      </div>
                    ) : isFlood ? (
                      /* Flood Inundation Pin */
                      <div className="flex flex-col items-center group cursor-pointer animate-pulse">
                        <div className="px-1.5 py-0.5 rounded bg-rose-600 text-[#261b07] font-mono text-[9px] font-bold shadow-md">
                          FLOOD SURGE
                        </div>
                        <Pin
                          background="#f0624f"
                          borderColor="#f87171"
                          glyphColor="#ffffff"
                          scale={1.2}
                        />
                      </div>
                    ) : (
                      <Pin background="#e89b01" borderColor="#f9a600" glyphColor="#ffffff" />
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
            floodLevel={floodLevel}
            showSafeRoutes={showSafeRoutes}
            showHazards={showHazards}
          />
        )}

        {/* 3D Camera Floating HUD Controls */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-2 z-20 pointer-events-auto">
          {/* Tilt Angle Selector */}
          <div className="flex items-center gap-1 bg-[#fffdf8]/95 border border-[#e3dfd5] p-1 rounded-xl shadow-lg backdrop-blur-md">
            <span className="text-[10px] font-mono text-[#8f897e] px-1.5 uppercase">
              3D Tilt
            </span>
            {[30, 45, 60].map((tVal) => (
              <button
                key={tVal}
                type="button"
                onClick={() => setTilt(tVal)}
                className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-colors ${
                  tilt === tVal
                    ? "bg-[#f9a600] text-slate-950"
                    : "text-[#61594a] hover:bg-[#e3dfd5]"
                }`}
              >
                {tVal}°
              </button>
            ))}
          </div>

          {/* Heading Compass Rotation Controls */}
          <div className="flex items-center gap-1 bg-[#fffdf8]/95 border border-[#e3dfd5] p-1 rounded-xl shadow-lg backdrop-blur-md">
            <span className="text-[10px] font-mono text-[#8f897e] px-1.5 uppercase">
              Rotate
            </span>
            {[0, 90, 180, 270].map((hVal) => (
              <button
                key={hVal}
                type="button"
                onClick={() => setHeading(hVal)}
                className={`px-1.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-colors ${
                  heading === hVal
                    ? "bg-[#f9a600] text-slate-950"
                    : "text-[#61594a] hover:bg-[#e3dfd5]"
                }`}
              >
                {hVal === 0 ? "N" : hVal === 90 ? "E" : hVal === 180 ? "S" : "W"}
              </button>
            ))}
          </div>

          {/* Zoom and Reset Controls */}
          <div className="flex items-center gap-1 bg-[#fffdf8]/95 border border-[#e3dfd5] p-1 rounded-xl shadow-lg backdrop-blur-md">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(z + 1, 19))}
              className="p-1.5 rounded-lg hover:bg-[#e3dfd5] text-[#61594a]"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(z - 1, 12))}
              className="p-1.5 rounded-lg hover:bg-[#e3dfd5] text-[#61594a]"
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
              className="p-1.5 rounded-lg hover:bg-[#e3dfd5] text-[#e89b01]"
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
            <span className="text-[#261b07] font-bold">Corridor: {currentRoute.name}</span>
          </div>
          <div className="text-[11px] text-[#8f897e] flex items-center gap-2">
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
  floodLevel,
  showSafeRoutes,
  showHazards,
}: {
  route: EvacuationRoute3D;
  selectedLocation: DemoLocation | null;
  onSelectLocation: (loc: DemoLocation) => void;
  tilt: number;
  heading: number;
  zoom: number;
  activeStepIndex: number;
  floodLevel: number;
  showSafeRoutes: boolean;
  showHazards: boolean;
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
      bgGrad.addColorStop(0, "#e8e2d6");
      bgGrad.addColorStop(0.5, "#f2efe8");
      bgGrad.addColorStop(1, "#f8f7f5");
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
        { elev: 1420, color: "#e4ddcf", stroke: "#9a8c73", radiusX: 340, radiusY: 200 },
        { elev: 1480, color: "#ded4c2", stroke: "#a9997f", radiusX: 280, radiusY: 160 },
        { elev: 1540, color: "#d4c7b0", stroke: "#98866a", radiusX: 210, radiusY: 120 },
        { elev: 1600, color: "#c9b99c", stroke: "#8b7656", radiusX: 140, radiusY: 80 },
        { elev: 1680, color: "#bda985", stroke: "#7b6545", radiusX: 70, radiusY: 40 },
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
      const floodScale = 0.7 + floodLevel / 100;
      ctx.ellipse(120, 110, 160 * floodScale, 90 * floodScale, 0.2, 0, Math.PI * 2);
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
      if (showSafeRoutes && waypoints.length > 1) {
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
        ctx.strokeStyle = isHazardous ? "#f0624f" : "#6f8d54";
        ctx.stroke();

        // Pulsing active step waypoint
        const activeWp = waypoints[Math.min(activeStepIndex, waypoints.length - 1)];
        if (activeWp) {
          ctx.beginPath();
          ctx.arc(activeWp.x, activeWp.y, 10 + Math.sin(waveOffset * 3) * 3, 0, Math.PI * 2);
          ctx.fillStyle = "#f9a600";
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
      DEMO_LOCATIONS.filter((l) => showHazards && l.category === "flood_zone").forEach((floodLoc) => {
        const p = mapGeoToScreen(floodLoc.coordinates.lat, floodLoc.coordinates.lng, floodLoc.elevationMeters);
        drawFloodHazardPin(ctx, p.x, p.y, floodLoc.shortName, floodLoc.waterDepthMeters || 1.5);
      });

      ctx.restore();

      animFrame = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animFrame);
  }, [route, tilt, heading, zoom, activeStepIndex, floodLevel, showSafeRoutes, showHazards]);

  return (
    <div className="relative w-full h-full">
      <canvas ref={canvasRef} className="w-full h-full block cursor-grab active:cursor-grabbing" />
      {/* 3D Visual Banner */}
      <div className="absolute top-3 left-3 bg-slate-900/90 border border-[#e89b01]/50 px-3 py-1.5 rounded-xl text-xs font-mono text-[#e89b01] shadow-xl backdrop-blur-md flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-[#e89b01]" />
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
  ctx.strokeStyle = "#6f8d54";
  ctx.stroke();

  // Shelter Building Block
  ctx.fillStyle = "#6f8d54";
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
  ctx.fillStyle = "#f0624f";
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
