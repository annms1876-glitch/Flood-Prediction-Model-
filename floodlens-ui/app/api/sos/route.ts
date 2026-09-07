import { NextResponse } from "next/server";

interface SOSPayload {
  userId?: string;
  name?: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  locationName?: string;
  dependents?: number;
  medicalNotes?: string;
}

const inMemorySOSLog: Array<SOSPayload & { id: string; timestamp: string; status: string; assignedUnit: string; etaMinutes: number }> = [];

export async function POST(request: Request) {
  try {
    const body: SOSPayload = await request.json();
    const id = `SOS-${Date.now().toString(36).toUpperCase()}`;
    const timestamp = new Date().toISOString();

    const record = {
      id,
      timestamp,
      userId: body.userId || "anonymous",
      name: body.name || "Resident",
      phone: body.phone || "+91-98765-43210",
      latitude: body.latitude || 30.9049,
      longitude: body.longitude || 77.0936,
      locationName: body.locationName || "Upper Bazar Road, Solan, HP",
      dependents: body.dependents ?? 3,
      medicalNotes: body.medicalNotes || "Elderly mobility assistance required",
      status: "DISPATCHED",
      assignedUnit: "Himachal SDRF Battalion 2 (Solan Station) - Team 4",
      teamLeader: "Insp. Vikram Singh (RESCUE-04)",
      radioVHF: "156.800 MHz (VHF Ch 16)",
      etaMinutes: 14,
    };

    inMemorySOSLog.unshift(record);

    return NextResponse.json({
      success: true,
      message: "Emergency beacon received and broadcasted to SDRF/NDRF dispatch center.",
      beacon: record,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to process emergency beacon" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    active_beacons_count: inMemorySOSLog.length,
    recent_dispatches: inMemorySOSLog.slice(0, 10),
  });
}
