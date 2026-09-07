"use client";

import React, { useState } from "react";
import Link from "next/link";
import { GoogleMapsEvacuationMap } from "@/components/map/GoogleMapsEvacuationMap";
import {
  Route,
  Navigation,
  ArrowRight,
  ShieldCheck,
  AlertOctagon,
  Download,
  Share2,
  Clock,
  Compass,
  Building,
  TrendingUp,
  MapPin,
  CheckCircle2,
  ChevronRight,
  Radio,
} from "lucide-react";

interface RouteOption {
  id: "A" | "B" | "C";
  name: string;
  tag: string;
  tier: "recommended" | "alternative" | "hazardous";
  distance: string;
  duration: string;
  elevationGain: string;
  safetyScore: number;
  terrain: string;
  destination: string;
  destinationCap: string;
  steps: Array<{
    num: number;
    instruction: string;
    distance: string;
    caution?: string;
  }>;
}

export default function EvacuationRoutesPage() {
  const [selectedRouteId, setSelectedRouteId] = useState<"A" | "B" | "C">("A");
  const [isNavigating, setIsNavigating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const routes: Record<"A" | "B" | "C", RouteOption> = {
    A: {
      id: "A",
      name: "Upper Ridge Road",
      tag: "SAFEST & PAVED",
      tier: "recommended",
      distance: "2.3 km",
      duration: "18 min",
      elevationGain: "+45 m",
      safetyScore: 85,
      terrain: "Paved Macadam Surface • 100% High Ground",
      destination: "Govt Model High School Solan",
      destinationCap: "Capacity: 450 / 600 Beds Available",
      steps: [
        {
          num: 1,
          instruction: "Exit home and walk North onto Main Village Ridge Road.",
          distance: "500 m",
          caution: "Avoid downward alleyways towards lower water channel.",
        },
        {
          num: 2,
          instruction: "Turn left at the stone temple gate onto Upper High Road.",
          distance: "300 m",
          caution: "Steep +22m slope ascent. Assist elderly or young children.",
        },
        {
          num: 3,
          instruction: "Cross the reinforced stone Ridge Footbridge.",
          distance: "700 m",
          caution: "Bridge is 14m above maximum flash surge crest level.",
        },
        {
          num: 4,
          instruction: "Arrive at Govt Model High School evacuation relief gate.",
          distance: "800 m",
          caution: "Medical triage, dry rations, and district satellite phone in Block B.",
        },
      ],
    },
    B: {
      id: "B",
      name: "Temple Hill Trail",
      tag: "MAXIMUM ELEVATION",
      tier: "alternative",
      distance: "3.1 km",
      duration: "25 min",
      elevationGain: "+70 m",
      safetyScore: 92,
      terrain: "Boulder Alpine Path • Rugged Terrain",
      destination: "Govt Degree College Hill Ground",
      destinationCap: "Capacity: 320 / 500 Beds Available",
      steps: [
        {
          num: 1,
          instruction: "Ascend the stone staircase behind Shiva Temple.",
          distance: "400 m",
          caution: "Steep initial gradient, carry sturdy walking sticks.",
        },
        {
          num: 2,
          instruction: "Follow the marked pine ridge firebreak trail westbound.",
          distance: "1.8 km",
          caution: "Zero flood risk. Safe from any flash torrents.",
        },
        {
          num: 3,
          instruction: "Reach Degree College sports pavilion & staging helipad.",
          distance: "900 m",
          caution: "SDRF relief team stationed at main pavilion.",
        },
      ],
    },
    C: {
      id: "C",
      name: "Riverside Bypass (BLOCKED)",
      tag: "FLASH SURGE HAZARD",
      tier: "hazardous",
      distance: "1.8 km",
      duration: "12 min",
      elevationGain: "-15 m",
      safetyScore: 45,
      terrain: "Flooded Culvert • Severe Torrent Threat",
      destination: "Lower Bus Stand Depot",
      destinationCap: "CLOSED DUE TO RIVER INUNDATION",
      steps: [
        {
          num: 1,
          instruction: "DO NOT PROCEED. River level has overflowed embankment at km 0.6.",
          distance: "0 m",
          caution: "Water velocity 4.2 m/s capable of sweeping vehicles and pedestrians.",
        },
      ],
    },
  };

  const active = routes[selectedRouteId];

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 p-4 rounded-xl bg-cyan-600 text-white shadow-2xl flex items-center gap-3 border border-cyan-400/40 animate-slide-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Critical Directive Bar */}
      <div
        id="incident-directive-bar"
        className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg"
      >
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold uppercase">
                CRITICAL DIRECTIVE
              </span>
              <span className="text-xs text-slate-400">Issued by Solan Disaster Control</span>
            </div>
            <p className="text-xs text-slate-200 mt-1 leading-relaxed font-medium">
              Solan River Basin under flash surge watch. Follow designated high-elevation ridge corridors. Do NOT cross lower bridge culverts.
            </p>
          </div>
        </div>

        <Link
          href="/sos-emergency"
          className="self-start sm:self-center px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold whitespace-nowrap shadow-md shadow-rose-600/30"
        >
          SOS Request Assistance
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <span className="uppercase tracking-wider">High Ground Corridors</span>
            <span className="text-slate-600">•</span>
            <span>Origin: Solan Sector 4 (30.9049° N, 77.0936° E)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Evacuation Route System
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-bold">
              3 Routes Evaluated
            </span>
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => showToast("Offline PDF Map & Hindi/English Survival Instructions downloaded successfully.")}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <Download className="w-4 h-4" />
            <span>Download Offline PDF</span>
          </button>
          <button
            onClick={() => showToast("Emergency corridor coordinates dispatched to Family & Village Warden via SMS.")}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <Share2 className="w-4 h-4" />
            <span>Share SMS</span>
          </button>
        </div>
      </div>

      {/* 3-Column Route Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Route A Card */}
        <div
          id="route-card-A"
          onClick={() => setSelectedRouteId("A")}
          className={`cursor-pointer p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between shadow-xl ${
            selectedRouteId === "A"
              ? "bg-slate-900 border-cyan-500 ring-2 ring-cyan-500/20 shadow-cyan-500/10"
              : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold uppercase">
                {routes.A.tag}
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400">
                {routes.A.safetyScore}% Safe
              </span>
            </div>

            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>{routes.A.name}</span>
              {selectedRouteId === "A" && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">{routes.A.terrain}</p>

            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800 text-center">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Dist</span>
                <span className="text-xs font-bold text-white font-mono mt-0.5 block">{routes.A.distance}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Walk Time</span>
                <span className="text-xs font-bold text-cyan-400 font-mono mt-0.5 block">{routes.A.duration}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Ascent</span>
                <span className="text-xs font-bold text-emerald-400 font-mono mt-0.5 block">{routes.A.elevationGain}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span className="truncate max-w-[170px]">{routes.A.destination}</span>
            <span className="text-cyan-400 font-bold font-mono">SELECT →</span>
          </div>
        </div>

        {/* Route B Card */}
        <div
          id="route-card-B"
          onClick={() => setSelectedRouteId("B")}
          className={`cursor-pointer p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between shadow-xl ${
            selectedRouteId === "B"
              ? "bg-slate-900 border-cyan-500 ring-2 ring-cyan-500/20 shadow-cyan-500/10"
              : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold uppercase">
                {routes.B.tag}
              </span>
              <span className="text-xs font-mono font-bold text-cyan-400">
                {routes.B.safetyScore}% Safe
              </span>
            </div>

            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>{routes.B.name}</span>
              {selectedRouteId === "B" && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">{routes.B.terrain}</p>

            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800 text-center">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Dist</span>
                <span className="text-xs font-bold text-white font-mono mt-0.5 block">{routes.B.distance}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Walk Time</span>
                <span className="text-xs font-bold text-cyan-400 font-mono mt-0.5 block">{routes.B.duration}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Ascent</span>
                <span className="text-xs font-bold text-emerald-400 font-mono mt-0.5 block">{routes.B.elevationGain}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span className="truncate max-w-[170px]">{routes.B.destination}</span>
            <span className="text-cyan-400 font-bold font-mono">SELECT →</span>
          </div>
        </div>

        {/* Route C Card (Blocked) */}
        <div
          id="route-card-C"
          onClick={() => setSelectedRouteId("C")}
          className={`cursor-pointer p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between shadow-xl ${
            selectedRouteId === "C"
              ? "bg-slate-900 border-rose-500 ring-2 ring-rose-500/20"
              : "bg-slate-900/60 border-rose-500/30 hover:border-rose-500/50"
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 font-mono text-[10px] font-bold uppercase">
                {routes.C.tag}
              </span>
              <span className="text-xs font-mono font-bold text-rose-400">
                {routes.C.safetyScore}% DANGER
              </span>
            </div>

            <h3 className="text-lg font-bold text-rose-400 flex items-center gap-2">
              <span>{routes.C.name}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">{routes.C.terrain}</p>

            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800 text-center">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Dist</span>
                <span className="text-xs font-bold text-slate-400 font-mono mt-0.5 block">{routes.C.distance}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Status</span>
                <span className="text-xs font-bold text-rose-400 font-mono mt-0.5 block">BLOCKED</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Risk</span>
                <span className="text-xs font-bold text-rose-400 font-mono mt-0.5 block">DROWNING</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-rose-400 flex items-center justify-between">
            <span>DO NOT ATTEMPT</span>
            <span className="font-bold font-mono">AVOID ✕</span>
          </div>
        </div>
      </div>

      {/* Interactive Google Maps Platform 3D Evacuation & Sifter Engine */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Google Maps 3D Evacuation &amp; Hazard Radar</span>
                <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                  Solan Catchment
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Interactive 3D elevation corridor, resident house tracking, and flood hazard sifter
              </p>
            </div>
          </div>

          {/* Start GPS Button */}
          <button
            id="start-gps-nav-btn"
            onClick={() => {
              setIsNavigating(!isNavigating);
              showToast(
                !isNavigating
                  ? "Live GPS Navigation active! Tracking elevation and route compliance."
                  : "Navigation paused."
              );
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
              isNavigating
                ? "bg-amber-500 text-slate-950 shadow-amber-500/20"
                : "bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-600/25"
            }`}
          >
            <Compass className="w-4 h-4 animate-spin" />
            <span>{isNavigating ? "Pause Live GPS" : "Start Live GPS Navigation"}</span>
          </button>
        </div>

        {/* Embedded Google Maps Evacuation Map Component */}
        <GoogleMapsEvacuationMap initialRouteId={selectedRouteId} />

        {/* Elevation Profile Clearance Graph */}
        <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-white">Corridor Elevation Profile &amp; Flood Margin</span>
            </div>
            <span className="font-mono text-emerald-400 font-bold">+45m Safety Margin</span>
          </div>

          <div className="h-20 w-full pt-1">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 500 80">
              {/* High flood level line (Red) */}
              <line x1="0" y1="65" x2="500" y2="65" stroke="#ef4444" strokeDasharray="4,4" strokeWidth="1.5" />
              <text x="380" y="60" fill="#ef4444" fontSize="9" fontFamily="monospace">
                MAX FLOOD LEVEL (1,485m)
              </text>

              {/* Terrain elevation slope */}
              <path
                d="M 0,55 C 100,48 200,32 300,24 C 400,18 450,15 500,12 L 500,80 L 0,80 Z"
                fill="rgba(34,197,94,0.15)"
              />
              <path
                d="M 0,55 C 100,48 200,32 300,24 C 400,18 450,15 500,12"
                fill="none"
                stroke="#22c55e"
                strokeWidth="2.5"
              />
            </svg>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Start: 1,480m MSL</span>
            <span>Midpoint: 1,510m MSL</span>
            <span className="text-emerald-400 font-bold">Safe Shelter Gate: 1,525m MSL</span>
          </div>
        </div>

        {/* Turn-by-Turn Navigation Steps */}
        <div className="space-y-3 pt-2">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Route className="w-4 h-4 text-cyan-400" />
            <span>Turn-by-Turn Waypoint Directions ({active.steps.length} Steps)</span>
          </h3>

          <div className="space-y-2.5">
            {active.steps.map((step) => (
              <div
                key={step.num}
                className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3.5"
              >
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                  {step.num}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-white">{step.instruction}</p>
                    <span className="text-xs font-mono text-cyan-400 font-semibold shrink-0">
                      {step.distance}
                    </span>
                  </div>
                  {step.caution && (
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      💡 {step.caution}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
