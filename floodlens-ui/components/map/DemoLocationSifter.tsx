"use client";

import React, { useState } from "react";
import {
  DemoLocation,
  LocationCategory,
  FloodSeverity,
  GeoLocation,
} from "./types";
import {
  ShieldAlert,
  Home,
  Waves,
  Building,
  Radio,
  Search,
  ChevronRight,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Compass,
} from "lucide-react";

interface DemoLocationSifterProps {
  locations: DemoLocation[];
  selectedLocationId: string | null;
  onSelectLocation: (loc: DemoLocation) => void;
  onFlyToLocation?: (coords: GeoLocation, zoom: number, tilt: number) => void;
}

export function DemoLocationSifter({
  locations,
  selectedLocationId,
  onSelectLocation,
  onFlyToLocation,
}: DemoLocationSifterProps) {
  const [categoryFilter, setCategoryFilter] = useState<LocationCategory | "all">("all");
  const [severityFilter, setSeverityFilter] = useState<FloodSeverity | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLocations = locations.filter((loc) => {
    if (categoryFilter !== "all" && loc.category !== categoryFilter) return false;
    if (severityFilter !== "all" && loc.severity !== severityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        loc.name.toLowerCase().includes(q) ||
        loc.description.toLowerCase().includes(q) ||
        loc.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getCategoryIcon = (category: LocationCategory) => {
    switch (category) {
      case "resident_house":
        return <Home className="w-4 h-4 text-[#e89b01]" />;
      case "flood_zone":
        return <Waves className="w-4 h-4 text-[#d94b3b]" />;
      case "shelter":
        return <Building className="w-4 h-4 text-[#6f8d54]" />;
      case "sensor":
        return <Radio className="w-4 h-4 text-[#e89b01]" />;
      default:
        return <Compass className="w-4 h-4 text-[#8f897e]" />;
    }
  };

  const getSeverityBadge = (severity: FloodSeverity) => {
    switch (severity) {
      case "inundated":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#f0624f]/20 text-[#d94b3b] border border-[#f0624f]/40">
            <ShieldAlert className="w-3 h-3 text-[#d94b3b] animate-pulse" />
            Inundated
          </span>
        );
      case "hazardous":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-red-500/15 text-[#d94b3b] border border-red-500/30">
            <AlertTriangle className="w-3 h-3 text-[#d94b3b]" />
            Hazardous
          </span>
        );
      case "warning":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#f9a600]/15 text-[#e89b01] border border-[#e89b01]/30">
            <AlertTriangle className="w-3 h-3 text-[#e89b01]" />
            Warning
          </span>
        );
      case "watch":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#f9a600]/15 text-[#e89b01] border border-[#e89b01]/30">
            Watch Level
          </span>
        );
      case "safe":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#6f8d54]/15 text-[#6f8d54] border border-[#6f8d54]/30">
            <CheckCircle2 className="w-3 h-3 text-[#6f8d54]" />
            Safe Shelter
          </span>
        );
    }
  };

  return (
    <div
      id="demo-location-sifter"
      className="demo-location-sifter rise-in bg-white/95 border border-[#e3dfd5] rounded-2xl p-4 flex flex-col space-y-3 shadow-[0_4px_8px_rgba(38,27,7,.06)] backdrop-blur-md"
    >
      {/* Sifter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e3dfd5] pb-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#e89b01]" />
          <h3 className="text-sm font-bold text-[#261b07] tracking-wide uppercase font-mono">
            Sift Demo Flood Locations
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#e3dfd5] text-[#61594a] font-mono">
            {filteredLocations.length}/{locations.length}
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-56">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8f897e]" />
          <input
            id="sifter-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search hazard or shelter..."
            className="w-full bg-[#f2efe8] border border-[#e3dfd5] rounded-lg pl-8 pr-3 py-1 text-xs text-[#261b07] placeholder-slate-500 focus:outline-none focus:border-[#e89b01]"
          />
        </div>
      </div>

      {/* Quick Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <button
          id="filter-cat-all"
          type="button"
          onClick={() => setCategoryFilter("all")}
          className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
            categoryFilter === "all"
              ? "bg-[#f9a600] text-slate-950 font-bold"
              : "bg-[#e3dfd5]/80 text-[#61594a] hover:bg-slate-700"
          }`}
        >
          All ({locations.length})
        </button>
        <button
          id="filter-cat-flood"
          type="button"
          onClick={() => setCategoryFilter("flood_zone")}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all ${
            categoryFilter === "flood_zone"
              ? "bg-[#f0624f] text-[#261b07] font-bold"
              : "bg-[#e3dfd5]/80 text-[#d94b3b] hover:bg-[#fff0ed]/40"
          }`}
        >
          <Waves className="w-3 h-3" />
          Flood Hazards (5)
        </button>
        <button
          id="filter-cat-shelters"
          type="button"
          onClick={() => setCategoryFilter("shelter")}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all ${
            categoryFilter === "shelter"
              ? "bg-[#6f8d54] text-slate-950 font-bold"
              : "bg-[#e3dfd5]/80 text-[#6f8d54] hover:bg-[#edf3e8]/40"
          }`}
        >
          <Building className="w-3 h-3" />
          Safe Shelters (3)
        </button>
        <button
          id="filter-cat-house"
          type="button"
          onClick={() => setCategoryFilter("resident_house")}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all ${
            categoryFilter === "resident_house"
              ? "bg-[#f9a600] text-slate-950 font-bold"
              : "bg-[#e3dfd5]/80 text-[#e89b01] hover:bg-[#fff8e7]/40"
          }`}
        >
          <Home className="w-3 h-3" />
          Your House (1)
        </button>
      </div>

      {/* Sifted Locations List (Scrollable Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
        {filteredLocations.map((loc) => {
          const isSelected = loc.id === selectedLocationId;
          return (
            <div
              key={loc.id}
              id={`sifter-card-${loc.id}`}
              onClick={() => {
                onSelectLocation(loc);
                if (onFlyToLocation) {
                  onFlyToLocation(
                    loc.coordinates,
                    loc.category === "resident_house" ? 17 : 16,
                    loc.category === "flood_zone" ? 60 : 45
                  );
                }
              }}
              className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                isSelected
                  ? "bg-[#fff8e7]/40 border-[#e89b01] ring-1 ring-cyan-500/50 shadow-lg"
                  : "bg-[#f2efe8]/60 border-[#e3dfd5] hover:border-[#d5d2cd] hover:bg-white/60"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="p-1 rounded-md bg-[#e3dfd5]/90 shrink-0">
                    {getCategoryIcon(loc.category)}
                  </div>
                  <div className="truncate font-semibold text-xs text-[#261b07]">
                    {loc.shortName}
                  </div>
                </div>
                {getSeverityBadge(loc.severity)}
              </div>

              <p className="text-[11px] text-[#8f897e] mt-1 line-clamp-1">
                {loc.description}
              </p>

              <div className="flex items-center justify-between text-[10px] font-mono text-[#8f897e] mt-2 pt-1 border-t border-[#e3dfd5]/60">
                <span>Elev: {loc.elevationMeters}m</span>
                {loc.waterDepthMeters !== undefined && (
                  <span className="text-[#d94b3b] font-bold">
                    Depth: {loc.waterDepthMeters}m
                  </span>
                )}
                {loc.safeCapacity && (
                  <span className="text-[#6f8d54] font-bold">
                    Cap: {loc.currentOccupancy}/{loc.safeCapacity}
                  </span>
                )}
                <span className="text-[#e89b01] flex items-center gap-0.5 hover:underline">
                  Fly-to <ChevronRight className="w-2.5 h-2.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
