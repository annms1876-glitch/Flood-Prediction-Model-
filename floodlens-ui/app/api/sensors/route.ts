import { NextResponse } from "next/server";
import { getSensors } from "@/lib/data/floodEngine";

export async function GET() {
  const data = getSensors();
  return NextResponse.json({ data, count: data.length });
}
