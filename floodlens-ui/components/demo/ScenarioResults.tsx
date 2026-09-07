"use client";

import { DemoPrediction } from "@/lib/types";
import { RiskGauge } from "@/components/dashboard/RiskGauge";
import { Badge } from "@/components/ui/badge";
import { getRiskColor } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { ModelBreakdown } from "@/components/prediction/ModelBreakdown";

interface ScenarioResultsProps {
  prediction: DemoPrediction;
}

export function ScenarioResults({ prediction }: ScenarioResultsProps) {
  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center gap-6">
        <div className="text-4xl">{prediction.icon}</div>
        <div>
          <h2 className="text-xl font-bold text-white">{prediction.scenario}</h2>
          <p className="text-sm text-gray-400">{prediction.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <RiskGauge score={prediction.risk_score} level={prediction.risk_level} />
        <div>
          <Badge variant={prediction.risk_level}>{prediction.risk_level.toUpperCase()}</Badge>
          <p className="text-sm text-gray-400 mt-2">
            Flood Probability: {(prediction.flood_probability * 100).toFixed(1)}%
          </p>
          <p className="text-sm text-gray-400">
            Predicted Water Level: {prediction.predicted_water_level}m
          </p>
          <p className="text-sm text-gray-400">Lead Time: {prediction.lead_time_hours}h</p>
        </div>
      </div>

      <ModelBreakdown
        prediction={{
          ...prediction,
          risk_score: prediction.risk_score,
          risk_level: prediction.risk_level,
          flood_probability: prediction.flood_probability,
          models: prediction.models,
        }}
      />

      {prediction.recommendations && (
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
