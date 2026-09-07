import { RISK_LABELS, RISK_COLORS } from "@/lib/constants";

export function RiskLegend() {
  const levels = ["normal", "watch", "warning", "high", "critical"];

  return (
    <div className="flex flex-wrap gap-4">
      {levels.map((level) => (
        <div key={level} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: RISK_COLORS[level] }}
          />
          <span className="text-xs text-gray-400 capitalize">
            {RISK_LABELS[level]}
          </span>
        </div>
      ))}
    </div>
  );
}
