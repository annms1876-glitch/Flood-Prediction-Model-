import { NextResponse } from "next/server";
import { getAllScenarios } from "@/lib/data/floodEngine";

export async function GET() {
  return NextResponse.json({ scenarios: getAllScenarios() });
}
