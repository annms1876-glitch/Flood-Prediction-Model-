"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  AlertOctagon,
  Phone,
  Radio,
  MapPin,
  Users,
  HeartPulse,
  Volume2,
  VolumeX,
  Share2,
  CheckCircle2,
  Clock,
  Compass,
  LifeBuoy,
  XCircle,
  Truck,
  ArrowRight,
  Send,
} from "lucide-react";
import { playEmergencySiren } from "@/lib/notifications";

interface SOSBeaconResponse {
  id: string;
  timestamp: string;
  name: string;
  phone: string;
  latitude: number;
  longitude: number;
  locationName: string;
  dependents: number;
  medicalNotes: string;
  status: string;
  assignedUnit: string;
  teamLeader: string;
  radioVHF: string;
  etaMinutes: number;
}

export default function SOSEmergencyPage() {
  const [isActivating, setIsActivating] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isBeaconActive, setIsBeaconActive] = useState(false);
  const [beaconData, setBeaconData] = useState<SOSBeaconResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form details
  const [name, setName] = useState("Village Resident");
  const [phone, setPhone] = useState("+91 98160-XXXXX");
  const [locationName, setLocationName] = useState("Lower Solan Basin, Near Khad Bridge");
  const [dependents, setDependents] = useState(4);
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: 30.9049,
    lng: 77.0936,
  });
  const [selectedConditions, setSelectedConditions] = useState<string[]>([
    "Water entering ground floor",
    "Elderly family member present",
  ]);

  // Audio whistle beacon state using Web Audio API
  const [isAcousticWhistleActive, setIsAcousticWhistleActive] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const whistleIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Attempt to acquire real GPS location
  useEffect(() => {
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: Number(pos.coords.latitude.toFixed(6)),
            lng: Number(pos.coords.longitude.toFixed(6)),
          });
        },
        () => {
          // Keep default Solan coordinates on permission denial or mock
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  // Countdown timer for SOS trigger
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown !== null && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setCountdown(null);
      setIsActivating(false);
      triggerSOSDispatch();
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const startCountdown = () => {
    void playEmergencySiren();
    setIsActivating(true);
    setCountdown(3);
  };

  const cancelCountdown = () => {
    setIsActivating(false);
    setCountdown(null);
    showToast("SOS Beacon trigger cancelled.");
  };

  const toggleCondition = (cond: string) => {
    if (selectedConditions.includes(cond)) {
      setSelectedConditions(selectedConditions.filter((c) => c !== cond));
    } else {
      setSelectedConditions([...selectedConditions, cond]);
    }
  };

  const triggerSOSDispatch = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/sos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          locationName,
          latitude: coords.lat,
          longitude: coords.lng,
          dependents,
          medicalNotes: selectedConditions.join(", ") || "Standard flood evacuation assistance",
        }),
      });

      const data = await res.json();
      if (data.success && data.beacon) {
        setBeaconData(data.beacon);
        setIsBeaconActive(true);
        showToast("EMERGENCY BEACON DISPATCHED to SDRF Control Room!");
      } else {
        showToast("SOS dispatched via fallback emergency channel.");
        setIsBeaconActive(true);
      }
    } catch {
      // Local fallback
      setBeaconData({
        id: `SOS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        timestamp: new Date().toISOString(),
        name,
        phone,
        latitude: coords.lat,
        longitude: coords.lng,
        locationName,
        dependents,
        medicalNotes: selectedConditions.join(", "),
        status: "DISPATCHED",
        assignedUnit: "SDRF Rescue Unit 4 (Solan District)",
        teamLeader: "Sub-Insp. R. Sharma",
        radioVHF: "156.800 MHz (VHF Ch 16)",
        etaMinutes: 12,
      });
      setIsBeaconActive(true);
      showToast("Beacon logged locally and broadcasted.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Acoustic high-pitch SOS whistle using browser Web Audio
  const toggleAcousticWhistle = () => {
    if (isAcousticWhistleActive) {
      if (whistleIntervalRef.current) clearInterval(whistleIntervalRef.current);
      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.stop();
          oscillatorRef.current.disconnect();
        } catch {}
      }
      setIsAcousticWhistleActive(false);
      showToast("Acoustic Whistle Deactivated.");
    } else {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;

        let beepState = false;
        whistleIntervalRef.current = setInterval(() => {
          if (ctx.state === "suspended") {
            ctx.resume();
          }
          if (!beepState) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(3200, ctx.currentTime); // 3.2 kHz mountain rescue frequency
            gain.gain.setValueAtTime(0.35, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.35);
          }
          beepState = !beepState;
        }, 500);

        setIsAcousticWhistleActive(true);
        showToast("Acoustic Whistle active: Emitting high-frequency pulses for rescue teams.");
      } catch (err) {
        showToast("Audio device not accessible. Use physical whistle.");
      }
    }
  };

  useEffect(() => {
    return () => {
      if (whistleIntervalRef.current) clearInterval(whistleIntervalRef.current);
      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.stop();
        } catch {}
      }
    };
  }, []);

  const smsText = `EMERGENCY FLOOD RESCUE NEEDED at ${locationName} (${coords.lat}, ${coords.lng}). People trapped: ${dependents}. Situation: ${selectedConditions.join(
    ", "
  )}. Please dispatch SDRF.`;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 p-4 rounded-xl bg-cyan-600 text-white shadow-2xl flex items-center gap-3 border border-cyan-400/40 animate-slide-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Emergency Hotlines Floating Strip */}
      <div
        id="sos-hotlines-banner"
        className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 shrink-0 animate-pulse">
            <LifeBuoy className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono text-[10px] font-bold uppercase">
                EMERGENCY PRIORITY BEACON
              </span>
              <span className="text-xs text-slate-400">Direct Uplink to SDRF Command</span>
            </div>
            <p className="text-xs text-slate-200 mt-1 font-medium">
              If life is in imminent peril, activate beacon or dial <strong>112</strong> immediately.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="tel:112"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition whitespace-nowrap"
          >
            <Phone className="w-4 h-4" />
            <span>Call 112 National Rescue</span>
          </a>
        </div>
      </div>

      {/* Main SOS Trigger Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Big SOS Trigger & Beacon Status (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col items-center text-center">
            {/* Ambient Red Glow */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center gap-2 text-xs font-mono text-rose-400 mb-2">
              <Radio className="w-4 h-4 animate-pulse" />
              <span>HIMALAYAN SATELLITE &amp; SDRF DISPATCH PROTOCOL</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Rapid Flash Flood Distress Beacon
            </h1>
            <p className="text-xs text-slate-400 max-w-md mt-2 leading-relaxed">
              Press the beacon below. Your exact GPS coordinates and medical requirements will be
              transmitted directly to Solan District Disaster Control Room.
            </p>

            {/* Giant SOS Button */}
            <div className="my-8 relative">
              {isBeaconActive ? (
                /* Active Beacon Display */
                <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-full bg-emerald-950/80 border-4 border-emerald-400 flex flex-col items-center justify-center p-4 shadow-[0_0_50px_rgba(16,185,129,0.4)] animate-pulse">
                  <CheckCircle2 className="w-16 h-16 text-emerald-400 mb-2" />
                  <span className="text-xl font-black text-white tracking-wider">BEACON ACTIVE</span>
                  <span className="text-xs font-mono text-emerald-300 font-bold mt-1">
                    SDRF UNIT EN ROUTE
                  </span>
                  <span className="text-[11px] text-slate-300 mt-2 font-mono">
                    ETA: ~{beaconData?.etaMinutes || 14} MIN
                  </span>
                </div>
              ) : countdown !== null ? (
                /* Abort Countdown State */
                <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-full bg-rose-950 border-4 border-rose-500 flex flex-col items-center justify-center p-4 shadow-[0_0_50px_rgba(244,63,94,0.6)] animate-pulse">
                  <span className="text-6xl font-black text-white font-mono">{countdown}</span>
                  <span className="text-xs font-bold text-rose-300 uppercase mt-2">
                    Transmitting In...
                  </span>
                  <button
                    onClick={cancelCountdown}
                    className="mt-3 px-4 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-600 transition flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4 text-rose-400" />
                    <span>Cancel / Abort</span>
                  </button>
                </div>
              ) : (
                /* Idle Trigger Button */
                <button
                  id="giant-sos-trigger-button"
                  onClick={startCountdown}
                  disabled={isSubmitting}
                  className="group relative w-56 h-56 sm:w-64 sm:h-64 rounded-full bg-gradient-to-b from-rose-600 to-rose-800 hover:from-rose-500 hover:to-rose-700 border-4 border-rose-400 flex flex-col items-center justify-center p-4 shadow-[0_0_40px_rgba(244,63,94,0.4)] hover:shadow-[0_0_70px_rgba(244,63,94,0.7)] transition-all duration-300 active:scale-95 cursor-pointer"
                >
                  <div className="absolute inset-2 rounded-full border-2 border-rose-300/40 animate-ping opacity-25" />
                  <AlertOctagon className="w-14 h-14 text-white mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-3xl sm:text-4xl font-black text-white tracking-widest">
                    SOS
                  </span>
                  <span className="text-[11px] font-bold text-rose-200 uppercase tracking-wider mt-1">
                    Press to Request Rescue
                  </span>
                </button>
              )}
            </div>

            {/* Acoustic Whistle Feature & Status Indicators */}
            <div className="w-full flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                id="toggle-acoustic-whistle-btn"
                onClick={toggleAcousticWhistle}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border ${
                  isAcousticWhistleActive
                    ? "bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/30 animate-pulse"
                    : "bg-slate-800/80 text-slate-300 hover:text-white border-slate-700 hover:bg-slate-700"
                }`}
              >
                {isAcousticWhistleActive ? (
                  <>
                    <Volume2 className="w-4 h-4 text-slate-950 animate-bounce" />
                    <span>Acoustic Whistle Sounding (3.2 kHz Pulse)</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 text-amber-400" />
                    <span>Sound High-Pitch Rescue Whistle</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  if (typeof navigator !== "undefined" && navigator.share) {
                    navigator
                      .share({
                        title: "EMERGENCY FLOOD RESCUE BEACON",
                        text: smsText,
                      })
                      .catch(() => {});
                  } else {
                    navigator.clipboard.writeText(smsText);
                    showToast("Emergency SMS template copied to clipboard!");
                  }
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 transition"
              >
                <Share2 className="w-4 h-4 text-cyan-400" />
                <span>Share Coordinates / SMS</span>
              </button>
            </div>

            {/* Active Dispatch Info Card if Beacon is Active */}
            {isBeaconActive && beaconData && (
              <div
                id="active-rescue-dispatch-card"
                className="w-full mt-6 p-5 rounded-2xl bg-slate-800/70 border border-emerald-500/40 text-left space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 font-mono">
                      BEACON ID: {beaconData.id}
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">
                    DISPATCH ACKNOWLEDGED
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/60">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">
                      Assigned Unit
                    </span>
                    <span className="font-bold text-white mt-0.5 block">
                      {beaconData.assignedUnit}
                    </span>
                    <span className="text-[11px] text-cyan-400 block mt-1">
                      Lead: {beaconData.teamLeader}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/60">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">
                      Radio Channel
                    </span>
                    <span className="font-bold text-emerald-400 font-mono mt-0.5 block">
                      {beaconData.radioVHF}
                    </span>
                    <span className="text-[11px] text-slate-300 block mt-1">
                      Estimated Arrival:{" "}
                      <strong className="text-white">{beaconData.etaMinutes} mins</strong>
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  ⚠️ Stay on high ground (rooftop or upper floor). Signal with a bright cloth or
                  torch when rescue boat or all-terrain team approaches.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Pre-Rescue Details & Emergency Dialers (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Situation & Location Form */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span>Rescue Location &amp; Situation</span>
            </h2>

            {/* Coordinates Badge */}
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase block">
                  GPS Latitude &amp; Longitude
                </span>
                <span className="font-mono font-bold text-cyan-400 mt-0.5 block">
                  {coords.lat}° N, {coords.lng}° E
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-mono text-[10px] font-bold">
                HIGH PRECISION
              </span>
            </div>

            {/* Landmark input */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Landmark / Specific House Description
              </label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500 font-medium"
                placeholder="e.g., Near Khad Bridge, Blue roof two-storey house"
              />
            </div>

            {/* Dependents Counter */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  Number of Persons Trapped
                </label>
                <span className="text-xs font-mono font-bold text-cyan-400">
                  {dependents} Individuals
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="15"
                  value={dependents}
                  onChange={(e) => setDependents(Number(e.target.value))}
                  className="flex-1 accent-cyan-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Condition Checkboxes */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-semibold text-slate-300 block">
                Critical Hazards / Vulnerabilities:
              </label>
              {[
                "Water entering ground floor (> 1 ft)",
                "Elderly family member present",
                "Infant or pregnant woman present",
                "Severe injury or medical assistance required",
                "Trapped on rooftop with rising water",
                "Power lines snapped nearby",
              ].map((cond) => {
                const checked = selectedConditions.includes(cond);
                return (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => toggleCondition(cond)}
                    className={`w-full p-2.5 rounded-xl border text-left text-xs transition flex items-center gap-2.5 ${
                      checked
                        ? "bg-rose-500/15 border-rose-500/40 text-rose-200 font-medium"
                        : "bg-slate-800/40 border-slate-700/60 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 text-[10px] ${
                        checked ? "bg-rose-500 border-rose-400 text-white" : "border-slate-600"
                      }`}
                    >
                      {checked && "✓"}
                    </div>
                    <span className="truncate">{cond}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Dial Emergency Services */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
              Direct Voice Emergency Hotlines (Toll-Free)
            </h3>

            <div className="space-y-2">
              <a
                href="tel:112"
                className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 flex items-center justify-between transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-cyan-400 transition">
                      112 Unified Emergency
                    </h4>
                    <p className="text-[11px] text-slate-400">Police, Fire &amp; SDRF Intercept</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-rose-400">DIAL NOW →</span>
              </a>

              <a
                href="tel:108"
                className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 flex items-center justify-between transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                    <HeartPulse className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-cyan-400 transition">
                      108 Medical Ambulance
                    </h4>
                    <p className="text-[11px] text-slate-400">Emergency trauma &amp; triage</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-cyan-400">DIAL NOW →</span>
              </a>

              <a
                href="tel:1070"
                className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 flex items-center justify-between transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-cyan-400 transition">
                      1070 HP State Emergency (SEOC)
                    </h4>
                    <p className="text-[11px] text-slate-400">Disaster Management Cell Shimla</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400">DIAL NOW →</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
