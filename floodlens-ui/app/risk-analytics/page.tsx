"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Activity,
  Cpu,
  TrendingUp,
  Droplet,
  Layers,
  ArrowRight,
  ShieldAlert,
  Download,
  Info,
  Sliders,
  CheckCircle2,
} from "lucide-react";

export default function RiskAnalyticsPage() {
  const [rainRate, setRainRate] = useState<number>(35); // mm/h
  const [soilSaturation, setSoilSaturation] = useState<number>(75); // %
  const [upstreamRelease, setUpstreamRelease] = useState<number>(120); // m3/s

  // Dynamic ML simulated risk score calculation based on Ensemble formula
  // Risk = LSTM(40%) + XGBoost(30%) + GNN(20%) + PINN(10%)
  const lstmScore = Math.min(Math.round((rainRate / 60) * 85), 100);
  const xgboostScore = Math.min(Math.round((soilSaturation / 100) * 80 + (upstreamRelease / 200) * 20), 100);
  const gnnScore = Math.min(Math.round((upstreamRelease / 250) * 90), 100);
  const pinnScore = Math.min(Math.round(((rainRate * 0.5 + soilSaturation * 0.5) / 80) * 95), 100);

  const compositeRisk = Math.round(
    lstmScore * 0.4 + xgboostScore * 0.3 + gnnScore * 0.2 + pinnScore * 0.1
  );

  const predictedStage = (1.4 + (compositeRisk / 100) * 2.8).toFixed(2);
  const leadTimeHours = compositeRisk > 80 ? "1.5 hrs" : compositeRisk > 60 ? "4.0 hrs" : "12.0 hrs";

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <span className="uppercase tracking-wider">Hydrological Intelligence Suite</span>
            <span className="text-slate-600">•</span>
            <span>Ensemble Architecture v2.1</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Predictive Risk &amp; Ensemble Analytics
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin-dashboard"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition"
          >
            <span>← Back to Command</span>
          </Link>
        </div>
      </div>

      {/* Ensemble Model Weight Architecture Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Model 1: LSTM */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold">
              WEIGHT: 40%
            </span>
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">LSTM Temporal Forecaster</h3>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Bi-directional recurrent cells capturing time-lagged upstream rainfall momentum.
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Component Output:</span>
            <span className="text-cyan-400 font-bold">{lstmScore}/100</span>
          </div>
        </div>

        {/* Model 2: XGBoost */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
              WEIGHT: 30%
            </span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">XGBoost Residual Engine</h3>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Gradient-boosted decision trees correcting non-linear terrain slope roughness.
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Component Output:</span>
            <span className="text-emerald-400 font-bold">{xgboostScore}/100</span>
          </div>
        </div>

        {/* Model 3: GNN */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold">
              WEIGHT: 20%
            </span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">GNN Catchment Topology</h3>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Graph neural network modeling directional flow across 18 sub-basin terrain nodes.
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Component Output:</span>
            <span className="text-amber-400 font-bold">{gnnScore}/100</span>
          </div>
        </div>

        {/* Model 4: PINN */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono text-[10px] font-bold">
              WEIGHT: 10%
            </span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">PINN Hydraulic Conservation</h3>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Saint-Venant 1D shallow water PDE loss functions preventing unphysical anomalies.
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Component Output:</span>
            <span className="text-rose-400 font-bold">{pinnScore}/100</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Stage: Hydrograph Curve & Scenario Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: River Hydrograph Stage Curve (7 Cols) */}
        <div className="lg:col-span-7 rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span>Khad River Basin Hydrograph (36-Hour Window)</span>
              </h2>
              <p className="text-xs text-slate-400">
                Recorded historical stage vs. 12-hour predictive ensemble confidence band
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-mono font-bold self-start sm:self-auto">
              PREDICTED CREST: {predictedStage}m
            </span>
          </div>

          {/* SVG Hydrograph Display */}
          <div className="relative w-full h-72 sm:h-80 rounded-2xl bg-[#080d19] border border-slate-800 p-3 overflow-hidden">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 800 400">
              {/* Grid Lines */}
              <line x1="60" y1="50" x2="780" y2="50" stroke="#1e293b" strokeDasharray="3,3" />
              <line x1="60" y1="130" x2="780" y2="130" stroke="#1e293b" strokeDasharray="3,3" />
              <line x1="60" y1="210" x2="780" y2="210" stroke="#1e293b" strokeDasharray="3,3" />
              <line x1="60" y1="290" x2="780" y2="290" stroke="#1e293b" strokeDasharray="3,3" />

              {/* Danger Mark Level (3.5m) */}
              <line x1="60" y1="80" x2="780" y2="80" stroke="#ef4444" strokeWidth="2" strokeDasharray="6,4" />
              <text x="630" y="72" fill="#ef4444" fontSize="11" fontFamily="monospace" fontWeight="bold">
                HIGH DANGER CREST (3.50m)
              </text>

              {/* Warning Level (2.5m) */}
              <line x1="60" y1="160" x2="780" y2="160" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4,4" />
              <text x="650" y="152" fill="#f59e0b" fontSize="10" fontFamily="monospace">
                WARNING THRESHOLD (2.50m)
              </text>

              {/* Present Time Boundary Vertical */}
              <line x1="480" y1="30" x2="480" y2="350" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4,4" />
              <text x="440" y="365" fill="#38bdf8" fontSize="11" fontFamily="monospace" fontWeight="bold">
                NOW (T=0)
              </text>

              {/* 95% Confidence Forecast Fan Area */}
              <polygon
                points="480,180 580,120 680,85 780,70 780,140 680,150 580,200 480,180"
                fill="rgba(56, 189, 248, 0.15)"
              />

              {/* Historical Curve (Solid Green -> Amber) */}
              <path
                d="M 60,320 C 150,310 240,290 320,260 C 380,230 430,205 480,180"
                fill="none"
                stroke="#22c55e"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Ensemble Forecasted Curve (Dashed Cyan) */}
              <path
                d="M 480,180 C 540,150 620,110 700,92 C 740,84 780,80 780,80"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="3.5"
                strokeDasharray="6,6"
                strokeLinecap="round"
              />

              {/* Data points */}
              <circle cx="480" cy="180" r="5" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />
              <circle cx="700" cy="92" r="5" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
            </svg>

            {/* Stage Callout */}
            <div className="absolute top-4 left-4 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 backdrop-blur-md text-xs">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">
                Current Sensor Reading
              </span>
              <span className="font-mono text-base font-black text-white">2.84 m</span>
              <span className="text-[10px] text-amber-400 block font-mono">
                Predicted Peak: {predictedStage}m in {leadTimeHours}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-1">
            <span>-24 Hours (Historical)</span>
            <span className="text-cyan-400 font-bold">Now (Sensor Station 04)</span>
            <span className="text-rose-400 font-bold">+12 Hours (Forecast Horizon)</span>
          </div>
        </div>

        {/* Right: Live Scenario Simulator (5 Cols) */}
        <div className="lg:col-span-5 rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Ensemble Stress Simulator</h2>
              <p className="text-xs text-slate-400">
                Simulate flash runoff thresholds under extreme mountain precipitation
              </p>
            </div>
          </div>

          {/* Sliders */}
          <div className="space-y-4 text-xs">
            {/* Slider 1: Rainfall rate */}
            <div>
              <div className="flex items-center justify-between mb-1.5 font-medium">
                <span className="text-slate-300">Peak Catchment Rainfall</span>
                <span className="text-cyan-400 font-mono font-bold">{rainRate} mm/h</span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                value={rainRate}
                onChange={(e) => setRainRate(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                <span>0 mm (Drizzle)</span>
                <span>40 mm (Cloudburst)</span>
                <span>80 mm (Extreme Catastrophe)</span>
              </div>
            </div>

            {/* Slider 2: Soil Saturation */}
            <div>
              <div className="flex items-center justify-between mb-1.5 font-medium">
                <span className="text-slate-300">Basin Soil Saturation Index</span>
                <span className="text-emerald-400 font-mono font-bold">{soilSaturation} %</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                value={soilSaturation}
                onChange={(e) => setSoilSaturation(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                <span>20% (Dry Substrata)</span>
                <span>65% (Moist)</span>
                <span>100% (Complete Liquefaction)</span>
              </div>
            </div>

            {/* Slider 3: Upstream Dam / Weir release */}
            <div>
              <div className="flex items-center justify-between mb-1.5 font-medium">
                <span className="text-slate-300">Upstream Weir Influx</span>
                <span className="text-amber-400 font-mono font-bold">{upstreamRelease} m³/s</span>
              </div>
              <input
                type="range"
                min="20"
                max="300"
                value={upstreamRelease}
                onChange={(e) => setUpstreamRelease(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                <span>20 m³/s (Normal)</span>
                <span>150 m³/s (High Inflow)</span>
                <span>300 m³/s (Gate Sluice Open)</span>
              </div>
            </div>
          </div>

          {/* Simulator Result Output Box */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              compositeRisk >= 75
                ? "bg-rose-950/40 border-rose-500/50"
                : compositeRisk >= 50
                ? "bg-amber-950/40 border-amber-500/50"
                : "bg-emerald-950/40 border-emerald-500/50"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                Simulated AI Risk Outcome
              </span>
              <span
                className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                  compositeRisk >= 75
                    ? "bg-rose-500 text-white"
                    : compositeRisk >= 50
                    ? "bg-amber-500 text-slate-950"
                    : "bg-emerald-500 text-slate-950"
                }`}
              >
                {compositeRisk >= 75 ? "FLASH EVACUATION" : compositeRisk >= 50 ? "WARNING WATCH" : "SAFE MONITOR"}
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-black font-mono text-white">{compositeRisk}</span>
              <span className="text-xs text-slate-300 font-mono">/ 100 Index</span>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800 text-xs">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase block">
                  Simulated Crest
                </span>
                <span className="font-mono font-bold text-white mt-0.5 block">
                  {predictedStage} m MSL
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase block">
                  Action Lead Time
                </span>
                <span className="font-mono font-bold text-cyan-400 mt-0.5 block">
                  {leadTimeHours}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 text-[11px] text-slate-400 leading-relaxed">
            💡 <strong>PINN Hydrological Law:</strong> When soil saturation surpasses 80%, catchment runoff coefficient scales from 0.35 to 0.88, causing rapid overland surges without ground absorption.
          </div>
        </div>
      </div>
    </div>
  );
}
