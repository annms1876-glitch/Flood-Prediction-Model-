"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import {
  MapPin,
  CloudSun,
  Droplets,
  Wind,
  Compass,
  ArrowRight,
  ShieldAlert,
  Radio,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  Maximize2,
  Waves,
  Sparkles,
  Activity,
  BatteryCharging,
  BriefcaseMedical,
  Building,
} from "lucide-react";

export default function VillagerDashboard() {
  const { user, profile } = useAuth();
  const userName = profile?.name || user?.displayName?.split(" ")[0] || "Rajesh";
  const userVillage = profile?.location || "Solan, Himachal Pradesh";

  const [activeMarkerModal, setActiveMarkerModal] = useState<string | null>(null);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto space-y-6">
      {/* Welcome Banner & Top Telemetry */}
      <div
        id="villager-welcome-banner"
        className="relative overflow-hidden rounded-2xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-2xl"
      >
        <div className="absolute -right-16 -top-16 w-96 h-96 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 bottom-0 w-64 h-64 rounded-full bg-amber-500/5 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-cyan-400 text-xs font-mono tracking-wider uppercase">
              <MapPin className="w-3.5 h-3.5" />
              <span>Your village: {userVillage}</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400 font-normal lowercase">elev. 1,550m</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Welcome back, <span className="text-cyan-400">{userName}!</span>
            </h1>

            {/* Weather Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700/60 text-white font-semibold">
                <CloudSun className="w-4 h-4 text-amber-400" />
                <span>24°C</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700/60 text-slate-300">
                <Droplets className="w-4 h-4 text-cyan-400" />
                <span>65% humidity</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700/60 text-slate-300">
                <Wind className="w-4 h-4 text-slate-400" />
                <span>12 km/h SSW</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700/60 text-slate-300">
                <Compass className="w-4 h-4 text-cyan-300" />
                <span>Barometer 1013 hPa</span>
              </div>
            </div>
          </div>

          {/* Risk Gauge Tile */}
          <div className="flex items-center gap-5 p-4 sm:p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 self-start lg:self-center shrink-0 shadow-lg">
            <div className="relative flex items-center justify-center w-24 h-24">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 96 96">
                <circle
                  className="text-slate-800 fill-none"
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                />
                <circle
                  className="text-emerald-400 fill-none transition-all duration-1000 ease-out"
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeDasharray="251.2"
                  strokeDashoffset="221"
                  strokeLinecap="round"
                  strokeWidth="8"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center font-mono">
                <span className="text-2xl font-black text-emerald-400 leading-none">12</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">/100</span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                </span>
                <span className="text-xs font-bold text-emerald-400 tracking-wider">STATUS: NORMAL</span>
              </div>
              <p className="text-xs text-slate-400 max-w-[190px] leading-relaxed">
                Hydrological flood index nominal in Giri-Ashwani catchments.
              </p>
              <span className="text-[10px] text-slate-500 font-mono mt-1">NEXT SWEEP: 04m 12s</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4-Column Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: View Map */}
        <Link
          id="quick-action-map"
          href="/3d-map-view"
          className="group p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-800/80 transition-all duration-200 transform hover:-translate-y-1 shadow-lg flex flex-col justify-between"
        >
          <div>
            <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors flex items-center gap-1.5">
              View Map
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Full 3D terrain, elevation contours &amp; active river gauges.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-cyan-400 font-mono">
            <span className="tracking-wider uppercase font-semibold">Live GIS View</span>
            <span>FPS: 60</span>
          </div>
        </Link>

        {/* Card 2: Evacuate */}
        <Link
          id="quick-action-evacuate"
          href="/evacuation-routes"
          className="group p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-800/80 transition-all duration-200 transform hover:-translate-y-1 shadow-lg flex flex-col justify-between"
        >
          <div>
            <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Radio className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors flex items-center gap-1.5">
              Evacuate
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Safe upland corridors, high-ground shelters &amp; road status.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-cyan-400 font-mono">
            <span className="tracking-wider uppercase font-semibold">3 Clear Routes</span>
            <span>1.2 km</span>
          </div>
        </Link>

        {/* Card 3: SOS Urgent */}
        <Link
          id="quick-action-sos"
          href="/sos-emergency"
          className="group p-5 rounded-2xl bg-slate-900 border border-rose-500/40 hover:border-rose-500/60 hover:bg-slate-800/80 transition-all duration-200 transform hover:-translate-y-1 shadow-[0_0_20px_rgba(244,67,54,0.25)] relative overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 via-transparent to-transparent opacity-70 pointer-events-none" />
          <div className="relative z-10">
            <div className="w-11 h-11 rounded-xl bg-rose-600 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-rose-600/30">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-rose-400 group-hover:text-rose-300 transition-colors">
                SOS Urgent
              </h3>
              <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono text-[9px] font-bold uppercase">
                1-TAP
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Instant SDRF beacon dispatch with auto-GPS telemetry.
            </p>
          </div>
          <div className="relative z-10 mt-4 pt-3 border-t border-rose-500/20 flex items-center justify-between text-xs text-rose-300 font-mono">
            <span className="tracking-wider uppercase font-bold">Emergency Ping</span>
            <span className="animate-pulse flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> READY
            </span>
          </div>
        </Link>

        {/* Card 4: Safety Tips */}
        <Link
          id="quick-action-safety"
          href="/safety-tips"
          className="group p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-800/80 transition-all duration-200 transform hover:-translate-y-1 shadow-lg flex flex-col justify-between"
        >
          <div>
            <div className="w-11 h-11 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FileCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors flex items-center gap-1.5">
              Safety Tips
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Checklists, 72-hour survival kits &amp; hill-torrent protocols.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="tracking-wider uppercase font-semibold">NDMA Guides</span>
            <span>8 Steps</span>
          </div>
        </Link>
      </div>

      {/* Interactive 3D Topography Preview */}
      <div
        id="topography-preview-container"
        className="rounded-2xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-2xl space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Waves className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Interactive 3D Topography Preview</h2>
              <p className="text-xs text-slate-400">Solan Valley Catchment Basin • Sensor Grid Beta-4</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ALL CLEAR (SOLAN BASIN)
            </div>
            <Link
              href="/3d-map-view"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors inline-flex items-center gap-1.5"
            >
              <span>Expand 3D</span>
              <Maximize2 className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Map Viewport Canvas (SVG Graphic) */}
        <div className="relative w-full h-80 sm:h-96 rounded-xl overflow-hidden bg-[#070b14] border border-slate-800/80">
          <svg className="absolute inset-0 w-full h-full opacity-40" preserveAspectRatio="none" viewBox="0 0 1000 500">
            <defs>
              <linearGradient id="streamGrad" x1="0%" x2="100%" y1="0%" y2="100%">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#38bdf8" stopOpacity="1" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.6" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {/* Elevation lines */}
            <path d="M-50,120 Q 200,80 450,150 T 950,90 T 1100,160" fill="none" stroke="#334155" strokeDasharray="4,6" strokeWidth="1" />
            <path d="M-50,200 Q 220,160 480,240 T 880,180 T 1100,230" fill="none" stroke="#475569" strokeWidth="1.2" />
            <path d="M-50,280 Q 240,240 510,320 T 910,260 T 1100,310" fill="none" stroke="#334155" strokeDasharray="4,6" strokeWidth="1" />
            <path d="M-50,370 Q 260,330 540,410 T 940,350 T 1100,400" fill="none" stroke="#334155" strokeWidth="1" />
            {/* Mountain massifs */}
            <polygon points="120,420 220,180 320,420" fill="#1e293b" opacity="0.35" />
            <polygon points="620,450 780,140 920,450" fill="#1e293b" opacity="0.4" />
            <polygon points="360,460 480,210 610,460" fill="#1e293b" opacity="0.25" />
            {/* Simulated River Torrent Arteries */}
            <path d="M 0,260 C 220,290 310,190 520,220 C 710,250 820,380 1000,410" fill="none" stroke="url(#streamGrad)" strokeWidth="6" filter="url(#glow)" />
            <path d="M 310,190 C 370,120 460,90 520,70" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="6,4" opacity="0.75" />
            <path d="M 520,220 C 580,310 620,360 670,430" fill="none" stroke="#0ea5e9" strokeWidth="3" opacity="0.8" />
          </svg>

          {/* Marker 1: River Sensor Station RS-01 */}
          <div
            id="marker-rs01"
            onClick={() => setActiveMarkerModal("Gauge RS-01 (Solan Bridge): Level 2.14m [Nominal, Buffer +2.86m above datum]")}
            className="absolute top-1/2 left-[52%] -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
          >
            <div className="relative flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-12 w-12 rounded-full bg-cyan-500 opacity-30" />
              <span className="animate-pulse absolute inline-flex h-8 w-8 rounded-full bg-cyan-500/40" />
              <div className="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shadow-[0_0_12px_#38bdf8] ring-2 ring-slate-900">
                <Radio className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700 shadow-xl pointer-events-none group-hover:scale-105 transition-transform text-center">
              <span className="text-xs text-cyan-400 font-bold block">Giri Gauge RS-01</span>
              <span className="font-mono text-[10px] text-slate-400 block">2.14m • Flow: 18 m³/s</span>
            </div>
          </div>

          {/* Marker 2: RS-02 */}
          <div
            id="marker-rs02"
            onClick={() => setActiveMarkerModal("Gauge RS-02 (Ashwani Khad Tributary): Level 1.05m [Nominal, Buffer +1.95m]")}
            className="absolute top-1/4 left-[34%] -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
          >
            <div className="relative flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-cyan-500 opacity-20" />
              <div className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shadow-[0_0_8px_#38bdf8]">
                <Radio className="w-3 h-3" />
              </div>
            </div>
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/90 px-2 py-0.5 rounded border border-slate-700 shadow text-[10px] text-cyan-300 font-mono">
              Ashwani Khad RS-02
            </div>
          </div>

          {/* Shelter Marker 1: Solan Community Center */}
          <div
            id="marker-shelter-1"
            onClick={() => setActiveMarkerModal("Shelter 1: Solan Community Center. Capacity: 350 beds. Backup power & RO water intact. Elevation +45m.")}
            className="absolute top-1/3 right-[22%] -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-[0_0_14px_rgba(34,197,94,0.6)] group-hover:scale-110 transition-transform">
              <Building className="w-4 h-4" />
            </div>
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 px-2.5 py-0.5 rounded-lg text-xs font-bold shadow-lg">
              ✓ Shelter 1: Community Center (1.2 km)
            </div>
          </div>

          {/* Shelter Marker 2: College Hill */}
          <div
            id="marker-shelter-2"
            onClick={() => setActiveMarkerModal("Shelter 2: Govt Degree College Ground. Altitude 1,620m MSL (+90m Clearance).")}
            className="absolute bottom-1/4 left-[18%] -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
          >
            <div className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-[0_0_10px_rgba(34,197,94,0.4)] group-hover:scale-110 transition-transform">
              <Building className="w-3.5 h-3.5" />
            </div>
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-emerald-950/90 border border-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded text-[10px] font-mono">
              Shelter 2: College Hill
            </div>
          </div>

          {/* Bottom HUD overlay */}
          <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-800">
            <div className="flex items-center gap-4 text-slate-400 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <span>Active IoT Gauges (6/6)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span>Designated Shelters (4)</span>
              </div>
              <div className="hidden md:flex items-center gap-1.5">
                <span className="w-4 h-1 bg-sky-400 rounded-full" />
                <span>Simulated Runoff Path</span>
              </div>
            </div>
            <div className="font-mono text-xs text-cyan-400 flex items-center gap-1">
              <span>GRID: 30.9045° N, 77.0967° E</span>
            </div>
          </div>
        </div>

        {activeMarkerModal && (
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-xs text-cyan-300 flex items-center justify-between">
            <span>{activeMarkerModal}</span>
            <button
              onClick={() => setActiveMarkerModal(null)}
              className="text-slate-400 hover:text-white ml-2 text-sm font-bold"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Two-Column Live Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Column 1: Recent Alerts (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-bold text-white">Recent Hydro &amp; Basin Alerts</h2>
              </div>
              <span className="text-xs text-slate-400 uppercase tracking-wider font-mono">
                Solan District Feed
              </span>
            </div>

            <div className="space-y-3">
              {/* Alert 1 */}
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3.5 shadow-sm">
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase font-mono">
                        Watch Alert
                      </span>
                      <span className="text-xs font-semibold text-white">Beas &amp; Giri Basin Tributaries</span>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">Today, 2:30 PM</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Water inflow momentarily elevated (<span className="text-amber-400 font-mono font-semibold">+0.4m/hr</span>) following upstream cloudburst in upper ridgeline. Embankment buffer remains at 2.8m above nominal.
                  </p>
                </div>
              </div>

              {/* Alert 2 */}
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3.5 shadow-sm">
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase font-mono">
                        Clear
                      </span>
                      <span className="text-xs font-semibold text-white">Morning Catchment Runoff Normal</span>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">Today, 8:00 AM</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Drainage flow along Solan bypass culverts and Ashwani stream stabilized. Water clarity index returning to baseline.
                  </p>
                </div>
              </div>

              {/* Alert 3 */}
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3.5 shadow-sm">
                <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0 mt-0.5">
                  <Radio className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-bold uppercase font-mono">
                        Calibrated
                      </span>
                      <span className="text-xs font-semibold text-white">All 6 Regional Sensors Validated</span>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">Yesterday, 6:15 PM</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Piezoelectric water-level transducers and LoRaWAN mesh relay telemetry checked without drift.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800">
            <span>Automated dispatch rules enabled</span>
            <Link href="/alert-management" className="text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 font-semibold">
              <span>View 30-Day Archive</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Column 2: Live Basin Telemetry (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white">Live Basin Telemetry</h2>
            </div>
            <span className="text-xs text-emerald-400 font-mono font-semibold">STABLE</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Metric 1 */}
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Atmospheric</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-xl font-bold text-white font-mono">24°C</span>
                <span className="text-xs text-slate-400 font-mono">65% RH</span>
              </div>
              <div className="mt-2 w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-400 h-full rounded-full" style={{ width: "48%" }} />
              </div>
              <span className="text-[10px] text-slate-500 mt-1.5 block">Dew point: 17°C</span>
            </div>

            {/* Metric 2 */}
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Precipitation (3h)</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-xl font-bold text-cyan-400 font-mono">0.5</span>
                <span className="text-xs text-slate-400 font-mono">mm</span>
              </div>
              <div className="mt-2 w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div className="bg-cyan-400 h-full rounded-full" style={{ width: "14%" }} />
              </div>
              <span className="text-[10px] text-slate-500 mt-1.5 block">Light drizzle probable</span>
            </div>

            {/* Metric 3 */}
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Soil Saturation</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-xl font-bold text-emerald-400 font-mono">42%</span>
                <span className="text-[10px] text-emerald-300 font-mono">POROUS</span>
              </div>
              <div className="mt-2 w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-full rounded-full" style={{ width: "42%" }} />
              </div>
              <span className="text-[10px] text-slate-500 mt-1.5 block">Threshold warning at 78%</span>
            </div>

            {/* Metric 4 */}
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Catchment Outflow</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-xl font-bold text-white font-mono">18.2</span>
                <span className="text-xs text-slate-400 font-mono">m³/s</span>
              </div>
              <div className="mt-2 w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div className="bg-cyan-400 h-full rounded-full" style={{ width: "28%" }} />
              </div>
              <span className="text-[10px] text-slate-500 mt-1.5 block">Culverts flowing clear</span>
            </div>
          </div>

          {/* Sparkline Curve */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>24h Water Level Trend (Solan Bridge)</span>
              <span className="font-mono text-cyan-400 font-bold">2.14 m</span>
            </div>
            <div className="h-14 w-full pt-1">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 300 60">
                <line x1="0" y1="15" x2="300" y2="15" stroke="#ef4444" strokeDasharray="3,3" strokeWidth="1" opacity="0.5" />
                <text x="240" y="11" fill="#ef4444" fontSize="7" fontFamily="monospace">SURGE 5.0m</text>
                <path d="M 0,48 Q 40,46 80,47 T 160,40 T 210,32 T 260,38 T 300,36" fill="none" stroke="#38bdf8" strokeWidth="2.5" />
                <path d="M 0,48 Q 40,46 80,47 T 160,40 T 210,32 T 260,38 T 300,36 L 300,60 L 0,60 Z" fill="rgba(14,165,233,0.15)" />
                <circle cx="300" cy="36" r="3" fill="#89ceff" />
              </svg>
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>Yesterday 17:00</span>
              <span>05:00</span>
              <span className="text-cyan-400">Now (Nominal)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Household Readiness Checklist */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-lg font-bold text-white">Household Readiness Checklist</h2>
              <p className="text-xs text-slate-400">Recommended monsoon safety protocol for mountain settlements</p>
            </div>
          </div>
          <span className="text-xs text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full font-semibold font-mono self-start sm:self-center">
            3 of 3 Active Guidelines
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3 shadow-sm">
            <div className="mt-0.5 w-7 h-7 rounded-lg bg-cyan-500 text-slate-950 flex items-center justify-center shrink-0">
              <BatteryCharging className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Keep Devices Charged</h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Ensure your mobile phone and backup power bank remain above 80% charge during monsoon watches.
              </p>
              <span className="inline-block mt-2 text-[10px] text-cyan-400 font-mono font-bold">STATUS: CONFIRMED</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3 shadow-sm">
            <div className="mt-0.5 w-7 h-7 rounded-lg bg-cyan-500 text-slate-950 flex items-center justify-center shrink-0">
              <BriefcaseMedical className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Emergency Kit Prepped</h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Keep first aid supplies, dry rations, torchlight, and waterproof ID pouch placed by the main house exit.
              </p>
              <span className="inline-block mt-2 text-[10px] text-cyan-400 font-mono font-bold">PREPPED AT EXIT</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3 shadow-sm">
            <div className="mt-0.5 w-7 h-7 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Nearest Safe Shelter</h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                <strong className="text-white">Solan Community Center</strong> is 1.2 km away on elevated high ground. Open 24/7 with solar power.
              </p>
              <Link href="/evacuation-routes" className="inline-flex items-center gap-1 mt-2 text-xs text-emerald-400 font-bold hover:underline">
                <span>Navigate Route (8 min walk)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
