"use client";

import React, { useEffect, useState } from "react";
import {
  riskColor,
  riskLabel,
  DEMO_FLOOD_LOCATIONS,
} from "@/lib/api/floodGeoJson";
import { mlApi } from "@/lib/api/mlClient";
import type { PredictionResponse } from "@/lib/types";

interface FloodRiskPanelProps {
  showDemoData?: boolean;
  onRefresh?: () => void;
}

interface FloodZone {
  name: string;
  lat: number;
  lon: number;
  prediction: PredictionResponse | null;
  loading: boolean;
}

export default function FloodRiskPanel({
  showDemoData = true,
  onRefresh,
}: FloodRiskPanelProps) {
  const [zones, setZones] = useState<FloodZone[]>([]);
  const [modelInfo, setModelInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const loadZones = async () => {
    setLoading(true);
    const newZones: FloodZone[] = [];

    for (const loc of DEMO_FLOOD_LOCATIONS) {
      const zone: FloodZone = {
        name: loc.name,
        lat: loc.lat,
        lon: loc.lon,
        prediction: null,
        loading: true,
      };
      newZones.push(zone);
    }

    setZones(newZones);

    for (let i = 0; i < DEMO_FLOOD_LOCATIONS.length; i++) {
      const loc = DEMO_FLOOD_LOCATIONS[i];
      try {
        const result = await mlApi.predictRuleBased({
          location: loc.name,
          readings: loc.readings,
        });
        setZones((prev) =>
          prev.map((z, idx) =>
            idx === i
              ? { ...z, prediction: result, loading: false }
              : z
          )
        );
      } catch {
        setZones((prev) =>
          prev.map((z, idx) =>
            idx === i
              ? {
                  ...z,
                  prediction: {
                    location: loc.name,
                    risk_score: Math.floor(Math.random() * 80) + 10,
                    risk_level: "",
                    flood_probability: 0.5,
                    model_version: "demo",
                  },
                  loading: false,
                }
              : z
          )
        );
      }
    }

    setLoading(false);
  };

  const loadModelInfo = async () => {
    try {
      const info = await mlApi.modelInfo();
      setModelInfo(info);
    } catch {
      setModelInfo(null);
    }
  };

  useEffect(() => {
    if (showDemoData) {
      loadZones();
      loadModelInfo();
    }
  }, [showDemoData]);

  const handleRefresh = () => {
    loadZones();
    onRefresh?.();
  };

  const highRiskZones = zones.filter(
    (z) => z.prediction && z.prediction.risk_score >= 60
  );
  const warningZones = zones.filter(
    (z) =>
      z.prediction &&
      z.prediction.risk_score >= 40 &&
      z.prediction.risk_score < 60
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 max-w-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <span className="text-2xl">🌊</span>
          Flood Risk Monitor
        </h2>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 text-sm"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {highRiskZones.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-semibold text-red-800 mb-2">
            ⚠️ High Risk Zones ({highRiskZones.length})
          </h3>
          {highRiskZones.map((zone, idx) => (
            <div
              key={`high-${idx}`}
              className="flex items-center justify-between py-1"
            >
              <span className="text-sm">{zone.name}</span>
              <span
                className="px-2 py-0.5 rounded-full text-white text-xs font-medium"
                style={{
                  backgroundColor: riskColor(zone.prediction?.risk_level || ""),
                }}
              >
                {zone.prediction?.risk_score}/100
              </span>
            </div>
          ))}
        </div>
      )}

      {warningZones.length > 0 && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">
            ⚡ Warning Zones ({warningZones.length})
          </h3>
          {warningZones.map((zone, idx) => (
            <div
              key={`warn-${idx}`}
              className="flex items-center justify-between py-1"
            >
              <span className="text-sm">{zone.name}</span>
              <span
                className="px-2 py-0.5 rounded-full text-white text-xs font-medium"
                style={{
                  backgroundColor: riskColor(zone.prediction?.risk_level || ""),
                }}
              >
                {zone.prediction?.risk_score}/100
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        {zones.map((zone, idx) => (
          <div
            key={`zone-${idx}`}
            className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{zone.name}</h4>
                <p className="text-xs text-gray-500">
                  {zone.lat.toFixed(4)}, {zone.lon.toFixed(4)}
                </p>
              </div>
              <div className="text-right">
                {zone.loading ? (
                  <span className="text-gray-400 text-sm">Loading...</span>
                ) : (
                  <>
                    <div
                      className="px-3 py-1 rounded-full text-white text-sm font-medium inline-block"
                      style={{
                        backgroundColor: riskColor(
                          zone.prediction?.risk_level || ""
                        ),
                      }}
                    >
                      {riskLabel(zone.prediction?.risk_level || "")}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Score: {zone.prediction?.risk_score || 0}/100
                    </p>
                  </>
                )}
              </div>
            </div>
            {zone.prediction && (
              <div className="mt-2 text-xs text-gray-600">
                Flood Probability:{" "}
                {((zone.prediction.flood_probability || 0) * 100).toFixed(1)}%
              </div>
            )}
          </div>
        ))}
      </div>

      {modelInfo && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
          <p>
            <strong>Model:</strong> {modelInfo.model_version}
          </p>
          <p>
            <strong>Formula:</strong> {modelInfo.formula}
          </p>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => {
            const allZones = zones.map((z) => ({
              ...z,
              prediction: z.prediction
                ? { ...z.prediction, risk_score: Math.min((z.prediction.risk_score || 0) + 10, 100) }
                : null,
            }));
            setZones(allZones);
          }}
          className="flex-1 px-3 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 text-sm"
        >
          Simulate Increase
        </button>
        <button
          onClick={() => {
            const allZones = zones.map((z) => ({
              ...z,
              prediction: z.prediction
                ? { ...z.prediction, risk_score: Math.max((z.prediction.risk_score || 0) - 10, 0) }
                : null,
            }));
            setZones(allZones);
          }}
          className="flex-1 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
        >
          Simulate Decrease
        </button>
      </div>
    </div>
  );
}
