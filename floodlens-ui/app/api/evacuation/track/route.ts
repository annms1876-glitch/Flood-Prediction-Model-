import { NextResponse } from "next/server";

const evacuationLedger = [
  {
    time: "10:15:23",
    type: "CAMP_CHECK_IN",
    description: "12 people (Ward 4) arrived safely at Solan Relief Camp via Route A.",
    details: "Transit corridor completed without distress. Medical triage initiated.",
    sector: "Solan Sector",
  },
  {
    time: "10:12:45",
    type: "TRANSIT_DEPLOYED",
    description: "8 people started evacuation from Upper Bazar via Route B.",
    details: "Accompanied by Village Warden Rajesh Negi. VHF Radio Channel 4 active.",
    sector: "Convoy #18",
  },
  {
    time: "10:10:02",
    type: "TACTICAL_AIRLIFT",
    description: "15 people safely airlifted by SDRF helicopter near Giri crossing.",
    details: "High-risk valley island rescued due to fast rising tributary flash waters. Inbound to Shimla LZ.",
    sector: "Helo Alpha-1",
  },
  {
    time: "10:06:14",
    type: "AERIAL_RECON_PASS",
    description: "Drone Recon Unit 03 verified Route A clear of fallen boulders.",
    details: "Thermal & LiDAR flight pass over km 0.8 - km 4.2 confirmed structural integrity of culverts.",
    sector: "UAV-FLIR-3",
  },
];

export async function GET() {
  return NextResponse.json({
    mission_kpis: {
      identified_at_risk: 5432,
      evacuated_to_shelters: 4891,
      in_transit_active: 541,
      safety_success_rate: 97.2,
      completion_percentage: 90.0,
      active_convoys: 18,
    },
    shelters: [
      {
        name: "Solan High School Campus",
        current: 450,
        capacity: 600,
        pct: 75.0,
        status: "SAFE HAVEN (75% CAPACITY)",
      },
      {
        name: "Mandi Indoor Stadium",
        current: 1000,
        capacity: 1000,
        pct: 100.0,
        status: "FULL (100% AT CAPACITY)",
      },
      {
        name: "Shimla Community Hall",
        current: 320,
        capacity: 500,
        pct: 64.0,
        status: "ACCEPTING (36% VACANT)",
      },
    ],
    ledger: evacuationLedger,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const entry = {
      time: new Date().toLocaleTimeString(),
      type: body.type || "STATUS_UPDATE",
      description: body.description || "Evacuation update recorded",
      details: body.details || "",
      sector: body.sector || "Field Unit",
    };
    evacuationLedger.unshift(entry);
    return NextResponse.json({ success: true, entry });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
