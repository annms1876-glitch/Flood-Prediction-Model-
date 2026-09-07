"use client";

import { useEffect, useState } from "react";
import { BellRing, CheckCircle2, Volume2 } from "lucide-react";
import { listenForForegroundFloodAlerts, playEmergencySiren, registerFloodPushToken, speakFloodAlert } from "@/lib/notifications";

export function EmergencyAlertPermission() {
  const [status, setStatus] = useState<"unknown" | "enabled" | "denied" | "error">("unknown");
  const [message, setMessage] = useState("");
  useEffect(() => { if (typeof Notification !== "undefined" && Notification.permission === "granted") setStatus("enabled"); }, []);
  useEffect(() => { let unsubscribe: (() => void) | undefined; void listenForForegroundFloodAlerts((data) => { if (data.type === "voice_alert") { void playEmergencySiren(); speakFloodAlert(data.voiceText || data.body || "Critical flood alert. Check Umeed AI now."); } }).then((fn) => { unsubscribe = fn; }); return () => unsubscribe?.(); }, []);
  async function enable() { try { await registerFloodPushToken(); setStatus("enabled"); setMessage("Emergency notifications are enabled on this device."); } catch (error) { setStatus(Notification.permission === "denied" ? "denied" : "error"); setMessage(error instanceof Error ? error.message : "Unable to enable notifications."); } }
  return <section className="rounded-2xl border border-[#e3dfd5] bg-[#fffdf8] p-4 shadow-[0_4px_8px_rgba(38,27,7,.06)]"><div className="flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f8da9d] text-[#261b07]"><BellRing className="h-5 w-5" /></div><div className="flex-1"><h3 className="text-sm font-semibold text-[#261b07]">Enable emergency flood alerts</h3><p className="mt-1 text-xs leading-relaxed text-[#61594a]">Receive an operating-system notification when Umeed AI broadcasts a critical flood alert, even when this page is not focused.</p>{status === "enabled" ? <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-[#6f8d54]"><CheckCircle2 className="h-4 w-4" />{message || "Notifications enabled"}</p> : <button onClick={enable} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#f9a600] px-3 py-2 text-xs font-semibold text-[#261b07]"><Volume2 className="h-3.5 w-3.5" />Enable alerts</button>}{message && status !== "enabled" && <p className="mt-2 text-xs text-[#d94b3b]">{message}</p>}{status === "denied" && <p className="mt-2 text-[11px] text-[#8f897e]">Allow notifications in your browser settings, then try again.</p>}</div></div></section>;
}
