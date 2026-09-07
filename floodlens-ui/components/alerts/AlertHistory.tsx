"use client";

import { Alert } from "@/lib/types";
import { cn, getRiskBadgeClass } from "@/lib/utils";

interface AlertHistoryProps {
  alerts: Alert[];
}

export function AlertHistory({ alerts }: AlertHistoryProps) {
  if (alerts.length === 0) {
    return (
      <p className="text-sm text-gray-500 text-center py-4">
        No alerts yet
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {alerts.map((alert) => (
        <div key={alert.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
          <span className={`w-2 h-2 rounded-full shrink-0 ${
            alert.severity === "critical" ? "bg-red-500" :
            alert.severity === "high" ? "bg-red-400" :
            alert.severity === "warning" ? "bg-orange-400" :
            alert.severity === "watch" ? "bg-yellow-400" : "bg-green-400"
          }`} />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white truncate">{alert.message}</p>
            <p className="text-xs text-gray-500">{alert.location}</p>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full ${getRiskBadgeClass(alert.severity)}`}>
            {alert.severity}
          </span>
          <span className="text-xs text-gray-600">{alert.status}</span>
        </div>
      ))}
    </div>
  );
}
