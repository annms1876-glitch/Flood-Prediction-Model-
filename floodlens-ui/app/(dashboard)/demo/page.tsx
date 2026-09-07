"use client";

import { useState } from "react";
import { ScenarioCard } from "@/components/demo/ScenarioCard";
import { ScenarioResults } from "@/components/demo/ScenarioResults";
import { mlApi } from "@/lib/api/mlClient";
import { DemoScenario, DemoPrediction } from "@/lib/types";

const SCENARIOS: DemoScenario[] = [
  { key: "normal_day", name: "Normal Day", description: "Clear weather, stable river levels", icon: "☀️" },
  { key: "light_rain", name: "Light Rainfall", description: "Moderate rain, water levels rising slowly", icon: "🌦️" },
  { key: "heavy_rain", name: "Heavy Rainfall", description: "Intense rain, river levels rising fast", icon: "🌧️" },
  { key: "flood_critical", name: "Critical Alert", description: "Dangerous levels, immediate evacuation", icon: "🚨" },
  { key: "hilly_region", name: "Hilly Region", description: "Steep terrain, high tilt sensor readings", icon: "⛰️" },
  { key: "multi_village", name: "Multi-Village", description: "Flood affecting multiple downstream villages", icon: "🏘️" },
];

export default function DemoPage() {
  const [result, setResult] = useState<DemoPrediction | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRun = async (scenario: DemoScenario) => {
    setLoading(true);
    try {
      const data = await mlApi.demoPredict(scenario.key);
      setResult(data as DemoPrediction);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-slide-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Demo Scenarios</h1>
        <p className="text-gray-400 mt-1">
          Try pre-computed flood scenarios to see the AI in action
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SCENARIOS.map((scenario) => (
          <ScenarioCard
            key={scenario.key}
            scenario={scenario}
            onClick={() => handleRun(scenario)}
          />
        ))}
      </div>

      {result && <ScenarioResults prediction={result} />}

      {loading && (
        <div className="flex items-center justify-center p-12">
          <div className="text-brand-accent animate-spin">⏳</div>
        </div>
      )}
    </div>
  );
}
