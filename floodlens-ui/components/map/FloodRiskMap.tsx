"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
} from "@vis.gl/react-google-maps";
import {
  riskColor,
  riskLabel,
  DEMO_FLOOD_LOCATIONS,
  type FloodFeature,
} from "@/lib/api/floodGeoJson";
import { mlApi } from "@/lib/api/mlClient";
import type { PredictionResponse } from "@/lib/types";

interface FloodRiskMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  showDemoLocations?: boolean;
  height?: string;
}

function MapMarkers({
  predictions,
  selectedFeature,
  onSelectFeature,
  onCloseInfoWindow,
}: {
  predictions: Array<PredictionResponse & { lat: number; lon: number }>;
  selectedFeature: FloodFeature | null;
  onSelectFeature: (f: FloodFeature) => void;
  onCloseInfoWindow: () => void;
}) {
  return (
    <>
      {predictions.map((pred, idx) => {
        const color = riskColor(pred.risk_level);
        return (
          <AdvancedMarker
            key={`flood-${pred.location}-${idx}`}
            position={{ lat: pred.lat, lng: pred.lon }}
            onClick={() => {
              onSelectFeature({
                type: "Feature",
                geometry: {
                  type: "Point",
                  coordinates: [pred.lon, pred.lat],
                },
                properties: {
                  id: `flood-${pred.location}`,
                  name: pred.location,
                  riskScore: pred.risk_score,
                  riskLevel: pred.risk_level,
                  riskLabel: riskLabel(pred.risk_level),
                  riskColor: color,
                  floodProbability: pred.flood_probability,
                  modelVersion: pred.model_version || "unknown",
                  updatedAt: new Date().toISOString(),
                },
              });
            }}
          >
            <div
              className="rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg border-2 border-white"
              style={{
                backgroundColor: color,
                width: "32px",
                height: "32px",
              }}
            >
              {pred.risk_score}
            </div>
          </AdvancedMarker>
        );
      })}

      {selectedFeature && (
        <InfoWindow
          position={{
            lat: selectedFeature.geometry.coordinates[1],
            lng: selectedFeature.geometry.coordinates[0],
          }}
          onCloseClick={onCloseInfoWindow}
        >
          <div className="p-2 min-w-[200px]">
            <h3 className="font-bold text-lg mb-1">
              {selectedFeature.properties.name}
            </h3>
            <div className="flex items-center gap-2 mb-2">
              <span
                className="px-2 py-0.5 rounded-full text-white text-sm font-medium"
                style={{
                  backgroundColor: selectedFeature.properties.riskColor,
                }}
              >
                {selectedFeature.properties.riskLabel}
              </span>
              <span className="text-gray-600">
                Score: {selectedFeature.properties.riskScore}/100
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Flood Probability:{" "}
              {(selectedFeature.properties.floodProbability * 100).toFixed(1)}%
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Model: {selectedFeature.properties.modelVersion}
            </p>
          </div>
        </InfoWindow>
      )}
    </>
  );
}

export default function FloodRiskMap({
  center = { lat: 31.0, lng: 77.0 },
  zoom = 8,
  showDemoLocations = true,
  height = "500px",
}: FloodRiskMapProps) {
  const [predictions, setPredictions] = useState<
    Array<PredictionResponse & { lat: number; lon: number }>
  >([]);
  const [selectedFeature, setSelectedFeature] = useState<FloodFeature | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  const loadDemoPredictions = useCallback(async () => {
    setLoading(true);
    try {
      const results: Array<PredictionResponse & { lat: number; lon: number }> =
        [];

      for (const loc of DEMO_FLOOD_LOCATIONS) {
        try {
          const result = await mlApi.predictRuleBased({
            location: loc.name,
            readings: loc.readings,
          });
          results.push({
            ...result,
            lat: loc.lat,
            lon: loc.lon,
          });
        } catch {
          results.push({
            location: loc.name,
            risk_score: Math.floor(Math.random() * 80) + 10,
            risk_level: "",
            flood_probability: 0.5,
            model_version: "demo",
            lat: loc.lat,
            lon: loc.lon,
          });
        }
      }
      setPredictions(results);
    } catch (error) {
      console.error("Failed to load flood predictions:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (showDemoLocations) {
      loadDemoPredictions();
    }
  }, [showDemoLocations, loadDemoPredictions]);

  return (
    <div className="relative" style={{ height }}>
      <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
        {loading && (
          <div className="absolute top-2 right-2 z-10 bg-white px-3 py-1 rounded-full shadow-md text-sm">
            Loading flood data...
          </div>
        )}

        <Map
          mapId="flood-risk-map"
          style={{ width: "100%", height: "100%" }}
          defaultCenter={center}
          defaultZoom={zoom}
          gestureHandling="greedy"
          disableDefaultUI={false}
        >
          <MapMarkers
            predictions={predictions}
            selectedFeature={selectedFeature}
            onSelectFeature={setSelectedFeature}
            onCloseInfoWindow={() => setSelectedFeature(null)}
          />
        </Map>
      </APIProvider>
    </div>
  );
}
