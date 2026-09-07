import { Alert } from "@/lib/types";
import { getRiskBadgeClass } from "@/lib/utils";

interface AlertFeedProps {
  maxItems?: number;
}

const mockAlerts: Alert[] = [
  { id: "1", location: "hill_station_1", severity: "critical", message: "Critical flood risk detected — evacuation recommended", status: "sent", timestamp: new Date().toISOString() },
  { id: "2", location: "village_a", severity: "high", message: "Water levels rising rapidly", status: "delivered", timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: "3", location: "village_b", severity: "warning", message: "Soil moisture above threshold", status: "sent", timestamp: new Date(Date.now() - 7200000).toISOString() },
];

export function AlertFeed({ maxItems = 10 }: AlertFeedProps) {
  const alerts = mockAlerts.slice(0, maxItems);

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <div key={alert.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
          <span className={`w-2 h-2 rounded-full shrink-0 ${
            alert.severity === "critical" ? "bg-red-500" :
            alert.severity === "high" ? "bg-red-400" :
            alert.severity === "warning" ? "bg-orange-400" :
            alert.severity === "watch" ? "bg-yellow-400" : "bg-green-400"
          }`} />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white truncate">{alert.message}</p>
            <p className="text-xs text-gray-500">
              {alert.location} • {new Date(alert.timestamp).toLocaleTimeString()}
            </p>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full ${getRiskBadgeClass(alert.severity)}`}>
            {alert.severity}
          </span>
        </div>
      ))}
    </div>
  );
}
