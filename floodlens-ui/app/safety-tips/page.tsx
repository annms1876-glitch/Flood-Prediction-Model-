"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileCheck,
  Phone,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Download,
  Printer,
  HeartPulse,
  Droplet,
  Home,
  Briefcase,
  Flame,
  Radio,
  ArrowRight,
} from "lucide-react";

interface ChecklistItem {
  id: string;
  label: string;
  desc: string;
  weight: string;
}

export default function SafetyTipsPage() {
  const [activeTab, setActiveTab] = useState<"kit" | "evac" | "firstaid" | "post">("kit");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const initialItems: ChecklistItem[] = [
    {
      id: "water",
      label: "3 Litres Sealed Drinking Water",
      desc: "Packed in durable canteen or bottles (1L/day minimum per individual).",
      weight: "3.0 kg",
    },
    {
      id: "purification",
      label: "Water Purification Tablets (Chlorine / Halazone)",
      desc: "50-strip pack to treat rain and stream water in high ground.",
      weight: "0.1 kg",
    },
    {
      id: "rations",
      label: "High-Calorie Dry Rations & Energy Nuts",
      desc: "Roasted grams, gur (jaggery), energy bars, dried fruits.",
      weight: "1.2 kg",
    },
    {
      id: "torch",
      label: "Waterproof High-Lumen LED Torch & Spare Batteries",
      desc: "Critical for night-time alpine navigation and signaling rescue.",
      weight: "0.4 kg",
    },
    {
      id: "firstaid",
      label: "First Aid Kit (Antiseptic, Bandages, ORS, Paracetamol)",
      desc: "Waterproof zipped case containing wound dressings and splints.",
      weight: "0.6 kg",
    },
    {
      id: "whistle",
      label: "High-Decibel Emergency Whistle",
      desc: "Acoustic beacon audible over roaring flash flood torrents.",
      weight: "0.05 kg",
    },
    {
      id: "documents",
      label: "Waterproof Document Pouch (Aadhaar, Land Deeds, Bank)",
      desc: "Sealed double zip-lock pouch keeping legal papers bone dry.",
      weight: "0.3 kg",
    },
    {
      id: "multitool",
      label: "Swiss Army Multi-tool or Sturdy Pocket Knife",
      desc: "Useful for clearing brush, cutting ropes, and emergency repairs.",
      weight: "0.25 kg",
    },
    {
      id: "powerbank",
      label: "20,000 mAh Weatherproof Power Bank & Cables",
      desc: "Maintains phone charge for GPS telemetry and emergency SMS.",
      weight: "0.45 kg",
    },
    {
      id: "blanket",
      label: "Reflective Mylar Emergency Foil Blanket (x2)",
      desc: "Prevents hypothermia from mountain rain and cold river spray.",
      weight: "0.15 kg",
    },
  ];

  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>({
    water: true,
    torch: true,
    firstaid: true,
    documents: true,
    powerbank: true,
  });

  // Load from LocalStorage if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem("floodshield_survival_kit");
      if (saved) {
        setCheckedIds(JSON.parse(saved));
      }
    } catch {}
  }, []);

  const toggleItem = (id: string) => {
    const updated = { ...checkedIds, [id]: !checkedIds[id] };
    setCheckedIds(updated);
    try {
      localStorage.setItem("floodshield_survival_kit", JSON.stringify(updated));
    } catch {}
  };

  const completedCount = Object.values(checkedIds).filter(Boolean).length;
  const progressPct = Math.round((completedCount / initialItems.length) * 100);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
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

      {/* Emergency Hotlines Strip */}
      <div
        id="emergency-hotlines-strip"
        className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4"
      >
        <div className="flex items-center gap-2 text-rose-400">
          <Phone className="w-5 h-5 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider font-mono">
            Emergency Hotlines (24/7 Toll-Free):
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <a
            href="tel:112"
            className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-bold transition flex items-center gap-1.5"
          >
            <span>National Emergency:</span>
            <span className="text-white font-black text-sm">112</span>
          </a>
          <a
            href="tel:108"
            className="px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 font-bold transition flex items-center gap-1.5"
          >
            <span>Ambulance / Medical:</span>
            <span className="text-white font-black text-sm">108</span>
          </a>
          <a
            href="tel:101"
            className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-bold transition flex items-center gap-1.5"
          >
            <span>Fire &amp; Rescue:</span>
            <span className="text-white font-black text-sm">101</span>
          </a>
          <a
            href="tel:1070"
            className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-bold transition flex items-center gap-1.5"
          >
            <span>Disaster Relief (SEOC):</span>
            <span className="text-white font-black text-sm">1070</span>
          </a>
        </div>
      </div>

      {/* Mountain Siren Protocol Warning Banner */}
      <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
            <Radio className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold uppercase">
              MOUNTAIN SIREN PROTOCOL
            </span>
            <h3 className="text-sm font-bold text-white mt-1">
              If the valley siren sounds continuous high-pitch pulses (30 seconds ON / 10 seconds OFF):
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              You have approximately <strong>12 to 18 minutes</strong> before upstream flash torrent crests downstream. Immediately move uphill above <strong>+25m elevation clearance</strong>. Do NOT attempt to salvage heavy cattle or appliances.
            </p>
          </div>
        </div>

        <Link
          href="/evacuation-routes"
          className="self-start sm:self-center px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs whitespace-nowrap shadow transition"
        >
          View High Ground Corridors
        </Link>
      </div>

      {/* Header & Category Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <span className="uppercase tracking-wider">Himalayan Disaster Protocol</span>
            <span className="text-slate-600">•</span>
            <span>NDMA Field Guidelines</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Safety Tips &amp; Preparedness Hub
          </h1>
        </div>

        {/* Print / Download buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => showToast("Downloading Emergency Action Card (PDF in Hindi & English)...")}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <Download className="w-4 h-4" />
            <span>Download Action PDF</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print Guides</span>
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        <button
          onClick={() => setActiveTab("kit")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === "kit"
              ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/20"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>72-Hour Survival Kit</span>
        </button>
        <button
          onClick={() => setActiveTab("evac")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === "evac"
              ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/20"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Evacuation Protocol</span>
        </button>
        <button
          onClick={() => setActiveTab("firstaid")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === "firstaid"
              ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/20"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          <HeartPulse className="w-4 h-4" />
          <span>First Aid in Floods</span>
        </button>
        <button
          onClick={() => setActiveTab("post")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === "post"
              ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/20"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          <Droplet className="w-4 h-4" />
          <span>Post-Flood Water &amp; Mud</span>
        </button>
      </div>

      {/* Tab 1: 72-Hour Survival Kit Interactive Checklist */}
      {activeTab === "kit" && (
        <div className="space-y-6">
          {/* Progress Card */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-white">Your Go-Bag Readiness Status:</span>
                <span className="font-mono font-bold text-cyan-400 text-base">{progressPct}%</span>
              </div>
              <p className="text-xs text-slate-400">
                {completedCount} of {initialItems.length} essential survival items checked. Keep by your door.
              </p>
            </div>

            <div className="w-full sm:w-64 space-y-1.5">
              <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>0% Empty</span>
                <span className="text-emerald-400 font-bold">Recommended: &lt; 7.0 kg total</span>
              </div>
            </div>
          </div>

          {/* Checklist Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {initialItems.map((item) => {
              const isChecked = !!checkedIds[item.id];
              return (
                <div
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={`cursor-pointer p-4 rounded-xl border transition-all duration-150 flex items-start gap-3.5 select-none ${
                    isChecked
                      ? "bg-slate-900/90 border-cyan-500/40 text-slate-200"
                      : "bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div
                    className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                      isChecked
                        ? "bg-cyan-500 border-cyan-400 text-slate-950 font-bold"
                        : "border-slate-600 bg-slate-800"
                    }`}
                  >
                    {isChecked && <CheckCircle2 className="w-4 h-4 fill-current" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4
                        className={`text-xs font-bold transition-colors ${
                          isChecked ? "text-white" : "text-slate-300"
                        }`}
                      >
                        {item.label}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-500 shrink-0">
                        {item.weight}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Evacuation Protocol */}
      {activeTab === "evac" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold uppercase">
              STEP 1: BEFORE DEPARTING
            </span>
            <h3 className="text-base font-bold text-white">Secure Home Utilities</h3>
            <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
              <li>• Switch off the main electrical MCB fuse breaker to prevent live wiring short circuits.</li>
              <li>• Turn the brass valve on your LPG cylinder tightly clockwise.</li>
              <li>• Move grain sacks, medicines, and winter blankets to top mezzanine floor.</li>
              <li>• Untie and unlock cattle/livestock so they can swim or seek high ground independently.</li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold uppercase">
              STEP 2: EN ROUTE
            </span>
            <h3 className="text-base font-bold text-white">Follow Ridgeline Corridors</h3>
            <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
              <li>• Walk in single file along ridge trails. Keep children between two adults.</li>
              <li>• Test ground firmness with a wooden hiking stick before stepping into mud.</li>
              <li>• <strong>Never drive or wade through moving river water</strong>; 15 cm of rapid water knocks an adult off their feet.</li>
              <li>• Watch out for falling pine trees or overhead high-voltage power cables.</li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold uppercase">
              STEP 3: AT SHELTER
            </span>
            <h3 className="text-base font-bold text-white">Register &amp; Medical Triage</h3>
            <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
              <li>• Register your family at the NDMA / SDRF census desk to stop false search alerts.</li>
              <li>• Inform the medical officer if any family member has diabetes, heart condition, or cuts.</li>
              <li>• Collect chlorine water disinfection tablets and clean blankets.</li>
              <li>• Restrict phone calls to 30 seconds to conserve battery and cell tower band.</li>
            </ul>
          </div>
        </div>
      )}

      {/* Tab 3: First Aid in Floods */}
      {activeTab === "firstaid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-rose-400">
              <HeartPulse className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Treating Open Wounds &amp; Sepsis</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Flood water is heavily contaminated with sewage, dead matter, and agricultural pesticides. Any scratch or puncture wound must be washed immediately with clean boiled or chlorinated water, followed by antiseptic povidone-iodine. Do NOT seal dirty wounds with airtight tape.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-cyan-400">
              <Droplet className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Preventing Hypothermia</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Himalayan river water temperatures drop below 12°C during monsoons. Remove wet drenched clothes immediately. Wrap the person in dry woolen shawls or an emergency Mylar foil sheet. Provide hot tea, jaggery water, or salted rice broth. Keep the victim moving gently.
            </p>
          </div>
        </div>
      )}

      {/* Tab 4: Post-Flood Safety & Water */}
      {activeTab === "post" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <h4 className="text-sm font-bold text-white">Water Purification Protocol</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Vigorous rolling boil for a full <strong>3 minutes</strong> kills cryptosporidium, cholera, and amoeba cysts. If fuel is scarce, use 1 chlorine tablet per 5 litres of water and wait 30 minutes before drinking.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <h4 className="text-sm font-bold text-white">Electrical Safety in Mud</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Do NOT touch appliances or switches while standing in mud or water. Have a licensed electrician inspect your wiring before turning on the main grid fuse once flood waters recede.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <h4 className="text-sm font-bold text-white">Secondary Landslide Cracks</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Inspect the slope behind and above your house for new tension cracks, tilting retaining walls, or muddy spring water seeping from soil. Evacuate immediately if cracking widens.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
