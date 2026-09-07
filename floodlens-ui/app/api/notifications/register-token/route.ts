import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export async function POST(request: Request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    const decoded = await adminAuth.verifyIdToken(token);
    const body = await request.json();
    if (!body.token) return NextResponse.json({ error: "Push token required" }, { status: 400 });
    await adminDb.collection("pushSubscriptions").doc(decoded.uid).set({ uid: decoded.uid, email: decoded.email || "", token: body.token, platform: body.platform || "web", updatedAt: new Date().toISOString() }, { merge: true });
    return NextResponse.json({ registered: true });
  } catch (error) {
    console.error("Push token registration failed", error);
    return NextResponse.json({ error: "Unable to register push token" }, { status: 401 });
  }
}
