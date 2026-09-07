import { NextRequest, NextResponse } from "next/server";
import { getAlerts, addAlert } from "@/lib/data/floodEngine";

export async function GET() {
  const data = getAlerts();
  return NextResponse.json({ data, count: data.length });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const alert = addAlert({
      id: `alt-${Date.now()}`,
      location: body.location || "Unknown Location",
      severity: body.severity || "warning",
      message: body.message || "Alert generated",
      status: "sent",
      timestamp: new Date().toISOString(),
    });
    return NextResponse.json({ success: true, alert });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
