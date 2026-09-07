import { NextResponse } from "next/server";

export async function GET() {
  const routes = [
    {
      id: "A",
      name: "Route A - Upper Ridge Road",
      recommendationTier: "RECOMMENDED",
      distance_km: 2.3,
      estimated_time_min: 18,
      elevation_gain_m: 45,
      elevation_loss_m: 12,
      safety_score_pct: 85,
      crowd_count: 12,
      condition: "Dry Crest Path • Paved Surface",
      shelter: {
        name: "Govt Model High School Solan",
        capacity_total: 600,
        capacity_current: 450,
        elevation_m: 1525,
        clearance_above_hfl_m: 45,
      },
      turn_by_turn: [
        {
          step: 1,
          instruction: "Walk north on Main Village Road",
          distance: "500m",
          note: "Stay on paved road; ignore downhill alleyways towards stream.",
        },
        {
          step: 2,
          instruction: "Turn left at Stone Temple gate",
          distance: "300m",
          note: "Ascend masonry ramp on elevated path (+22m elevation).",
        },
        {
          step: 3,
          instruction: "Cross elevated Ridge Footbridge",
          distance: "Caution",
          note: "Check handrails; sits 8m above baseline flood level. Move in single file.",
        },
        {
          step: 4,
          instruction: "Continue straight into Solan Relief Shelter compound",
          distance: "1.5km to Gate",
          note: "First aid triage, hot dry rations, and district sat-phone in Block B.",
        },
      ],
    },
    {
      id: "B",
      name: "Route B - Temple Hill Trail",
      recommendationTier: "ALTERNATIVE HIGH ROAD",
      distance_km: 3.1,
      estimated_time_min: 25,
      elevation_gain_m: 70,
      elevation_loss_m: 5,
      safety_score_pct: 92,
      crowd_count: 4,
      condition: "Rough Boulder Alpine Terrain",
      shelter: {
        name: "Govt Degree College Hill Ground",
        capacity_total: 500,
        capacity_current: 320,
        elevation_m: 1620,
        clearance_above_hfl_m: 90,
      },
      turn_by_turn: [
        {
          step: 1,
          instruction: "Take stone staircase behind Shiva Temple",
          distance: "400m",
          note: "Steep initial gradient.",
        },
        {
          step: 2,
          instruction: "Follow western pine forest ridge trail",
          distance: "1.8km",
          note: "Completely safe from flash surge water.",
        },
        {
          step: 3,
          instruction: "Reach Degree College sports pavilion",
          distance: "900m",
          note: "Relief tents and helipad active.",
        },
      ],
    },
    {
      id: "C",
      name: "Route C - Riverside Bypass (AVOID)",
      recommendationTier: "HAZARDOUS_BLOCKED",
      distance_km: 1.8,
      estimated_time_min: 12,
      elevation_gain_m: 0,
      elevation_loss_m: 15,
      safety_score_pct: 45,
      crowd_count: 0,
      condition: "IMPASSABLE • 1.8m Water Inundation Surge",
      warning: "Submerged hazard detected at km 0.9. Active flash flood surge.",
    },
  ];

  return NextResponse.json({
    status: "active",
    user_location: "Solan Sector 4 (30.9049° N, 77.0936° E)",
    routes,
  });
}
