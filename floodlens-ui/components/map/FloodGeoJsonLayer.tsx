"use client";

import React from "react";
import type { FloodFeatureCollection, FloodFeature } from "@/lib/api/floodGeoJson";

interface FloodGeoJsonLayerProps {
  data: FloodFeatureCollection;
  onFeatureClick?: (feature: FloodFeature) => void;
}

export function FloodGeoJsonLayer({ data, onFeatureClick }: FloodGeoJsonLayerProps) {
  return (
    <div className="hidden">
      {/* GeoJSON data layer - consumed by map components */}
      <script
        type="application/json"
        id="flood-geojson-data"
        data-features={JSON.stringify(data.features)}
      />
    </div>
  );
}

export function FloodLegend() {
  const levels = [
    { level: "normal", label: "Normal", color: "#22c55e", range: "0-19" },
    { level: "watch", label: "Watch", color: "#eab308", range: "20-39" },
    { level: "warning", label: "Warning", color: "#f97316", range: "40-59" },
    { level: "high", label: "High Risk", color: "#ef4444", range: "60-79" },
    { level: "critical", label: "Critical", color: "#dc2626", range: "80-100" },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-3">
      <h3 className="font-semibold text-sm mb-2">Risk Levels</h3>
      <div className="space-y-1">
        {levels.map((item) => (
          <div key={item.level} className="flex items-center gap-2 text-xs">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="font-medium">{item.label}</span>
            <span className="text-gray-500">({item.range})</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FloodStatsSummary({
  zones,
}: {
  zones: Array<{ name: string; risk_score: number; risk_level: string }>;
}) {
  const totalZones = zones.length;
  const highRisk = zones.filter((z) => z.risk_score >= 60).length;
  const warning = zones.filter(
    (z) => z.risk_score >= 40 && z.risk_score < 60
  ).length;
  const normal = zones.filter((z) => z.risk_score < 40).length;
  const avgScore =
    totalZones > 0
      ? Math.round(zones.reduce((sum, z) => sum + z.risk_score, 0) / totalZones)
      : 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="font-semibold mb-3">Flood Risk Statistics</h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="text-center p-2 bg-blue-50 rounded">
          <div className="text-2xl font-bold text-blue-600">{totalZones}</div>
          <div className="text-xs text-gray-600">Monitored Zones</div>
        </div>
        <div className="text-center p-2 bg-purple-50 rounded">
          <div className="text-2xl font-bold text-purple-600">{avgScore}</div>
          <div className="text-xs text-gray-600">Avg Risk Score</div>
        </div>
        <div className="text-center p-2 bg-red-50 rounded">
          <div className="text-2xl font-bold text-red-600">{highRisk}</div>
          <div className="text-xs text-gray-600">High Risk</div>
        </div>
        <div className="text-center p-2 bg-yellow-50 rounded">
          <div className="text-2xl font-bold text-yellow-600">{warning}</div>
          <div className="text-xs text-gray-600">Warning</div>
        </div>
      </div>
    </div>
  );
}
