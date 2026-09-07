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
}

export function EvacuationNavigator({
  route,
  activeStepIndex,
  onSelectStep,
  onFlyToStep,
}: EvacuationNavigatorProps) {
  const currentStep = route.steps[activeStepIndex] || route.steps[0];

  const getDirectionIcon = (direction: EvacuationStep["direction"]) => {
    switch (direction) {
      case "uphill":
        return <MoveUp className="w-4 h-4 text-[#6f8d54]" />;
      case "right":
        return <CornerUpRight className="w-4 h-4 text-[#e89b01]" />;
      case "left":
        return <CornerUpLeft className="w-4 h-4 text-[#e89b01]" />;
      case "cross_bridge":
        return <Navigation className="w-4 h-4 text-[#e89b01]" />;
      default:
        return <ArrowRight className="w-4 h-4 text-[#61594a]" />;
    }
  };

  return (
    <div
      id="evacuation-navigator-panel"
      className="escape-guide-panel rise-in bg-white/95 border border-[#e3dfd5] rounded-2xl p-4 flex flex-col space-y-4 shadow-[0_4px_8px_rgba(38,27,7,.06)] backdrop-blur-md"
    >
      {/* Navigator Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e3dfd5] pb-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#8f897e]">
            <Compass className="w-3.5 h-3.5" />
            <span className="uppercase tracking-wider">3D Turn-By-Turn Escape Guide</span>
          </div>
          <h3 className="text-base font-extrabold text-[#261b07] mt-0.5 flex items-center gap-2">
            <span>Where to Go &amp; How to Go</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#6f8d54]/20 text-[#6f8d54] border border-[#6f8d54]/40">
              Route {route.id}
            </span>
          </h3>
        </div>

      </div>

      {/* Origin -> Destination Quick Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono bg-[#fffdf8] p-3 rounded-xl border border-[#e3dfd5]/80">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#f9a600]/20 border border-[#e89b01]/40 flex items-center justify-center shrink-0">
            <Home className="w-3.5 h-3.5 text-[#e89b01]" />
          </div>
          <div>
            <div className="text-[10px] text-[#8f897e] uppercase">Starting Point</div>
            <div className="font-bold text-[#261b07] text-xs">Your House (Upper Saproon)</div>
            <div className="text-[10px] text-[#e89b01]">Elev. 1,550m MSL</div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#6f8d54]/20 border border-[#6f8d54]/40 flex items-center justify-center shrink-0">
            <Building className="w-3.5 h-3.5 text-[#6f8d54]" />
          </div>
          <div>
            <div className="text-[10px] text-[#8f897e] uppercase">High Ground Shelter</div>
            <div className="font-bold text-[#261b07] text-xs truncate">{route.destinationName}</div>
            <div className="text-[10px] text-[#6f8d54] font-bold">
              Elev. {route.destinationElevM}m (+{route.totalElevationGainM}m High Ground)
            </div>
          </div>
        </div>
      </div>

      {/* Active Step Big Spotlight Card */}
      {currentStep && (
        <div
          id="active-step-spotlight"
          className="p-3.5 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/30 border border-[#e89b01]/40 shadow-lg relative overflow-hidden"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-[#f9a600]/20 border border-[#e89b01]/50 text-[#e89b01] font-extrabold text-sm shrink-0">
                #{currentStep.stepNumber}
              </div>
              <div className="space-y-1">
                <div className="text-xs text-[#8f897e] font-mono flex items-center gap-2">
                  <span>Step {currentStep.stepNumber} of {route.steps.length}</span>
                  <span className="text-[#8f897e]">•</span>
                  <span className="text-[#e89b01] font-semibold">{currentStep.distanceText}</span>
                  <span className="text-[#8f897e]">•</span>
                  <span className="text-[#6f8d54] font-semibold">
                    +{currentStep.elevationGainMeters}m climb
                  </span>
                </div>
                <div className="text-sm font-bold text-[#261b07] leading-snug">
                  {currentStep.instruction}
                </div>
                {currentStep.safetyCaution && (
                  <div className="flex items-start gap-1.5 text-xs text-[#e89b01]/90 pt-1 font-sans bg-[#f9a600]/10 p-2 rounded-lg border border-[#e89b01]/20">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#e89b01] shrink-0 mt-0.5" />
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
              className="px-2.5 py-1.5 rounded-lg bg-[#f9a600]/20 hover:bg-[#f9a600]/30 border border-[#e89b01]/40 text-[#e89b01] text-xs font-mono shrink-0 transition-colors"
            >
              Glide 3D POV
            </button>
          </div>
        </div>
      )}

      {/* All Steps Mini Checklist */}
      <div className="space-y-2">
        <div className="text-xs font-mono text-[#8f897e] uppercase tracking-wider flex items-center justify-between">
          <span>Route Waypoint Progress</span>
          <span className="text-[#aca89f]">
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
                    ? "bg-[#fff8e7]/60 border-[#e89b01] ring-1 ring-cyan-500/50"
                    : isCompleted
                    ? "bg-[#f2efe8]/80 border-[#6f8d54]/40 opacity-85"
                    : "bg-[#f2efe8]/40 border-[#e3dfd5] hover:border-[#d5d2cd]"
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isActive
                          ? "bg-[#f9a600] text-slate-950"
                          : isCompleted
                          ? "bg-[#6f8d54] text-slate-950"
                          : "bg-[#e3dfd5] text-[#61594a]"
                      }`}
                    >
                      {isCompleted ? "✓" : step.stepNumber}
                    </span>
                    <span className="text-[11px] font-semibold text-[#261b07] truncate">
                      {step.distanceText}
                    </span>
                  </div>
                  {getDirectionIcon(step.direction)}
                </div>
                <div className="text-[11px] text-[#8f897e] line-clamp-2 leading-tight">
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
