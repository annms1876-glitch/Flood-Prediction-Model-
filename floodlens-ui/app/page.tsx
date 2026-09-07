import { RiskGauge } from "@/components/dashboard/RiskGauge";
import { SensorCard } from "@/components/dashboard/SensorCard";
import { AlertFeed } from "@/components/dashboard/AlertFeed";
import { QuickStats } from "@/components/dashboard/QuickStats";
import { RiskLegend } from "@/components/dashboard/RiskLegend";
import { getRiskScore } from "@/lib/api/backendClient";
import { getLatestSensors } from "@/lib/api/backendClient";

export default async function Home() {
  const riskData = await getRiskScore().catch(() => null);
  const sensors = await getLatestSensors().catch(() => []);

  return (
    <div className="space-y-6 animate-slide-in">
      <div>
        <h1 className="text-3xl font-bold text-white">
          FloodLens <span className="text-brand-accent">Umeed AI</span>
        </h1>
        <p className="text-gray-400 mt-1">
          AI-Powered Flood Prediction & Early Warning System
        </p>
      </div>

      <RiskLegend />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 card-glass rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Current Risk
          </h2>
          <RiskGauge
            score={riskData?.risk_score ?? 0}
            level={riskData?.risk_level ?? "normal"}
          />
          <p className="text-center text-sm text-gray-400 mt-2">
            {riskData?.risk_level?.toUpperCase() ?? "NORMAL"}
          </p>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <QuickStats />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sensors.slice(0, 4).map((sensor: any) => (
              <SensorCard key={sensor.location} sensor={sensor} />
            ))}
          </div>
        </div>
      </div>

      <div className="card-glass rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Recent Alerts
        </h2>
        <AlertFeed maxItems={5} />
      </div>
    </div>
  );
}
