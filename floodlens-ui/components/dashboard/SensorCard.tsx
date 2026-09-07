import { Sensor } from "@/lib/types";
import { getRiskBadgeClass } from "@/lib/utils";

interface SensorCardProps {
  sensor: Sensor;
}

export function SensorCard({ sensor }: SensorCardProps) {
  const riskLevel = (sensor as any).risk_level || "normal";
  const status = (sensor as any).status || "online";

  return (
    <div className="card-glass rounded-lg p-4 hover:bg-white/5 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-white truncate">
          {(sensor as any).location || "Unknown"}
        </span>
        <span className={`w-2 h-2 rounded-full ${status === "online" ? "bg-green-500" : "bg-red-500"}`} />
      </div>
      <div className="flex items-center justify-between">
        <span className={`text-xs px-2 py-0.5 rounded-full ${getRiskBadgeClass(riskLevel)}`}>
          {riskLevel}
        </span>
        <span className="text-xs text-gray-500">
          {(sensor as any).last_updated || "Just now"}
        </span>
      </div>
    </div>
  );
}
