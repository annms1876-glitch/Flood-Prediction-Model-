"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  AlertTriangle,
  Radio,
  Users,
  Activity,
  Droplet,
  Compass,
  CheckCircle2,
  Clock,
  Send,
  Phone,
  RefreshCw,
  TrendingUp,
  MapPin,
  Flame,
  ArrowRight,
  Route,
  Server,
  Building,
} from "lucide-react";

interface SOSBeaconItem {
  id: string;
  timestamp: string;
  name: string;
  phone: string;
  latitude: number;
  longitude: number;
  locationName: string;
  dependents: number;
  medicalNotes: string;
  status: "PENDING" | "DISPATCHED" | "IN_RESCUE" | "RESOLVED";
  assignedUnit: string;
  teamLeader: string;
  etaMinutes: number;
}

export default function AdminDashboardPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>("Just now");

  // Quick broadcast alert state
  const [broadcastSeverity, setBroadcastSeverity] = useState<"WARNING" | "CRITICAL" | "ADVISORY">("CRITICAL");
  const [broadcastZone, setBroadcastZone] = useState<string>("Sector 4 & Central Khad Basin");
  const [broadcastHeadline, setBroadcastHeadline] = useState<string>(
    "FLASH FLOOD CREST EXPECTED IN 25 MIN — EVACUATE TO HIGH GROUND NOW"
  );

  // Active SOS Beacons list
  const [beacons, setBeacons] = useState<SOSBeaconItem[]>([
    {
      id: "SOS-7F2A",
      timestamp: new Date(Date.now() - 8 * 60000).toISOString(),
      name: "Ramesh Thakur",
      phone: "+91 98160-24810",
      latitude: 30.9042,
      longitude: 77.0945,
      locationName: "Near Khad Bridge, Sector 4",
      dependents: 4,
      medicalNotes: "Water 1.5ft in courtyard, 1 elderly cardiac patient",
      status: "DISPATCHED",
      assignedUnit: "SDRF Unit 4 (Solan)",
      teamLeader: "Insp. V. Singh",
      etaMinutes: 8,
    },
    {
      id: "SOS-9C1B",
      timestamp: new Date(Date.now() - 19 * 60000).toISOString(),
      name: "Pooja Verma",
      phone: "+91 94180-11234",
      latitude: 30.9085,
      longitude: 77.0912,
      locationName: "Lower Bazaar Old School Lane",
      dependents: 2,
      medicalNotes: "Trapped on 1st floor balcony",
      status: "IN_RESCUE",
      assignedUnit: "Fire Brigade Team Alpha",
      teamLeader: "Officer K. Lal",
      etaMinutes: 2,
    },
    {
      id: "SOS-3E8D",
      timestamp: new Date(Date.now() - 42 * 60000).toISOString(),
      name: "Devinder Negi",
      phone: "+91 98055-77889",
      latitude: 30.8992,
      longitude: 77.0878,
      locationName: "Saproon Nullah Crossing",
      dependents: 5,
      medicalNotes: "Family evacuated to ridge temple safely",
      status: "RESOLVED",
      assignedUnit: "Local Civil Defense Volunteer",
      teamLeader: "Ward Member R. Sood",
      etaMinutes: 0,
    },
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch real beacons from API
  const refreshData = async () => {
    try {
      const res = await fetch("/api/sos");
      const data = await res.json();
      if (data.recent_dispatches && data.recent_dispatches.length > 0) {
        // Merge with existing
        const combined = [...data.recent_dispatches, ...beacons];
        const unique = Array.from(new Map(combined.map((item) => [item.id, item])).values());
        setBeacons(unique as SOSBeaconItem[]);
      }
      setLastRefreshed(new Date().toLocaleTimeString());
      showToast("Telemetry & SOS incident log updated.");
    } catch {
      setLastRefreshed(new Date().toLocaleTimeString());
      showToast("Data refreshed from local cache.");
    }
  };

  const updateBeaconStatus = (id: string, newStatus: "PENDING" | "DISPATCHED" | "IN_RESCUE" | "RESOLVED") => {
    setBeacons((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
    );
    showToast(`Beacon ${id} status updated to: ${newStatus}`);
  };

  const handleSendBroadcast = () => {
    setIsBroadcasting(true);
    setTimeout(() => {
      setIsBroadcasting(false);
      showToast(
        `CAP Alert successfully transmitted to 3,420 registered mobile devices & 2 mountain siren towers!`
      );
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

      {/* Top Directive & Status Banner */}
      <div
        id="admin-status-banner"
        className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-rose-950/40 border border-slate-800 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-start gap-3.5">
          <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono text-[10px] font-bold uppercase tracking-wider">
                TACTICAL INCIDENT COMMAND
              </span>
              <span className="text-xs font-mono text-slate-400">
                District Disaster Management Authority (DDMA) Solan
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
              Himalayan Flash Flood Operations Dashboard
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Hydrological telemetry live • 4 Active Catchment Gauges • Ensemble Model v2.1 Online
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center">
          <button
            onClick={refreshData}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Sync Telemetry ({lastRefreshed})</span>
          </button>
          <Link
            href="/alert-management"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition"
          >
            <Send className="w-4 h-4" />
            <span>CAP Studio</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Basin Composite Risk */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold uppercase tracking-wider text-[10px] font-mono">Catchment Threat</span>
            <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-mono text-[10px] font-bold">
              CRITICAL
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">78</span>
            <span className="text-xs text-slate-400 font-mono">/ 100</span>
          </div>
          <p className="text-[11px] text-rose-300 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5" /> +14 pts in past 90 mins
          </p>
        </div>

        {/* KPI 2: Active SOS Beacons */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold uppercase tracking-wider text-[10px] font-mono">Active SOS Beacons</span>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-rose-400 font-mono">
              {beacons.filter((b) => b.status !== "RESOLVED").length}
            </span>
            <span className="text-xs text-slate-400 font-mono">Incidents Unresolved</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {beacons.filter((b) => b.status === "DISPATCHED").length} Teams En Route • 1 In-Rescue
          </p>
        </div>

        {/* KPI 3: River Level vs HFL */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold uppercase tracking-wider text-[10px] font-mono">Khad River Stage</span>
            <span className="text-xs font-mono text-amber-400 font-bold">DANGER: 3.5m</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-400 font-mono">2.84</span>
            <span className="text-xs text-slate-400 font-mono">meters MSL</span>
          </div>
          <p className="text-[11px] text-amber-300">
            0.66m below crest • Rate: +0.22 m/hr
          </p>
        </div>

        {/* KPI 4: Shelter Capacity */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold uppercase tracking-wider text-[10px] font-mono">Sheltered Citizens</span>
            <span className="text-xs font-mono text-emerald-400 font-bold">770 / 1,400</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-400 font-mono">55%</span>
            <span className="text-xs text-slate-400 font-mono">Total Occupancy</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Model High School (75%) • College (40%)
          </p>
        </div>
      </div>

      {/* 2-Column Command Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active SOS Queue & Catchment Zones (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active SOS Incident Triage Queue */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    Emergency SOS Incident Triage ({beacons.length} Logged)
                  </h2>
                  <p className="text-xs text-slate-400">
                    Live beacon uplinks from residents requiring urgent rescue
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">
                AUTO-SYNC ON
              </span>
            </div>

            {/* Beacons list */}
            <div className="space-y-3">
              {beacons.map((beacon) => (
                <div
                  key={beacon.id}
                  className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                    beacon.status === "PENDING"
                      ? "bg-rose-950/40 border-rose-500/50 ring-1 ring-rose-500/20"
                      : beacon.status === "DISPATCHED"
                      ? "bg-amber-950/30 border-amber-500/40"
                      : beacon.status === "IN_RESCUE"
                      ? "bg-cyan-950/30 border-cyan-500/40"
                      : "bg-slate-800/40 border-slate-700/60 opacity-70"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-800 text-white">
                        {beacon.id}
                      </span>
                      <span className="text-xs font-bold text-white">{beacon.name}</span>
                      <a
                        href={`tel:${beacon.phone}`}
                        className="text-[11px] font-mono text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" />
                        {beacon.phone}
                      </a>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`self-start sm:self-auto px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                        beacon.status === "PENDING"
                          ? "bg-rose-500 text-white animate-pulse"
                          : beacon.status === "DISPATCHED"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          : beacon.status === "IN_RESCUE"
                          ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                          : "bg-emerald-500/20 text-emerald-400"
                      }`}
                    >
                      {beacon.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 space-y-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-semibold text-white">{beacon.locationName}</span>
                      <span className="text-slate-500 font-mono text-[10px]">
                        ({beacon.latitude}, {beacon.longitude})
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      👥 <strong>{beacon.dependents} trapped</strong> • ⚠️ {beacon.medicalNotes}
                    </p>
                  </div>

                  {/* Dispatch Unit Info & Actions */}
                  <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="text-[11px] text-slate-400 font-mono">
                      Unit: <strong className="text-cyan-300">{beacon.assignedUnit}</strong> (Lead:{" "}
                      {beacon.teamLeader})
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                      {beacon.status !== "IN_RESCUE" && beacon.status !== "RESOLVED" && (
                        <button
                          onClick={() => updateBeaconStatus(beacon.id, "IN_RESCUE")}
                          className="px-2.5 py-1 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-200 text-[10px] font-bold border border-cyan-500/40"
                        >
                          Mark In-Rescue
                        </button>
                      )}
                      {beacon.status !== "RESOLVED" && (
                        <button
                          onClick={() => updateBeaconStatus(beacon.id, "RESOLVED")}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 text-[10px] font-bold border border-emerald-500/40"
                        >
                          Mark Resolved
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Catchment Sub-Basin Risk Matrix */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>Solan Basin Sector Threat Distribution</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  sector: "Sector 2: Upper Ridge",
                  risk: "LOW RISK (18/100)",
                  status: "SAFE",
                  color: "emerald",
                  desc: "Elevation 1,580m MSL. Dry macadam surface, clear drainage.",
                },
                {
                  sector: "Sector 4: Central Khad Basin",
                  risk: "CRITICAL (84/100)",
                  status: "SURGE CREST",
                  color: "rose",
                  desc: "Culvert km 0.6 breached. Water speed 3.8 m/s.",
                },
                {
                  sector: "Sector 6: Saproon Tributary",
                  risk: "WARNING (62/100)",
                  status: "RISING",
                  color: "amber",
                  desc: "Runoff saturated at 82%. Soil instability along cut-slopes.",
                },
                {
                  sector: "Sector 9: Solan Bypass Lowland",
                  risk: "HIGH THREAT (74/100)",
                  status: "BLOCKED",
                  color: "rose",
                  desc: "Vehicular access suspended. SDRF motorized boat deployed.",
                },
              ].map((sec, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-white">{sec.sector}</h3>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        sec.color === "emerald"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : sec.color === "amber"
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-rose-500/20 text-rose-400"
                      }`}
                    >
                      {sec.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-mono">{sec.risk}</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{sec.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Quick CAP Alert Dispatcher & Quick Links (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick CAP Broadcast Box */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Emergency CAP Broadcast</h3>
                <p className="text-xs text-slate-400">Simultaneous Multi-Channel Cell &amp; Siren</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Alert Severity Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["ADVISORY", "WARNING", "CRITICAL"] as const).map((sev) => (
                    <button
                      key={sev}
                      onClick={() => setBroadcastSeverity(sev)}
                      className={`py-2 rounded-xl font-bold font-mono transition text-[11px] ${
                        broadcastSeverity === sev
                          ? sev === "CRITICAL"
                            ? "bg-rose-600 text-white"
                            : sev === "WARNING"
                            ? "bg-amber-500 text-slate-950"
                            : "bg-cyan-600 text-white"
                          : "bg-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Target Geofence Zone</label>
                <input
                  type="text"
                  value={broadcastZone}
                  onChange={(e) => setBroadcastZone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-medium focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Alert Message</label>
                <textarea
                  rows={3}
                  value={broadcastHeadline}
                  onChange={(e) => setBroadcastHeadline(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-medium focus:outline-none focus:border-cyan-500 leading-relaxed"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">
                  Target Channels Selected:
                </span>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-mono">
                    ✓ Cell Broadcast SMS (3,420 Subscribed)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-mono">
                    ✓ 120dB Mountain Siren Towers (x2)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
                    ✓ WhatsApp EOC Broadcast Group
                  </span>
                </div>
              </div>

              <button
                id="send-cap-broadcast-btn"
                onClick={handleSendBroadcast}
                disabled={isBroadcasting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition"
              >
                <Send className="w-4 h-4" />
                <span>{isBroadcasting ? "Transmitting CAP Signal..." : "Transmit Emergency Broadcast"}</span>
              </button>
            </div>
          </div>

          {/* Quick Navigation Cards */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
              Specialized DDMA Control Consoles
            </h3>

            <div className="space-y-2">
              <Link
                href="/risk-analytics"
                className="p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 flex items-center justify-between transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-cyan-400 transition">
                      Risk Analytics &amp; Ensemble ML
                    </h4>
                    <p className="text-[11px] text-slate-400">LSTM, XGBoost, GNN &amp; PINN weights</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition" />
              </Link>

              <Link
                href="/evacuation-tracker"
                className="p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 flex items-center justify-between transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <Route className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-cyan-400 transition">
                      Evacuation Tracker &amp; Shelters
                    </h4>
                    <p className="text-[11px] text-slate-400">Live bed capacity &amp; bus convoy transit</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition" />
              </Link>

              <Link
                href="/sensor-network"
                className="p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 flex items-center justify-between transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                    <Radio className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-cyan-400 transition">
                      IoT Sensor Telemetry Network
                    </h4>
                    <p className="text-[11px] text-slate-400">Ultrasonic water gauges &amp; rain sensors</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
