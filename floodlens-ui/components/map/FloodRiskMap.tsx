"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  GoogleMap,
  useLoadScript,
  Marker,
  Circle,
  InfoWindow,
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

export default function FloodRiskMap({
  center = { lat: 31.0, lng: 77.0 },
  zoom = 8,
  showDemoLocations = true,
  height = "500px",
}: FloodRiskMapProps) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

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

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;

  return (
    <div className="relative" style={{ height }}>
      {loading && (
        <div className="absolute top-2 right-2 z-10 bg-white px-3 py-1 rounded-full shadow-md text-sm">
          Loading flood data...
        </div>
      )}

      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        center={center}
        zoom={zoom}
        options={{
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
        }}
      >
        {predictions.map((pred, idx) => {
          const color = riskColor(pred.risk_level);
          return (
            <React.Fragment key={`flood-${pred.location}-${idx}`}>
              <Circle
                center={{ lat: pred.lat, lng: pred.lon }}
                radius={5000 + (pred.risk_score / 100) * 10000}
                options={{
                  fillColor: color,
                  fillOpacity: 0.3,
                  strokeColor: color,
                  strokeOpacity: 0.9,
                  strokeWeight: pred.risk_score >= 60 ? 3 : 2,
                }}
                onClick={() => {
                  setSelectedFeature({
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
              />
              <Marker
                position={{ lat: pred.lat, lng: pred.lon }}
                label={{
                  text: `${pred.risk_score}`,
                  color: "white",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
                icon={{
                  path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
                  scale: 8,
                  fillColor: color,
                  fillOpacity: 0.9,
                  strokeColor: "#ffffff",
                  strokeWeight: 2,
                }}
              />
            </React.Fragment>
          );
        })}

        {selectedFeature && (
          <InfoWindow
            position={{
              lat: selectedFeature.geometry.coordinates[1],
              lng: selectedFeature.geometry.coordinates[0],
            }}
            onCloseClick={() => setSelectedFeature(null)}
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
      </GoogleMap>
    </div>
  );
}
