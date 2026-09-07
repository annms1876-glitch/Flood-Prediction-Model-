import { NextResponse } from "next/server";
import { getCurrentRisk } from "@/lib/data/floodEngine";

export async function GET() {
  return NextResponse.json(getCurrentRisk());
}
