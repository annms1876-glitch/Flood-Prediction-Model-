import { NextResponse } from "next/server";
import { getModelInfo } from "@/lib/data/floodEngine";

export async function GET() {
  return NextResponse.json(getModelInfo());
}
