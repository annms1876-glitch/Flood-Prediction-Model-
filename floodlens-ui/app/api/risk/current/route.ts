import { NextResponse } from "next/server";
import { getRiskScore } from "@/lib/data/floodEngine";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get("location") || "solan_sector_4";

  const risk = getRiskScore(location);
  return NextResponse.json({
    location,
    location_name: "Solan Valley, Himachal Pradesh",
    elevation_msl: 1550,
    ...risk,
    basin_metrics: {
      water_level_m: 2.34,
      water_level_danger_m: 3.5,
      water_trend: "rising (+0.18m/h)",
      flow_velocity_ms: 3.2,
      precipitation_rate_mmh: 12.5,
      soil_saturation_pct: 65,
      slope_mems_tilt_deg: 0.8,
    },
    active_advisories: [
      {
        id: "ADV-HP-0814",
        tier: "WATCH",
        headline: "Monsoon Upper Catchment Surge Influx",
        issued_at: new Date(Date.now() - 3600000).toISOString(),
      }
    ]
  });
}
