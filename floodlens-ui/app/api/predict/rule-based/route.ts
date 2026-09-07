import { NextRequest, NextResponse } from "next/server";
import { calculateEnsemblePrediction } from "@/lib/data/floodEngine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prediction = calculateEnsemblePrediction({
      location: body.location || "Regional Monitoring",
      readings: body.readings || [],
    });
    return NextResponse.json(prediction);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
