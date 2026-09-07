import { NextResponse } from "next/server";
import { getAllScenarios, getDemoPrediction } from "@/lib/data/floodEngine";

export async function POST() {
  const scenarios = getAllScenarios();
  const results = scenarios.map((s) => getDemoPrediction(s.key));
  return NextResponse.json({ results });
}
