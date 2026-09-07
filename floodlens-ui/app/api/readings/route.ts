import { NextRequest, NextResponse } from "next/server";
import { getSensorReadings } from "@/lib/data/floodEngine";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "100", 10);
  const data = getSensorReadings(limit);
  return NextResponse.json({ data, count: data.length });
}
