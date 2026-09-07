"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Send,
  Radio,
  CheckCircle2,
  Clock,
  FileText,
  Volume2,
  Users,
  ShieldAlert,
  Smartphone,
  MessageSquare,
  RefreshCw,
} from "lucide-react";

interface BroadcastLog {
  id: string;
  timestamp: string;
  eventType: string;
  severity: "EXTREME" | "SEVERE" | "MODERATE";
  headline: string;
  targetArea: string;
  channels: string[];
  sentCount: number;
  ackRatePct: number;
}

export default function AlertManagementPage() {
  const [eventType, setEventType] = useState("Flash Flood Inundation");
  const [severity, setSeverity] = useState<"EXTREME" | "SEVERE" | "MODERATE">("EXTREME");
  const [urgency, setUrgency] = useState("Immediate");
  const [targetArea, setTargetArea] = useState("Solan River Basin & Lowland Sector 4-9");
  const [headlineEn, setHeadlineEn] = useState(
    "FLASH SURGE IMMINENT — EVACUATE LOWER BASIN TO HIGH GROUND IMMEDIATELY"
  );
  const [instructionHi, setInstructionHi] = useState(
    "नदी का जलस्तर तेजी से बढ़ रहा है। निचले इलाके तुरंत खाली कर पहाड़ी मार्ग से मॉडल स्कूल की ओर जाएं।"
  );

  const [channels, setChannels] = useState<Record<string, boolean>>({
    sms: true,
    siren: true,
    app: true,
    whatsapp: true,
    loudspeaker: false,
  });

  const [isSending, setIsSending] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const [history, setHistory] = useState<BroadcastLog[]>([
    {
      id: "CAP-HP-2026-0814",
      timestamp: new Date(Date.now() - 35 * 60000).toISOString(),
      eventType: "Flash Flood Surge",
      severity: "EXTREME",
      headline: "Flash Surge Crest Predicted in 25 min — Evacuate Lower Khad Basin",
      targetArea: "Solan Sector 4 & Central Basin",
      channels: ["Cell SMS", "Mountain Siren", "App Push"],
      sentCount: 3420,
      ackRatePct: 89,
    },
    {
      id: "CAP-HP-2026-0813",
      timestamp: new Date(Date.now() - 140 * 60000).toISOString(),
      eventType: "Cloudburst Influx Alert",
      severity: "SEVERE",
      headline: "Upper catchment recorded 48mm rainfall in 1hr. Stay vigilant.",
      targetArea: "Solan Valley & Saproon Tributary",
      channels: ["Cell SMS", "App Push"],
      sentCount: 5120,
      ackRatePct: 76,
    },
  ]);

  const toggleChannel = (ch: string) => {
    setChannels({ ...channels, [ch]: !channels[ch] });
  };

  const handleBroadcast = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      const newEntry: BroadcastLog = {
        id: `CAP-HP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toISOString(),
        eventType,
        severity,
        headline: headlineEn,
        targetArea,
        channels: Object.entries(channels)
          .filter(([, v]) => v)
          .map(([k]) => k.toUpperCase()),
        sentCount: 3420,
        ackRatePct: 92,
      };
      setHistory([newEntry, ...history]);
      showToast("CAP Broadcast Dispatched via all selected channels!");
    }, 1200);
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 p-4 rounded-xl bg-cyan-600 text-white shadow-2xl flex items-center gap-3 border border-cyan-400/40 animate-slide-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <span className="uppercase tracking-wider">Common Alerting Protocol (ITU-T X.1303)</span>
            <span className="text-slate-600">•</span>
            <span>CAP v1.2 Standard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Emergency Alert &amp; CAP Broadcast Studio
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => showToast("Sounded 5-second diagnostic chirp on Mountain Siren Tower 1 & 2.")}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition"
          >
            <Volume2 className="w-4 h-4 text-amber-400" />
            <span>Test Siren (5s Pulse)</span>
          </button>
          <Link
            href="/admin-dashboard"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition"
          >
            <span>← Command Center</span>
          </Link>
        </div>
      </div>

      {/* 2-Column Broadcast Composer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Composer Form (7 Cols) */}
        <div className="lg:col-span-7 rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">CAP Alert Authoring Console</h2>
              <p className="text-xs text-slate-400">
                Compose disaster alert payload to broadcast simultaneously across all regional networks
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            {/* Row 1: Event Type & Urgency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Event Category</label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium focus:outline-none focus:border-cyan-500"
                >
                  <option value="Flash Flood Inundation">Flash Flood Inundation</option>
                  <option value="Cloudburst Inflow">Cloudburst Inflow</option>
                  <option value="Debris Flow / Landslide">Debris Flow / Landslide</option>
                  <option value="Dam Sluice Spillway Open">Dam Sluice Spillway Open</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Urgency</label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium focus:outline-none focus:border-cyan-500"
                >
                  <option value="Immediate">Immediate (Take action now)</option>
                  <option value="Expected">Expected (Within 1 hour)</option>
                  <option value="Future">Future (Monitor conditions)</option>
                </select>
              </div>
            </div>

            {/* Severity Pill Selector */}
            <div>
              <label className="font-semibold text-slate-300 block mb-1.5">CAP Severity Tier</label>
              <div className="grid grid-cols-3 gap-2 font-mono">
                {(["EXTREME", "SEVERE", "MODERATE"] as const).map((sev) => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setSeverity(sev)}
                    className={`py-2 rounded-xl font-bold text-xs transition ${
                      severity === sev
                        ? sev === "EXTREME"
                          ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30"
                          : sev === "SEVERE"
                          ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30"
                          : "bg-cyan-600 text-white"
                        : "bg-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Geofence Area */}
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Target Geofence Zone</label>
              <input
                type="text"
                value={targetArea}
                onChange={(e) => setTargetArea(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* English Headline */}
            <div>
              <label className="font-semibold text-slate-300 block mb-1">
                English Alert Headline (Max 120 chars)
              </label>
              <textarea
                rows={2}
                value={headlineEn}
                onChange={(e) => setHeadlineEn(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Hindi Instructions */}
            <div>
              <label className="font-semibold text-slate-300 block mb-1">
                Hindi Action Instructions (हिंदी निर्देश)
              </label>
              <textarea
                rows={2}
                value={instructionHi}
                onChange={(e) => setInstructionHi(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Distribution Channels Checkboxes */}
            <div className="space-y-2 pt-1">
              <label className="font-semibold text-slate-300 block">
                Active Multi-Channel Transmitters:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { key: "sms", label: "Cell Broadcast SMS (3,420 phones)", icon: Smartphone },
                  { key: "siren", label: "120dB Mountain Siren Towers (x2)", icon: Volume2 },
                  { key: "app", label: "FloodShield Mobile App Push", icon: Smartphone },
                  { key: "whatsapp", label: "Panchayat WhatsApp Broadcast", icon: MessageSquare },
                  { key: "loudspeaker", label: "SDRF Loudspeaker Patrol Vans", icon: Volume2 },
                ].map((item) => {
                  const active = channels[item.key];
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => toggleChannel(item.key)}
                      className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2.5 ${
                        active
                          ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-200 font-semibold"
                          : "bg-slate-800/40 border-slate-700/60 text-slate-400"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 text-[10px] ${
                          active ? "bg-cyan-500 border-cyan-400 text-slate-950 font-bold" : "border-slate-600"
                        }`}
                      >
                        {active && "✓"}
                      </div>
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dispatch Button */}
            <button
              id="dispatch-cap-alert-action-btn"
              type="button"
              onClick={handleBroadcast}
              disabled={isSending}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs shadow-xl shadow-rose-600/30 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{isSending ? "Transmitting Emergency Protocol..." : "AUTHORIZE & TRANSMIT CAP BROADCAST"}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Broadcast History & Device Reach (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Audience Reach Metric */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
              Total Emergency Geo-Audience
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white font-mono">3,420</span>
              <span className="text-xs text-cyan-400 font-mono font-bold">Devices Reached</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-slate-800">
              <div>
                <span className="text-slate-400 block text-[10px]">Aadhaar / PDS Registered</span>
                <span className="text-white font-bold">2,890 Sim Cards</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">App Geofence Active</span>
                <span className="text-white font-bold">530 Users</span>
              </div>
            </div>
          </div>

          {/* Historical Log */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Broadcast Transmission Log</span>
            </h3>

            <div className="space-y-3">
              {history.map((log) => (
                <div
                  key={log.id}
                  className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-cyan-400 font-bold">{log.id}</span>
                    <span
                      className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                        log.severity === "EXTREME"
                          ? "bg-rose-500/20 text-rose-400"
                          : "bg-amber-500/20 text-amber-400"
                      }`}
                    >
                      {log.severity}
                    </span>
                  </div>

                  <p className="font-semibold text-white leading-relaxed">{log.headline}</p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-700/50 font-mono">
                    <span>Reach: {log.sentCount} recipients</span>
                    <span className="text-emerald-400 font-bold">{log.ackRatePct}% Acknowledged</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
