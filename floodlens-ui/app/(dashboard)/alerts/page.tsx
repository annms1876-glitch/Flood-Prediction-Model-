"use client";

import { AlertForm } from "@/components/alerts/AlertForm";
import { AlertHistory } from "@/components/alerts/AlertHistory";
import { usePredictionStore } from "@/lib/store/predictionStore";

export default function AlertsPage() {
  const { alerts } = usePredictionStore();

  return (
    <div className="space-y-6 animate-slide-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Alerts</h1>
        <p className="text-gray-400 mt-1">
          Send and manage flood alerts
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-glass rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Send Alert
          </h2>
          <AlertForm />
        </div>

        <div className="card-glass rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Alert History
          </h2>
          <AlertHistory alerts={alerts} />
        </div>
      </div>
    </div>
  );
}
