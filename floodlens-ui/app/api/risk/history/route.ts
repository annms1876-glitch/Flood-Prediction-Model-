import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const hours = parseInt(searchParams.get("hours") || "24", 10);

  const points = [];
  const now = Date.now();
  const stepMs = (hours * 3600 * 1000) / 24;

  const baseLevels = [
    22, 24, 25, 27, 30, 35, 42, 54, 68, 80, 89, 87, 84, 80, 78, 76, 75, 76, 78, 80, 82, 80, 78, 76
  ];

  for (let i = 0; i < 24; i++) {
    const t = new Date(now - (23 - i) * stepMs);
    const score = baseLevels[i % baseLevels.length];
    points.push({
      timestamp: t.toISOString(),
      time_label: `${String(t.getHours()).padStart(2, "0")}:00`,
      risk_score: score,
      water_level_m: Number((1.2 + (score / 100) * 2.6).toFixed(2)),
      precipitation_mm: Number(((score > 50 ? score * 0.4 : 2)).toFixed(1)),
      soil_saturation_pct: Math.min(95, 30 + Math.round(score * 0.6)),
    });
  }

  return NextResponse.json({
    location: "solan_valley_hp",
    hours_requested: hours,
    points,
    peak_risk: {
      time: "15:00",
      score: 89,
      level: "warning",
    },
    current: {
      score: 76,
      level: "watch",
    }
  });
}
