"use client";

import React, { useState, useEffect } from "react";
import {
  EvacuationRoute3D,
  EvacuationStep,
  GeoLocation,
} from "./types";
import {
  Navigation,
  CornerUpRight,
  CornerUpLeft,
  MoveUp,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Footprints,
  Compass,
  Building,
  TrendingUp,
  Home,
  CheckCircle2,
} from "lucide-react";

interface EvacuationNavigatorProps {
  route: EvacuationRoute3D;
  activeStepIndex: number;
  onSelectStep: (stepIndex: number) => void;
  onFlyToStep: (coords: GeoLocation, zoom: number, tilt: number, heading: number) => void;
  isSimulating: boolean;
  onToggleSimulate: () => void;
}

export function EvacuationNavigator({
  route,
  activeStepIndex,
  onSelectStep,
  onFlyToStep,
  isSimulating,
  onToggleSimulate,
}: EvacuationNavigatorProps) {
  const currentStep = route.steps[activeStepIndex] || route.steps[0];

  const getDirectionIcon = (direction: EvacuationStep["direction"]) => {
    switch (direction) {
      case "uphill":
        return <MoveUp className="w-4 h-4 text-emerald-400" />;
      case "right":
        return <CornerUpRight className="w-4 h-4 text-cyan-400" />;
      case "left":
        return <CornerUpLeft className="w-4 h-4 text-cyan-400" />;
      case "cross_bridge":
        return <Navigation className="w-4 h-4 text-amber-400" />;
      default:
        return <ArrowRight className="w-4 h-4 text-slate-300" />;
    }
  };

  return (
    <div
      id="evacuation-navigator-panel"
      className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 flex flex-col space-y-4 shadow-2xl backdrop-blur-md"
    >
      {/* Navigator Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <Compass className="w-3.5 h-3.5" />
            <span className="uppercase tracking-wider">3D Turn-By-Turn Escape Guide</span>
          </div>
          <h3 className="text-base font-extrabold text-white mt-0.5 flex items-center gap-2">
            <span>Where to Go &amp; How to Go</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              Route {route.id}
            </span>
          </h3>
        </div>

        {/* 3D Auto-Simulation Controls */}
        <div className="flex items-center gap-2">
          <button
            id="navigator-simulate-btn"
            type="button"
            onClick={onToggleSimulate}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md ${
              isSimulating
                ? "bg-amber-500 text-slate-950 animate-pulse hover:bg-amber-400"
                : "bg-cyan-500 text-slate-950 hover:bg-cyan-400"
            }`}
          >
            {isSimulating ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause Flight</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Auto-Fly 3D Route</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Origin -> Destination Quick Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center shrink-0">
            <Home className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase">Starting Point</div>
            <div className="font-bold text-white text-xs">Your House (Upper Saproon)</div>
            <div className="text-[10px] text-cyan-400">Elev. 1,550m MSL</div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
            <Building className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase">High Ground Shelter</div>
            <div className="font-bold text-white text-xs truncate">{route.destinationName}</div>
            <div className="text-[10px] text-emerald-400 font-bold">
              Elev. {route.destinationElevM}m (+{route.totalElevationGainM}m High Ground)
            </div>
          </div>
        </div>
      </div>

      {/* Active Step Big Spotlight Card */}
      {currentStep && (
        <div
          id="active-step-spotlight"
          className="p-3.5 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/30 border border-cyan-500/40 shadow-lg relative overflow-hidden"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 font-extrabold text-sm shrink-0">
                #{currentStep.stepNumber}
              </div>
              <div className="space-y-1">
                <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
                  <span>Step {currentStep.stepNumber} of {route.steps.length}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-cyan-300 font-semibold">{currentStep.distanceText}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-emerald-400 font-semibold">
                    +{currentStep.elevationGainMeters}m climb
                  </span>
                </div>
                <div className="text-sm font-bold text-white leading-snug">
                  {currentStep.instruction}
                </div>
                {currentStep.safetyCaution && (
                  <div className="flex items-start gap-1.5 text-xs text-amber-300/90 pt-1 font-sans bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{currentStep.safetyCaution}</span>
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                onFlyToStep(
                  currentStep.coordinates,
                  18,
                  55,
                  (currentStep.stepNumber * 45) % 360
                )
              }
              className="px-2.5 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-mono shrink-0 transition-colors"
            >
              Glide 3D POV
            </button>
          </div>
        </div>
      )}

      {/* All Steps Mini Checklist */}
      <div className="space-y-2">
        <div className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>Route Waypoint Progress</span>
          <span className="text-slate-500">
            {activeStepIndex + 1} of {route.steps.length}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {route.steps.map((step, idx) => {
            const isActive = idx === activeStepIndex;
            const isCompleted = idx < activeStepIndex;
            return (
              <button
                key={step.stepNumber}
                id={`route-step-card-${step.stepNumber}`}
                type="button"
                onClick={() => {
                  onSelectStep(idx);
                  onFlyToStep(
                    step.coordinates,
                    17.5,
                    50,
                    (step.stepNumber * 40) % 360
                  );
                }}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  isActive
                    ? "bg-cyan-950/60 border-cyan-500 ring-1 ring-cyan-500/50"
                    : isCompleted
                    ? "bg-slate-950/80 border-emerald-500/40 opacity-85"
                    : "bg-slate-950/40 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isActive
                          ? "bg-cyan-500 text-slate-950"
                          : isCompleted
                          ? "bg-emerald-500 text-slate-950"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {isCompleted ? "✓" : step.stepNumber}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-200 truncate">
                      {step.distanceText}
                    </span>
                  </div>
                  {getDirectionIcon(step.direction)}
                </div>
                <div className="text-[11px] text-slate-400 line-clamp-2 leading-tight">
                  {step.instruction}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
