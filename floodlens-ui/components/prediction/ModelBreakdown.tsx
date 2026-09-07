"use client";

import { PredictionResponse } from "@/lib/types";
import { ML_MODEL_WEIGHTS } from "@/lib/constants";
import { EnsembleChart } from "@/components/dashboard/EnsembleChart";

interface ModelBreakdownProps {
  prediction: PredictionResponse;
}

export function ModelBreakdown({ prediction }: ModelBreakdownProps) {
  if (!prediction.models) return null;

  const predictions = {
    lstm: prediction.models.lstm?.prediction || 0,
    xgboost: prediction.models.xgboost?.prediction || 0,
    gnn: prediction.models.gnn?.prediction || 0,
    pinn: prediction.models.pinn?.prediction || 0,
  };

  return (
    <div className="card-glass rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white mb-4">
        Ensemble Breakdown
      </h3>
      <EnsembleChart predictions={predictions} />
      <div className="mt-4 pt-4 border-t border-white/5">
        <p className="text-xs text-gray-500">
          Formula: LSTM×0.4 + XGBoost×0.3 + GNN×0.2 + PINN×0.1
        </p>
      </div>
    </div>
  );
}
