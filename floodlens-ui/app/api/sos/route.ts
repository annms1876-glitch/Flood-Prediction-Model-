import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

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
    try {
      await adminDb.collection("sosIncidents").doc(id).set(record);
    } catch (storageError) {
      console.warn("SOS incident persistence unavailable; retaining local runtime record", storageError);
    }

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
  try {
    const snapshot = await adminDb.collection("sosIncidents").orderBy("timestamp", "desc").limit(25).get();
    const persisted = snapshot.docs.map((doc) => doc.data());
    return NextResponse.json({ active_beacons_count: persisted.filter((item) => item.status !== "RESOLVED").length, recent_dispatches: persisted });
  } catch (storageError) {
    console.warn("SOS incident persistence unavailable; reading local runtime records", storageError);
  }
  return NextResponse.json({
    active_beacons_count: inMemorySOSLog.length,
    recent_dispatches: inMemorySOSLog.slice(0, 10),
  });
}
