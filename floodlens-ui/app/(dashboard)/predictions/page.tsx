"use client";

import { PredictionForm } from "@/components/prediction/PredictionForm";
import { PredictionResult } from "@/components/prediction/PredictionResult";
import { ModelBreakdown } from "@/components/prediction/ModelBreakdown";
import { usePredictionStore } from "@/lib/store/predictionStore";
import { PredictionResponse } from "@/lib/types";

export default function PredictionPage() {
  const { currentPrediction, predictionHistory } = usePredictionStore();

  return (
    <div className="space-y-6 animate-slide-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Flood Prediction</h1>
        <p className="text-gray-400 mt-1">
          Enter sensor readings to get AI-powered flood risk prediction
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-glass rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Sensor Inputs
          </h2>
          <PredictionForm />
        </div>

        <div className="space-y-4">
          {currentPrediction ? (
            <>
              <div className="card-glass rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">
                  Results
                </h2>
                <PredictionResult prediction={currentPrediction} />
              </div>
              <ModelBreakdown prediction={currentPrediction} />
            </>
          ) : (
            <div className="card-glass rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Results
              </h2>
              <p className="text-sm text-gray-500">
                Run a prediction to see results here
              </p>
            </div>
          )}

          {predictionHistory.length > 0 && (
            <div className="card-glass rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                History
              </h2>
              <div className="space-y-2">
                {predictionHistory.map((pred: PredictionResponse, i: number) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded bg-white/5">
                    <span className="text-sm text-white">{pred.location}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full badge-risk-${pred.risk_level}`}>
                      {pred.risk_level} ({Math.round(pred.risk_score)})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
