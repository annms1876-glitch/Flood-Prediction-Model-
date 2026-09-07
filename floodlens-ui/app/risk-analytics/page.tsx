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
    <div className="risk-analytics-page mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#e89b01] mb-1">
            <span className="uppercase tracking-wider">Hydrological Intelligence Suite</span>
            <span className="text-[#8f897e]">•</span>
            <span>Ensemble Architecture v2.1</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#261b07] tracking-tight flex items-center gap-3">
            Predictive Risk &amp; Ensemble Analytics
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin-dashboard"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#e3dfd5] hover:bg-slate-700 text-[#261b07] text-xs font-bold border border-[#d5d2cd] transition"
          >
            <span>← Back to Command</span>
          </Link>
        </div>
      </div>

      {/* Ensemble Model Weight Architecture Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Model 1: LSTM */}
        <div className="p-5 rounded-2xl bg-white border border-[#e3dfd5] shadow-[0_4px_8px_rgba(38,27,7,.06)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full bg-[#f9a600]/20 text-[#e89b01] font-mono text-[10px] font-bold">
              WEIGHT: 40%
            </span>
            <Cpu className="w-4 h-4 text-[#e89b01]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#261b07]">LSTM Temporal Forecaster</h3>
            <p className="text-[11px] text-[#8f897e] mt-1 leading-relaxed">
              Bi-directional recurrent cells capturing time-lagged upstream rainfall momentum.
            </p>
          </div>
          <div className="pt-2 border-t border-[#e3dfd5] flex items-center justify-between text-xs font-mono">
            <span className="text-[#8f897e]">Component Output:</span>
            <span className="text-[#e89b01] font-bold">{lstmScore}/100</span>
          </div>
        </div>

        {/* Model 2: XGBoost */}
        <div className="p-5 rounded-2xl bg-white border border-[#e3dfd5] shadow-[0_4px_8px_rgba(38,27,7,.06)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full bg-[#6f8d54]/20 text-[#6f8d54] font-mono text-[10px] font-bold">
              WEIGHT: 30%
            </span>
            <Layers className="w-4 h-4 text-[#6f8d54]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#261b07]">XGBoost Residual Engine</h3>
            <p className="text-[11px] text-[#8f897e] mt-1 leading-relaxed">
              Gradient-boosted decision trees correcting non-linear terrain slope roughness.
            </p>
          </div>
          <div className="pt-2 border-t border-[#e3dfd5] flex items-center justify-between text-xs font-mono">
            <span className="text-[#8f897e]">Component Output:</span>
            <span className="text-[#6f8d54] font-bold">{xgboostScore}/100</span>
          </div>
        </div>

        {/* Model 3: GNN */}
        <div className="p-5 rounded-2xl bg-white border border-[#e3dfd5] shadow-[0_4px_8px_rgba(38,27,7,.06)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full bg-[#f9a600]/20 text-[#e89b01] font-mono text-[10px] font-bold">
              WEIGHT: 20%
            </span>
            <Activity className="w-4 h-4 text-[#e89b01]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#261b07]">GNN Catchment Topology</h3>
            <p className="text-[11px] text-[#8f897e] mt-1 leading-relaxed">
              Graph neural network modeling directional flow across 18 sub-basin terrain nodes.
            </p>
          </div>
          <div className="pt-2 border-t border-[#e3dfd5] flex items-center justify-between text-xs font-mono">
            <span className="text-[#8f897e]">Component Output:</span>
            <span className="text-[#e89b01] font-bold">{gnnScore}/100</span>
          </div>
        </div>

        {/* Model 4: PINN */}
        <div className="p-5 rounded-2xl bg-white border border-[#e3dfd5] shadow-[0_4px_8px_rgba(38,27,7,.06)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full bg-[#f0624f]/20 text-[#d94b3b] font-mono text-[10px] font-bold">
              WEIGHT: 10%
            </span>
            <ShieldAlert className="w-4 h-4 text-[#d94b3b]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#261b07]">PINN Hydraulic Conservation</h3>
            <p className="text-[11px] text-[#8f897e] mt-1 leading-relaxed">
              Saint-Venant 1D shallow water PDE loss functions preventing unphysical anomalies.
            </p>
          </div>
          <div className="pt-2 border-t border-[#e3dfd5] flex items-center justify-between text-xs font-mono">
            <span className="text-[#8f897e]">Component Output:</span>
            <span className="text-[#d94b3b] font-bold">{pinnScore}/100</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Stage: Hydrograph Curve & Scenario Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: River Hydrograph Stage Curve (7 Cols) */}
        <div className="lg:col-span-7 rounded-3xl bg-white border border-[#e3dfd5] p-6 shadow-[0_4px_8px_rgba(38,27,7,.06)] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-[#261b07] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#e89b01]" />
                <span>Khad River Basin Hydrograph (36-Hour Window)</span>
              </h2>
              <p className="text-xs text-[#8f897e]">
                Recorded historical stage vs. 12-hour predictive ensemble confidence band
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-[#f9a600]/10 text-[#e89b01] border border-[#e89b01]/20 text-[10px] font-mono font-bold self-start sm:self-auto">
              PREDICTED CREST: {predictedStage}m
            </span>
          </div>

          {/* SVG Hydrograph Display */}
          <div className="relative w-full h-72 sm:h-80 rounded-2xl bg-[#fffdf8] border border-[#e3dfd5] p-3 overflow-hidden">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 800 400">
              {/* Grid Lines */}
              <line x1="60" y1="50" x2="780" y2="50" stroke="#e3dfd5" strokeDasharray="3,3" />
              <line x1="60" y1="130" x2="780" y2="130" stroke="#1e293b" strokeDasharray="3,3" />
              <line x1="60" y1="210" x2="780" y2="210" stroke="#1e293b" strokeDasharray="3,3" />
              <line x1="60" y1="290" x2="780" y2="290" stroke="#1e293b" strokeDasharray="3,3" />

              {/* Danger Mark Level (3.5m) */}
              <line x1="60" y1="80" x2="780" y2="80" stroke="#f0624f" strokeWidth="2" strokeDasharray="6,4" />
              <text x="630" y="72" fill="#f0624f" fontSize="11" fontFamily="monospace" fontWeight="bold">
                HIGH DANGER CREST (3.50m)
              </text>

              {/* Warning Level (2.5m) */}
              <line x1="60" y1="160" x2="780" y2="160" stroke="#e89b01" strokeWidth="1.5" strokeDasharray="4,4" />
              <text x="650" y="152" fill="#f59e0b" fontSize="10" fontFamily="monospace">
                WARNING THRESHOLD (2.50m)
              </text>

              {/* Present Time Boundary Vertical */}
              <line x1="480" y1="30" x2="480" y2="350" stroke="#e89b01" strokeWidth="1.5" strokeDasharray="4,4" />
              <text x="440" y="365" fill="#f9a600" fontSize="11" fontFamily="monospace" fontWeight="bold">
                NOW (T=0)
              </text>

              {/* 95% Confidence Forecast Fan Area */}
              <polygon
                points="480,180 580,120 680,85 780,70 780,140 680,150 580,200 480,180"
                fill="rgba(249, 166, 0, 0.14)"
              />

              {/* Historical Curve (Solid Green -> Amber) */}
              <path
                d="M 60,320 C 150,310 240,290 320,260 C 380,230 430,205 480,180"
                fill="none"
                stroke="#6f8d54"
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
            <div className="absolute top-4 left-4 p-2.5 rounded-xl bg-white/90 border border-[#e3dfd5] backdrop-blur-md text-xs">
              <span className="text-[10px] font-mono text-[#8f897e] block uppercase">
                Current Sensor Reading
              </span>
              <span className="font-mono text-base font-black text-[#261b07]">2.84 m</span>
              <span className="text-[10px] text-[#e89b01] block font-mono">
                Predicted Peak: {predictedStage}m in {leadTimeHours}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-[#8f897e] font-mono pt-1">
            <span>-24 Hours (Historical)</span>
            <span className="text-[#e89b01] font-bold">Now (Sensor Station 04)</span>
            <span className="text-[#d94b3b] font-bold">+12 Hours (Forecast Horizon)</span>
          </div>
        </div>

        {/* Right: Live Scenario Simulator (5 Cols) */}
        <div className="lg:col-span-5 rounded-3xl bg-white border border-[#e3dfd5] p-6 shadow-[0_4px_8px_rgba(38,27,7,.06)] space-y-5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#f9a600]/20 text-[#e89b01]">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#261b07]">Ensemble Stress Simulator</h2>
              <p className="text-xs text-[#8f897e]">
                Simulate flash runoff thresholds under extreme mountain precipitation
              </p>
            </div>
          </div>

          {/* Sliders */}
          <div className="space-y-4 text-xs">
            {/* Slider 1: Rainfall rate */}
            <div>
              <div className="flex items-center justify-between mb-1.5 font-medium">
                <span className="text-[#61594a]">Peak Catchment Rainfall</span>
                <span className="text-[#e89b01] font-mono font-bold">{rainRate} mm/h</span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                value={rainRate}
                onChange={(e) => setRainRate(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#aca89f] mt-1">
                <span>0 mm (Drizzle)</span>
                <span>40 mm (Cloudburst)</span>
                <span>80 mm (Extreme Catastrophe)</span>
              </div>
            </div>

            {/* Slider 2: Soil Saturation */}
            <div>
              <div className="flex items-center justify-between mb-1.5 font-medium">
                <span className="text-[#61594a]">Basin Soil Saturation Index</span>
                <span className="text-[#6f8d54] font-mono font-bold">{soilSaturation} %</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                value={soilSaturation}
                onChange={(e) => setSoilSaturation(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#aca89f] mt-1">
                <span>20% (Dry Substrata)</span>
                <span>65% (Moist)</span>
                <span>100% (Complete Liquefaction)</span>
              </div>
            </div>

            {/* Slider 3: Upstream Dam / Weir release */}
            <div>
              <div className="flex items-center justify-between mb-1.5 font-medium">
                <span className="text-[#61594a]">Upstream Weir Influx</span>
                <span className="text-[#e89b01] font-mono font-bold">{upstreamRelease} m³/s</span>
              </div>
              <input
                type="range"
                min="20"
                max="300"
                value={upstreamRelease}
                onChange={(e) => setUpstreamRelease(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#aca89f] mt-1">
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
                ? "bg-[#fff0ed]/40 border-[#f0624f]/50"
                : compositeRisk >= 50
                ? "bg-[#fff4d6]/40 border-[#e89b01]/50"
                : "bg-[#edf3e8]/40 border-[#6f8d54]/50"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold uppercase text-[#8f897e]">
                Simulated AI Risk Outcome
              </span>
              <span
                className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                  compositeRisk >= 75
                    ? "bg-[#f0624f] text-[#261b07]"
                    : compositeRisk >= 50
                    ? "bg-[#f9a600] text-slate-950"
                    : "bg-[#6f8d54] text-slate-950"
                }`}
              >
                {compositeRisk >= 75 ? "FLASH EVACUATION" : compositeRisk >= 50 ? "WARNING WATCH" : "SAFE MONITOR"}
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-black font-mono text-[#261b07]">{compositeRisk}</span>
              <span className="text-xs text-[#61594a] font-mono">/ 100 Index</span>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-[#e3dfd5] text-xs">
              <div>
                <span className="text-[10px] font-mono text-[#8f897e] uppercase block">
                  Simulated Crest
                </span>
                <span className="font-mono font-bold text-[#261b07] mt-0.5 block">
                  {predictedStage} m MSL
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#8f897e] uppercase block">
                  Action Lead Time
                </span>
                <span className="font-mono font-bold text-[#e89b01] mt-0.5 block">
                  {leadTimeHours}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#e3dfd5]/40 border border-[#d5d2cd]/50 text-[11px] text-[#8f897e] leading-relaxed">
            💡 <strong>PINN Hydrological Law:</strong> When soil saturation surpasses 80%, catchment runoff coefficient scales from 0.35 to 0.88, causing rapid overland surges without ground absorption.
          </div>
        </div>
      </div>
    </div>
  );
}
