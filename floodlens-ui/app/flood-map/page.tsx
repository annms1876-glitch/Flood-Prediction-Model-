"use client";

import React from "react";
import dynamic from "next/dynamic";
import FloodRiskPanel from "@/components/map/FloodRiskPanel";
import { FloodLegend, FloodStatsSummary } from "@/components/map/FloodGeoJsonLayer";

const FloodRiskMap = dynamic(() => import("@/components/map/FloodRiskMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-gray-100 flex items-center justify-center">
      <div className="text-gray-500">Loading map...</div>
    </div>
  ),
});

export default function FloodMapPage() {
  const [stats, setStats] = React.useState<
    Array<{ name: string; risk_score: number; risk_level: string }>
  >([]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <span className="text-4xl">🌊</span>
          Flood Risk Map
        </h1>
        <p className="text-gray-600 mt-2">
          Real-time flood prediction visualization powered by Umeed AI
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <FloodRiskMap
              center={{ lat: 31.0, lng: 77.0 }}
              zoom={8}
              height="600px"
              showDemoLocations={true}
            />
          </div>
        </div>

        <div className="space-y-4">
          <FloodRiskPanel showDemoData={true} />
          <FloodLegend />
        </div>
      </div>

      <div className="mt-6">
        <FloodStatsSummary zones={stats} />
      </div>
    </div>
  );
}
