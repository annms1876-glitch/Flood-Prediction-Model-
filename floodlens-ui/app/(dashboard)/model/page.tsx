"use client";

import { useEffect, useState } from "react";
import { mlApi } from "@/lib/api/mlClient";
import { ModelInfo } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const MODEL_INFO = {
  model_version: "ensemble_v2.0",
  models: ["LSTM", "XGBoost", "GNN", "PINN"],
  formula: "LSTM × 0.4 + XGBoost × 0.3 + GNN × 0.2 + PINN × 0.1",
};

const MODEL_DETAILS = [
  {
    name: "LSTM",
    weight: "40%",
    color: "#3b82f6",
    description: "Captures temporal patterns in sensor time-series data",
    architecture: "Long Short-Term Memory network",
    layers: ["Input", "LSTM (128 units)", "Dropout (0.3)", "Dense"],
  },
  {
    name: "XGBoost",
    weight: "30%",
    color: "#22c55e",
    description: "Corrects residual errors from LSTM predictions",
    architecture: "Gradient Boosted Decision Trees",
    layers: ["100 estimators", "Max depth: 6", "Learning rate: 0.1"],
  },
  {
    name: "GNN",
    weight: "20%",
    color: "#f97316",
    description: "Models spatial relationships between sensor nodes",
    architecture: "Graph Neural Network",
    layers: ["GCN Conv", "Attention", "Readout"],
  },
  {
    name: "PINN",
    weight: "10%",
    color: "#a855f7",
    description: "Enforces physics-informed constraints on predictions",
    architecture: "Physics-Informed Neural Network",
    layers: ["Physics loss", "Data loss", "Combined output"],
  },
];

export default function ModelPage() {
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mlApi.modelInfo()
      .then(setModelInfo)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-brand-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Model Architecture</h1>
        <p className="text-gray-400 mt-1">
          Ensemble AI system powering Umeed AI predictions
        </p>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-white mb-2">
          Ensemble Formula
        </h2>
        <p className="text-brand-accent font-mono text-sm">
          {MODEL_INFO.formula}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Version: {MODEL_INFO.model_version}
        </p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MODEL_DETAILS.map((model) => (
          <Card key={model.name} hover className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: model.color }}
              />
              <h3 className="text-lg font-semibold text-white">{model.name}</h3>
              <span className="text-sm px-2 py-0.5 rounded-full bg-white/10 text-gray-400">
                {model.weight}
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-3">{model.description}</p>
            <p className="text-xs text-gray-500 mb-2">Architecture:</p>
            <p className="text-xs text-gray-400 mb-3">{model.architecture}</p>
            <ul className="space-y-1">
              {model.layers.map((layer, i) => (
                <li key={i} className="text-xs text-gray-500 flex items-center gap-2">
                  <span className="text-brand-accent">→</span>
                  {layer}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
}
