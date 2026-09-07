import { NextResponse } from "next/server";

export async function GET() {
  const regions = [
    {
      id: "HP-MANDI-04",
      name: "Pandoh Valley, Mandi",
      state: "Himachal Pradesh",
      basin: "Beas Main Basin",
      elevation_m: 850,
      risk_score: 92,
      tier: "EVACUATE",
      water_level_m: 6.8,
      danger_level_m: 4.2,
      sensors_active: 12,
      evacuees_count: 847,
      status: "Evacuation in progress",
    },
    {
      id: "UK-DHAR-02",
      name: "Dharamshala North",
      state: "Himachal Pradesh",
      basin: "Kangra Ridge",
      elevation_m: 1450,
      risk_score: 88,
      tier: "EVACUATE",
      water_level_m: 5.1,
      danger_level_m: 3.8,
      sensors_active: 8,
      evacuees_count: 520,
      status: "Bhagsunag Evac Active",
    },
    {
      id: "UK-CHAM-07",
      name: "Joshimath Lower Basin",
      state: "Uttarakhand",
      basin: "Alaknanda Upper",
      elevation_m: 1890,
      risk_score: 85,
      tier: "WARNING",
      water_level_m: 4.3,
      danger_level_m: 3.1,
      sensors_active: 9,
      evacuees_count: 310,
      status: "Gate 4 Diverted",
    },
    {
      id: "HP-SOLAN-01",
      name: "Solan Giri Catchment",
      state: "Himachal Pradesh",
      basin: "Yamuna Basin Feed",
      elevation_m: 1500,
      risk_score: 76,
      tier: "WATCH",
      water_level_m: 2.34,
      danger_level_m: 3.5,
      sensors_active: 6,
      evacuees_count: 140,
      status: "Sirens Pre-Armed",
    },
    {
      id: "SK-TEESTA-02",
      name: "Teesta Upper Valley",
      state: "Sikkim",
      basin: "North Zone",
      elevation_m: 2100,
      risk_score: 79,
      tier: "WARNING",
      water_level_m: 3.9,
      danger_level_m: 3.4,
      sensors_active: 6,
      evacuees_count: 234,
      status: "Glacial Lake Runoff",
    }
  ];

  return NextResponse.json({
    summary: {
      total_locations: 1247,
      at_risk_watch: 342,
      crest_warning: 87,
      immediate_evacuate: 23,
      displaced_souls: 14820,
      sensor_network: {
        online: 847,
        warning: 234,
        offline: 12,
        calibrating: 154,
        total: 1247,
      }
    },
    regions,
  });
}
