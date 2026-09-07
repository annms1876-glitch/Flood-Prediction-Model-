"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { GoogleMapsEvacuationMap } from "@/components/map/GoogleMapsEvacuationMap";
import {
  Play,
  Pause,
  RotateCcw,
  Layers,
  Compass,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Navigation,
  Eye,
  ShieldAlert,
  Radio,
  Building,
  CloudRain,
  Activity,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Info,
  MapPin,
  Sparkles,
} from "lucide-react";

export default function ThreeDMapView() {
  // Main View Mode: Google Maps 3D Platform vs Topographic Mesh
  const [activeEngine, setActiveEngine] = useState<"google-maps-3d" | "topo-mesh">("google-maps-3d");

  // Simulation State
  const [isPlaying, setIsPlaying] = useState(false);
  const [timelineStep, setTimelineStep] = useState(0); // 0: T-0, 1: +2h, 2: +4h, 3: +6h
  const [speed, setSpeed] = useState<1 | 2 | 5>(1);
  const [terrainMode, setTerrainMode] = useState<"hybrid" | "topo" | "satellite">("hybrid");
  const [showContours, setShowContours] = useState(true);
  const [showFloodZones, setShowFloodZones] = useState(true);
  const [showSensors, setShowSensors] = useState(true);
  const [showShelters, setShowShelters] = useState(true);
  const [rainIntensity, setRainIntensity] = useState<"none" | "light" | "torrential">("light");
  const [pitch, setPitch] = useState<45 | 60 | 30>(45);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedPin, setSelectedPin] = useState<{
    id: string;
    name: string;
    type: "sensor" | "shelter" | "village";
    details: string;
    level?: string;
    elevation?: string;
    status?: string;
  } | null>({
    id: "S-001",
    name: "Solan Giri River Sensor S-001",
    type: "sensor",
    details: "Piezoelectric water depth gauge installed at Giri suspension bridge pylons.",
    level: "2.34m (Rising +0.18m/h)",
    elevation: "1,480m MSL",
    status: "Nominal Watch",
  });

  // Simulation timer loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      const intervalMs = (3000 / speed);
      timer = setInterval(() => {
        setTimelineStep((prev) => (prev + 1) % 4);
      }, intervalMs);
    }
    return () => clearInterval(timer);
  }, [isPlaying, speed]);

  const timelineLabels = [
    { label: "T-0 (Now)", desc: "Normal Flow (2.3m)", color: "text-emerald-400" },
    { label: "+2 HR", desc: "Surge Peak (+1.4m)", color: "text-amber-400" },
    { label: "+4 HR", desc: "Catchment Overflow (+2.8m)", color: "text-orange-400" },
    { label: "+6 HR", desc: "Max Crest Zone (+3.9m)", color: "text-rose-500" },
  ];

  // Calculate dynamic water level based on timeline step
  const simulatedWaterLevel = (2.34 + timelineStep * 0.95).toFixed(2);
  const surgeRisk =
    timelineStep === 0
      ? "NORMAL (12/100)"
      : timelineStep === 1
      ? "WATCH (45/100)"
      : timelineStep === 2
      ? "WARNING (76/100)"
      : "EVACUATE (94/100)";

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <span className="uppercase tracking-wider">Tactical GIS</span>
            <span className="text-slate-600">•</span>
            <span>Himalayan Digital Elevation Model (1.5x Exaggeration)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            3D Terrain &amp; Flood Simulation
            <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono font-bold">
              3D Interactive
            </span>
          </h1>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start md:self-center">
          <Link
            href="/evacuation-routes"
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-md shadow-cyan-600/20 flex items-center gap-2"
          >
            <span>Evacuation Routes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/sos-emergency"
            className="px-3.5 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 text-xs font-bold transition-colors"
          >
            Emergency SOS
          </Link>
        </div>
      </div>

      {/* Engine View Mode Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-slate-900/90 border border-slate-800 rounded-2xl">
        <div className="flex items-center gap-1.5">
          <button
            id="btn-engine-google-maps"
            type="button"
            onClick={() => setActiveEngine("google-maps-3d")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeEngine === "google-maps-3d"
                ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Google Maps 3D Evacuation &amp; Hazard Radar</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-950/40 text-cyan-300 font-mono">
              Live Interactive
            </span>
          </button>
          <button
            id="btn-engine-topo-mesh"
            type="button"
            onClick={() => setActiveEngine("topo-mesh")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeEngine === "topo-mesh"
                ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Hydrodynamic Catchment Mesh (Time-Lapse)</span>
          </button>
        </div>

        <div className="text-xs font-mono text-slate-400 hidden sm:block px-2">
          {activeEngine === "google-maps-3d"
            ? "Resident House (1,550m) • Safe Shelters • Turn-By-Turn Glide"
            : "HFL Inundation Timeline (+0h to +6h Surge Horizon)"}
        </div>
      </div>

      {activeEngine === "google-maps-3d" ? (
        /* Primary Google Maps Platform 3D Evacuation & Sifter Component */
        <GoogleMapsEvacuationMap initialRouteId="A" />
      ) : (
        /* Topographic Hydrodynamic Mesh Viewport */
        <div className="relative w-full rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden min-h-[580px] lg:min-h-[640px] flex flex-col">
        {/* Top Floating Viewport Control Bar */}
        <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
          {/* Map Layer Switchers */}
          <div className="pointer-events-auto flex items-center gap-1 p-1 bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700/80 shadow-lg text-xs">
            <button
              onClick={() => setTerrainMode("hybrid")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                terrainMode === "hybrid"
                  ? "bg-cyan-600 text-white font-bold shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Hybrid 3D
            </button>
            <button
              onClick={() => setTerrainMode("topo")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                terrainMode === "topo"
                  ? "bg-cyan-600 text-white font-bold shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Topographic
            </button>
            <button
              onClick={() => setTerrainMode("satellite")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                terrainMode === "satellite"
                  ? "bg-cyan-600 text-white font-bold shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Satellite Ortho
            </button>
          </div>

          {/* HUD Status Pill */}
          <div className="pointer-events-auto hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-xs shadow-lg">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-white font-semibold">Sim Level:</span>
              <span className="font-mono text-cyan-400 font-bold">{simulatedWaterLevel} m</span>
            </div>
            <span className="text-slate-600">•</span>
            <span className="font-mono text-xs font-bold text-slate-300">{surgeRisk}</span>
          </div>

          {/* Quick Layer Toggles */}
          <div className="pointer-events-auto flex items-center gap-1.5 p-1 bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700/80 shadow-lg text-xs text-slate-300">
            <button
              onClick={() => setShowContours(!showContours)}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                showContours ? "bg-slate-700 text-cyan-300 font-semibold" : "text-slate-400"
              }`}
              title="Toggle 50m Contour Lines"
            >
              Contours
            </button>
            <button
              onClick={() => setShowFloodZones(!showFloodZones)}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                showFloodZones ? "bg-slate-700 text-cyan-300 font-semibold" : "text-slate-400"
              }`}
              title="Toggle Inundation Buffers"
            >
              Flood Zones
            </button>
            <button
              onClick={() => setShowSensors(!showSensors)}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                showSensors ? "bg-slate-700 text-cyan-300 font-semibold" : "text-slate-400"
              }`}
              title="Toggle Sensors"
            >
              Sensors
            </button>
            <button
              onClick={() => setShowShelters(!showShelters)}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                showShelters ? "bg-slate-700 text-emerald-300 font-semibold" : "text-slate-400"
              }`}
              title="Toggle Safe Shelters"
            >
              Shelters
            </button>
          </div>
        </div>

        {/* 3D Simulation Stage (Interactive Canvas Visualizer) */}
        <div className="relative flex-1 w-full bg-[#080d19] overflow-hidden flex items-center justify-center">
          {/* Background Topographic 3D Perspective Grid */}
          <svg
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500"
            style={{
              transform: `scale(${zoomLevel}) rotateX(${pitch === 30 ? 20 : pitch === 45 ? 35 : 50}deg)`,
              transformOrigin: "center center",
            }}
            viewBox="0 0 1200 800"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              {/* Dynamic Water Inundation Gradient */}
              <linearGradient id="waterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0369a1" stopOpacity="0.8" />
                <stop offset="40%" stopColor="#0ea5e9" stopOpacity={0.8 + timelineStep * 0.05} />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.9} />
              </linearGradient>

              {/* Rain Particle Pattern */}
              <pattern id="rainPattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <line x1="10" y1="0" x2="0" y2="30" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.4" />
                <line x1="30" y1="5" x2="20" y2="35" stroke="#38bdf8" strokeWidth="1.2" strokeOpacity="0.5" />
              </pattern>

              {/* Contour Grid Pattern */}
              <pattern id="contourGrid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#1e293b" strokeWidth="0.8" />
              </pattern>
            </defs>

            {/* Base Coordinate Grid */}
            <rect width="1200" height="800" fill="#090e1a" />
            <rect width="1200" height="800" fill="url(#contourGrid)" opacity="0.6" />

            {/* Mountain Massif 1 (West Ridge) */}
            <path
              d="M 50,750 L 220,320 L 390,750 Z"
              fill={terrainMode === "satellite" ? "#1a2530" : "#111b2b"}
              stroke="#1e293b"
              strokeWidth="2"
            />
            {/* Mountain Massif 2 (Solan Peak 1850m) */}
            <path
              d="M 280,750 L 520,210 L 780,750 Z"
              fill={terrainMode === "satellite" ? "#202e3c" : "#132135"}
              stroke="#334155"
              strokeWidth="2"
            />
            {/* Mountain Massif 3 (East Ridge) */}
            <path
              d="M 680,750 L 920,290 L 1150,750 Z"
              fill={terrainMode === "satellite" ? "#1a2530" : "#101a28"}
              stroke="#1e293b"
              strokeWidth="2"
            />

            {/* Topographic Contours Overlay */}
            {showContours && (
              <g stroke="#334155" strokeWidth="1.2" fill="none" opacity="0.8" strokeDasharray="3,4">
                <ellipse cx="520" cy="270" rx="90" ry="40" />
                <ellipse cx="520" cy="340" rx="160" ry="70" />
                <ellipse cx="520" cy="420" rx="230" ry="110" />
                <ellipse cx="520" cy="510" rx="310" ry="150" />
                <ellipse cx="520" cy="620" rx="420" ry="190" />
                <text x="590" y="270" fill="#64748b" fontSize="10" fontFamily="monospace">1800m</text>
                <text x="650" y="340" fill="#64748b" fontSize="10" fontFamily="monospace">1650m</text>
                <text x="720" y="420" fill="#64748b" fontSize="10" fontFamily="monospace">1500m</text>
              </g>
            )}

            {/* Dynamic Simulated Flood Inundation Polygon */}
            {showFloodZones && (
              <g>
                {/* Red Max Hazard Zone (Expands with timelineStep) */}
                <path
                  d={`M 0,${620 - timelineStep * 30} Q 300,${570 - timelineStep * 35} 600,${
                    590 - timelineStep * 28
                  } T 1200,${630 - timelineStep * 32} L 1200,800 L 0,800 Z`}
                  fill="url(#waterGrad)"
                  opacity={0.4 + timelineStep * 0.15}
                />
                {/* Warning Fringe Water Line */}
                <path
                  d={`M 0,${620 - timelineStep * 30} Q 300,${570 - timelineStep * 35} 600,${
                    590 - timelineStep * 28
                  } T 1200,${630 - timelineStep * 32}`}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth={3 + timelineStep * 1.5}
                />
              </g>
            )}

            {/* Sinuous River Vector Channel */}
            <path
              d="M -20,680 C 260,650 380,590 530,580 C 740,570 910,640 1220,670"
              fill="none"
              stroke="#0284c7"
              strokeWidth={14 + timelineStep * 10}
              strokeLinecap="round"
            />
            <path
              d="M -20,680 C 260,650 380,590 530,580 C 740,570 910,640 1220,670"
              fill="none"
              stroke="#38bdf8"
              strokeWidth={4 + timelineStep * 4}
              strokeDasharray="16,8"
              opacity="0.9"
            />

            {/* Rain simulation overlay */}
            {rainIntensity !== "none" && (
              <rect
                width="1200"
                height="800"
                fill="url(#rainPattern)"
                opacity={rainIntensity === "torrential" ? 0.75 : 0.4}
              />
            )}
          </svg>

          {/* Interactive HTML Markers Placed in 3D Space */}
          {/* Marker S-001: Solan Giri Bridge River Sensor */}
          {showSensors && (
            <div
              id="pin-sensor-s001"
              onClick={() =>
                setSelectedPin({
                  id: "S-001",
                  name: "Solan Giri River Sensor S-001",
                  type: "sensor",
                  details:
                    "Piezoelectric water depth gauge installed at Giri suspension bridge pylons. LoRa node active.",
                  level: `${simulatedWaterLevel}m`,
                  elevation: "1,480m MSL",
                  status: timelineStep > 1 ? "WARNING SURGE" : "NOMINAL WATCH",
                })
              }
              className="absolute top-[54%] left-[45%] -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 group"
            >
              <div className="relative flex items-center justify-center">
                <span className="animate-ping absolute inline-flex h-12 w-12 rounded-full bg-cyan-400 opacity-60" />
                <div className="w-8 h-8 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shadow-[0_0_16px_#38bdf8] ring-2 ring-slate-900 group-hover:scale-125 transition-transform">
                  <Radio className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-1 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-cyan-500/40 text-center shadow-xl">
                <span className="text-[11px] font-bold text-white block">Gauge S-001</span>
                <span className="text-[10px] font-mono text-cyan-400 block font-bold">
                  {simulatedWaterLevel} m
                </span>
              </div>
            </div>
          )}

          {/* Marker S-004: Tributary Khad */}
          {showSensors && (
            <div
              id="pin-sensor-s004"
              onClick={() =>
                setSelectedPin({
                  id: "S-004",
                  name: "Ashwani Khad Tributary Gauge S-004",
                  type: "sensor",
                  details: "Catchment runoff acoustic sensor detecting bedload sediment & velocity.",
                  level: "1.12m",
                  elevation: "1,520m MSL",
                  status: "Nominal",
                })
              }
              className="absolute top-[38%] left-[28%] -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 group"
            >
              <div className="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shadow-[0_0_10px_#38bdf8] group-hover:scale-125 transition-transform">
                <Radio className="w-3 h-3" />
              </div>
              <div className="mt-1 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700 text-[10px] font-mono text-cyan-300 text-center">
                S-004
              </div>
            </div>
          )}

          {/* Shelter 1: Govt Community Center Solan */}
          {showShelters && (
            <div
              id="pin-shelter-primary"
              onClick={() =>
                setSelectedPin({
                  id: "SH-01",
                  name: "Govt Model High School Solan",
                  type: "shelter",
                  details:
                    "Designated High-Altitude Safe Shelter. Equipped with 600 person beds, medical bay, and solar sat-com.",
                  elevation: "1,525m MSL (+45m above flood line)",
                  status: "OPEN (450/600 Occupied)",
                })
              }
              className="absolute top-[32%] right-[28%] -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 group"
            >
              <div className="relative flex items-center justify-center">
                <div className="w-9 h-9 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.6)] ring-2 ring-slate-900 group-hover:scale-125 transition-transform">
                  <Building className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-1 bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-lg text-center">
                Shelter 1 (Safe Haven)
              </div>
            </div>
          )}

          {/* User Marker */}
          <div className="absolute top-[48%] left-[37%] -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
            <div className="relative flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-amber-400 opacity-60" />
              <div className="w-5 h-5 rounded-full bg-amber-400 border-2 border-white shadow-[0_0_12px_#fbbf24] flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-slate-950" />
              </div>
            </div>
            <span className="mt-1 px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[9px] font-bold block text-center">
              YOU ARE HERE
            </span>
          </div>

          {/* Right Floating Viewport Zoom & Compass Controls */}
          <div className="absolute right-4 bottom-24 z-20 flex flex-col items-center gap-2 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700/80 shadow-xl">
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.6, z + 0.15))}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.15))}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setZoomLevel(1);
                setPitch(45);
              }}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Reset 3D camera"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <div className="h-px w-6 bg-slate-700" />
            {/* Pitch toggles */}
            <button
              onClick={() => setPitch((p) => (p === 30 ? 45 : p === 45 ? 60 : 30))}
              className="px-2 py-1 rounded-lg text-[10px] font-mono text-cyan-400 hover:bg-slate-800 font-bold"
              title="Toggle camera angle"
            >
              {pitch}°
            </button>
          </div>
        </div>

        {/* Bottom Simulation Control Tray */}
        <div className="p-4 sm:p-5 bg-slate-900 border-t border-slate-800 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Play/Pause & Speed Buttons */}
            <div className="flex items-center gap-3">
              <button
                id="sim-play-btn"
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md ${
                  isPlaying
                    ? "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20"
                    : "bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-600/25"
                }`}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{isPlaying ? "Pause Sim" : "Play Flood Sim"}</span>
              </button>

              <div className="flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700">
                <button
                  onClick={() => setSpeed(1)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-colors ${
                    speed === 1 ? "bg-cyan-500/20 text-cyan-400" : "text-slate-400"
                  }`}
                >
                  1x
                </button>
                <button
                  onClick={() => setSpeed(2)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-colors ${
                    speed === 2 ? "bg-cyan-500/20 text-cyan-400" : "text-slate-400"
                  }`}
                >
                  2x
                </button>
                <button
                  onClick={() => setSpeed(5)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-colors ${
                    speed === 5 ? "bg-cyan-500/20 text-cyan-400" : "text-slate-400"
                  }`}
                >
                  5x
                </button>
              </div>

              {/* Rain Particle Selector */}
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 rounded-xl border border-slate-700 text-xs">
                <CloudRain className="w-4 h-4 text-cyan-400" />
                <span className="text-slate-400">Precipitation:</span>
                <select
                  value={rainIntensity}
                  onChange={(e) => setRainIntensity(e.target.value as any)}
                  className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
                >
                  <option value="none" className="bg-slate-900 text-white">None (Clear)</option>
                  <option value="light" className="bg-slate-900 text-white">Light Rain</option>
                  <option value="torrential" className="bg-slate-900 text-white">Cloudburst (Torrential)</option>
                </select>
              </div>
            </div>

            {/* Stepped Timeline Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {timelineLabels.map((item, idx) => (
                <button
                  key={item.label}
                  onClick={() => setTimelineStep(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all border ${
                    timelineStep === idx
                      ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md"
                      : "bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white"
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Stepped Timeline Track Bar */}
          <div className="space-y-1.5">
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden relative">
              <div
                className="bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-600 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${((timelineStep + 1) / 4) * 100}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>T-0: Normal Stream Baseline</span>
              <span>+2h: Catchment Surge</span>
              <span>+4h: Embankment Breach</span>
              <span className="text-rose-400 font-bold">+6h: Peak Threat Horizon</span>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Selected Node Details Card & Tactical Legend */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Node Details (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                <Info className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Inspected Object Telemetry</h3>
            </div>
            {selectedPin?.status && (
              <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                {selectedPin.status}
              </span>
            )}
          </div>

          {selectedPin ? (
            <div className="space-y-3 pt-2">
              <h4 className="text-lg font-bold text-white">{selectedPin.name}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{selectedPin.details}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                {selectedPin.level && (
                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Water Level</span>
                    <span className="text-sm font-bold text-cyan-400 font-mono mt-1 block">
                      {selectedPin.level}
                    </span>
                  </div>
                )}
                {selectedPin.elevation && (
                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Elevation</span>
                    <span className="text-sm font-bold text-white font-mono mt-1 block">
                      {selectedPin.elevation}
                    </span>
                  </div>
                )}
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Relay Health</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono mt-1 block">
                    99.8% LoRa Link
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400">Click any sensor or shelter icon in the 3D map above to inspect live telemetry.</p>
          )}
        </div>

        {/* Tactical Legend & Hazard Buffers (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Hazard Level Legend</span>
          </h3>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#22c55e]" />
                <span className="font-semibold text-slate-200">Safe High Ground</span>
              </div>
              <span className="text-slate-400 font-mono">&gt; +25m elevation clearance</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" />
                <span className="font-semibold text-slate-200">Cautionary Inundation Fringe</span>
              </div>
              <span className="text-slate-400 font-mono">+5m to +15m river margin</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-full bg-rose-500 shadow-[0_0_8px_#ef4444]" />
                <span className="font-semibold text-slate-200">Immediate Flood Surge Zone</span>
              </div>
              <span className="text-rose-400 font-mono font-bold">Impassable &lt; +5m</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
