"use client";

import { useState } from "react";
import { FEATURES } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePredictionStore } from "@/lib/store/predictionStore";
import { mlApi } from "@/lib/api/mlClient";
import { AlertTriangle, Loader2 } from "lucide-react";

export function PredictionForm() {
  const { setPrediction, addToHistory, setLoading, setError } = usePredictionStore();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [location, setLocation] = useState("village_a");

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const readings = FEATURES.filter((f) =>
        ["water_level_m", "rainfall_mm", "soil_moisture_percent", "tilt_degrees", "temperature_c", "humidity_percent"].includes(f.key)
      ).map((f) => ({
        key: f.key,
        value: parseFloat(formData[f.key] || "0"),
      }));

      const result = await mlApi.predict({
        location,
        readings: readings.map((r) => ({
          location,
          [r.key]: r.value,
        })),
      });
      setPrediction(result);
      addToHistory(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const mainFeatures = FEATURES.filter((f) =>
    ["water_level_m", "rainfall_mm", "soil_moisture_percent", "tilt_degrees", "temperature_c", "humidity_percent"].includes(f.key)
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {mainFeatures.map((f) => (
          <Input
            key={f.key}
            label={f.label}
            placeholder={`${f.min} - ${f.max} ${f.unit}`}
            type="number"
            min={f.min}
            max={f.max}
            step="any"
            value={formData[f.key] || ""}
            onChange={(e) => handleChange(f.key, e.target.value)}
          />
        ))}
      </div>
      <div className="space-y-1">
        <label className="text-sm text-gray-400">Location</label>
        <input
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-accent/50"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>
      <Button type="submit" className="w-full" disabled={usePredictionStore.getState().isLoading}>
        {usePredictionStore.getState().isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Predicting...
          </>
        ) : (
          "Run Prediction"
        )}
      </Button>
    </form>
  );
}
