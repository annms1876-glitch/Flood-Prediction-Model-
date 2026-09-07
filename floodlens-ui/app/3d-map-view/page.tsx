"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPinned, Navigation, ShieldCheck, LocateFixed } from "lucide-react";
import { GoogleMapsEvacuationMap } from "@/components/map/GoogleMapsEvacuationMap";
import { useTranslation } from "@/lib/context/LanguageContext";

export default function EvacuationMapPage() {
  const [viewMode, setViewMode] = useState<"2d" | "3d">("3d");
  const { t } = useTranslation();
  return <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 lg:px-8"><div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="mb-2 text-sm font-black uppercase tracking-[.16em] text-[#00796b]">{t("location")}</p><h1 className="text-3xl font-black tracking-tight text-[#212121]">{t("viewMap")}</h1><p className="mt-2 text-lg text-slate-700">{t("mapHelp")}</p></div><Link href="/sos-emergency" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#d32f2f] px-5 text-base font-black text-white">SOS · 112</Link></div>
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#b8dec1] bg-white p-3 shadow-sm"><div className="flex items-center gap-3"><MapPinned className="h-6 w-6 text-[#00838f]" /><span className="text-lg font-black text-[#212121]">{t("routeReady")}</span></div><div className="flex items-center gap-2 rounded-xl bg-[#e8f5e9] p-1"><button onClick={() => setViewMode("3d")} className={`min-h-12 rounded-lg px-4 text-base font-black ${viewMode === "3d" ? "bg-[#00acc1] text-white" : "text-slate-700"}`}>3D</button><button onClick={() => setViewMode("2d")} className={`min-h-12 rounded-lg px-4 text-base font-black ${viewMode === "2d" ? "bg-[#00acc1] text-white" : "text-slate-700"}`}>2D</button></div></div>
    <div className="mb-5 grid gap-3 sm:grid-cols-3"><div className="flex items-center gap-3 rounded-xl border border-[#b8dec1] bg-white p-4"><LocateFixed className="h-6 w-6 text-[#00838f]" /><span className="text-base font-bold text-[#212121]">{t("gps")}</span></div><div className="flex items-center gap-3 rounded-xl border border-[#b8dec1] bg-white p-4"><ShieldCheck className="h-6 w-6 text-[#2e7d32]" /><span className="text-base font-bold text-[#212121]">Safe zones highlighted</span></div><div className="flex items-center gap-3 rounded-xl border border-[#b8dec1] bg-white p-4"><Navigation className="h-6 w-6 text-[#00838f]" /><span className="text-base font-bold text-[#212121]">Route A recommended</span></div></div>
    <GoogleMapsEvacuationMap initialRouteId="A" viewMode={viewMode} />
  </div>;
}
