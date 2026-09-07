import { ML_MODEL_WEIGHTS } from "@/lib/constants";

interface EnsembleChartProps {
  predictions: Record<string, number>;
}

export function EnsembleChart({ predictions }: EnsembleChartProps) {
  const models = [
    { key: "lstm", label: "LSTM", weight: ML_MODEL_WEIGHTS.lstm },
    { key: "xgboost", label: "XGBoost", weight: ML_MODEL_WEIGHTS.xgboost },
    { key: "gnn", label: "GNN", weight: ML_MODEL_WEIGHTS.gnn },
    { key: "pinn", label: "PINN", weight: ML_MODEL_WEIGHTS.pinn },
  ];

  return (
    <div className="space-y-3">
      {models.map((model) => {
        const prediction = predictions[model.key] || 0;
        const contribution = (prediction * model.weight).toFixed(1);
        return (
          <div key={model.key} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">{model.label}</span>
              <span className="text-gray-500">
                {model.weight * 100}% weight • {prediction.toFixed(1)} score
              </span>
            </div>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${prediction}%`,
                  backgroundColor:
                    model.key === "lstm" ? "#3b82f6" :
                    model.key === "xgboost" ? "#22c55e" :
                    model.key === "gnn" ? "#f97316" : "#a855f7",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
