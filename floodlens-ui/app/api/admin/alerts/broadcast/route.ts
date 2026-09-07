import { NextResponse } from "next/server";
import { adminAuth, adminDb, adminMessaging } from "@/lib/firebase/admin";

const ADMIN_EMAIL = "somenbarik75@gmail.com";

export async function POST(request: Request) {
  try {
    const idToken = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!idToken) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    const admin = await adminAuth.verifyIdToken(idToken);
    if (admin.email !== ADMIN_EMAIL) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    const body = await request.json();
    if (!body.title || !body.body || !body.severity) return NextResponse.json({ error: "title, body and severity are required" }, { status: 400 });
    const snapshot = await adminDb.collection("pushSubscriptions").get();
    const tokens = snapshot.docs.map((doc) => doc.data().token).filter(Boolean);
    const alertId = body.alertId || crypto.randomUUID();
    if (!tokens.length) return NextResponse.json({ alertId, sent: 0, failed: 0, message: "No registered devices yet." });
    const result = await adminMessaging.sendEachForMulticast({ tokens, notification: { title: body.title, body: body.body }, data: { alertId, type: body.type || "voice_alert", severity: body.severity, voiceText: body.body, url: "/alert-management" }, webpush: { notification: { title: body.title, body: body.body, icon: "/logo.svg", requireInteraction: body.severity === "extreme" }, fcmOptions: { link: "/alert-management" } } });
    return NextResponse.json({ alertId, sent: result.successCount, failed: result.failureCount });
  } catch (error) {
    console.error("Flood alert broadcast failed", error);
    return NextResponse.json({ error: "Unable to broadcast alert" }, { status: 502 });
  }
}
