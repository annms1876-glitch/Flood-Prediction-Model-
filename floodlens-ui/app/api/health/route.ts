import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    predictor_loaded: true,
    version: "2.1.0",
    timestamp: new Date().toISOString(),
  });
}
