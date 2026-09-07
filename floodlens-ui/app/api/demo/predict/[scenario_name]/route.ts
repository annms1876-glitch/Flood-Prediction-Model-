import { NextRequest, NextResponse } from "next/server";
import { getDemoPrediction } from "@/lib/data/floodEngine";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ scenario_name: string }> }
) {
  const { scenario_name } = await params;
  const prediction = getDemoPrediction(scenario_name);
  return NextResponse.json(prediction);
}
