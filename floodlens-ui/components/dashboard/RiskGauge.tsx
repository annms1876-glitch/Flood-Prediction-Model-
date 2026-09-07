import { cn, getRiskColor } from "@/lib/utils";

interface RiskGaugeProps {
  score: number;
  level: string;
  size?: number;
}

export function RiskGauge({ score, level, size = 160 }: RiskGaugeProps) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const percent = Math.min(Math.max(score, 0), 100);
  const offset = circumference - (percent / 100) * circumference;
  const color = getRiskColor(level);

  return (
    <div className="flex flex-col items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="12"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth="12"
          fill="none"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="gauge-ring"
          style={{ filter: `drop-shadow(0 0 8px ${color}40)` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
        <span className="text-3xl font-bold" style={{ color }}>
          {Math.round(score)}
        </span>
        <span className="text-xs text-gray-500 mt-1">/ 100</span>
      </div>
    </div>
  );
}
