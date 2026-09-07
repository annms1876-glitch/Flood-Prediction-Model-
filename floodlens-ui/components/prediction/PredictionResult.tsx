"use client";

import { PredictionResponse } from "@/lib/types";
import { RiskGauge } from "@/components/dashboard/RiskGauge";
import { Badge } from "@/components/ui/badge";
import { getRiskColor, getRiskBadgeClass, getRiskLabel } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface PredictionResultProps {
  prediction: PredictionResponse;
}

export function PredictionResult({ prediction }: PredictionResultProps) {
  if (!prediction) return null;

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center gap-6">
        <RiskGauge score={prediction.risk_score} level={prediction.risk_level} />
        <div>
          <Badge variant={prediction.risk_level}>
            {prediction.risk_level.toUpperCase()}
          </Badge>
          <p className="text-sm text-gray-400 mt-2">
            Flood Probability: {(prediction.flood_probability * 100).toFixed(1)}%
          </p>
          {prediction.predicted_water_level && (
            <p className="text-sm text-gray-400">
              Predicted Water Level: {prediction.predicted_water_level}m
            </p>
          )}
          {prediction.lead_time_hours && (
            <p className="text-sm text-gray-400">
              Lead Time: {prediction.lead_time_hours}h
            </p>
          )}
        </div>
      </div>

      {prediction.recommendations && prediction.recommendations.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white mb-2">Recommendations</h3>
          <ul className="space-y-1">
            {prediction.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-brand-accent mt-1">→</span>
                <span className="text-gray-300">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
