"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import {
  Activity, ArrowUpRight, Bell, CheckCircle2, ChevronRight, CloudRain, Droplets,
  Gauge, MapPin, Navigation, Radio, ShieldAlert, Sparkles, Thermometer, Users, Wind,
} from "lucide-react";

const readings = [
  { name: "Giri River", value: "1.24 m", change: "+0.04", status: "Stable", tone: "teal" },
  { name: "Ashwani Khad", value: "0.88 m", change: "−0.02", status: "Normal", tone: "teal" },
  { name: "Solan West", value: "18 mm", change: "+6.2", status: "Watching", tone: "amber" },
];

const actions = [
  { href: "/3d-map-view", icon: Navigation, title: "Open live map", text: "See terrain, rivers and sensor coverage.", color: "teal" },
  { href: "/evacuation-routes", icon: ShieldAlert, title: "Plan evacuation", text: "Find the safest route to higher ground.", color: "navy" },
  { href: "/safety-tips", icon: CheckCircle2, title: "Prepare your home", text: "Review the 8-step readiness checklist.", color: "slate" },
];

export default function VillagerDashboard() {
  const { user, profile } = useAuth();
  const [showNotice, setShowNotice] = useState(true);
  const userName = profile?.name || user?.displayName?.split(" ")[0] || "there";

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
      {showNotice && (
        <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-900 shadow-sm">
          <div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 shrink-0 text-teal-600" /><span><strong>All clear in Solan Valley.</strong> Monitoring is active and the next sensor sweep is in 04 minutes.</span></div>
          <button onClick={() => setShowNotice(false)} className="text-xs font-bold text-teal-700 hover:text-teal-950">Dismiss</button>
        </div>
      )}

      <section className="rise-in mb-7 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="eyebrow mb-2">Community overview · Monday, 07 September</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#102a3a] sm:text-4xl">Good morning, {userName}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">A simple view of the conditions around your village, so you can make confident decisions before the weather changes.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500"><span className="flex h-2.5 w-2.5 rounded-full bg-teal-500" /> Data updated 12 seconds ago</div>
      </section>

      <section className="rise-in rise-in-delay-1 grid gap-4 lg:grid-cols-[1.35fr_.65fr]">
        <div className="relative overflow-hidden rounded-3xl bg-[#102a3a] p-6 text-white shadow-[0_18px_50px_rgba(16,42,58,0.16)] sm:p-8">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-teal-400/15 blur-3xl" />
          <div className="relative flex h-full flex-col justify-between gap-8">
            <div className="flex items-start justify-between gap-4"><div><div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[.12em] text-teal-200"><MapPin className="h-3.5 w-3.5" /> Solan, Himachal Pradesh</div><h2 className="max-w-lg text-2xl font-extrabold tracking-tight sm:text-3xl">Flood risk is low right now.</h2><p className="mt-2 max-w-lg text-sm leading-6 text-slate-300">The river network is within normal range. Keep notifications on while scattered rain passes through the valley.</p></div><div className="hidden rounded-2xl border border-white/10 bg-white/5 p-3 sm:block"><CloudRain className="h-6 w-6 text-teal-300" /></div></div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><div className="flex items-end gap-2"><span className="text-6xl font-black tracking-tight text-teal-300">12</span><span className="mb-2 text-sm font-semibold text-slate-400">/ 100 risk score</span></div><div className="mt-3 flex items-center gap-2 text-sm font-bold text-teal-300"><span className="h-2 w-2 rounded-full bg-teal-300" /> Normal conditions</div></div><Link href="/risk-analytics" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#102a3a] transition hover:bg-teal-50">View risk details <ArrowUpRight className="h-4 w-4" /></Link></div>
          </div>
        </div>
        <div className="panel flex flex-col justify-between p-6"><div><div className="mb-4 flex items-center justify-between"><span className="eyebrow">Local weather</span><Thermometer className="h-5 w-5 text-teal-600" /></div><div className="flex items-end gap-3"><span className="text-5xl font-black tracking-tight text-[#102a3a]">24°</span><span className="mb-2 text-sm font-semibold text-slate-500">Partly cloudy</span></div></div><div className="mt-8 grid grid-cols-3 gap-2 border-t border-slate-100 pt-5 text-xs"><div><p className="mb-1 text-slate-400">Humidity</p><p className="font-bold text-slate-700">65%</p></div><div><p className="mb-1 text-slate-400">Wind</p><p className="font-bold text-slate-700">12 km/h</p></div><div><p className="mb-1 text-slate-400">Rain today</p><p className="font-bold text-slate-700">18 mm</p></div></div></div>
      </section>

      <section className="rise-in rise-in-delay-2 mt-6 grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
        <div className="panel p-6"><div className="mb-5 flex items-start justify-between"><div><p className="eyebrow mb-1">Live sensor network</p><h2 className="text-xl font-extrabold text-[#102a3a]">Water levels near you</h2></div><Link href="/sensor-network" className="text-xs font-bold text-teal-700 hover:text-teal-900">View all sensors <ChevronRight className="inline h-3.5 w-3.5" /></Link></div><div className="space-y-3">{readings.map((reading) => <div key={reading.name} className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4"><div className={`flex h-10 w-10 items-center justify-center rounded-xl ${reading.tone === "amber" ? "bg-amber-100 text-amber-700" : "bg-teal-100 text-teal-700"}`}><Droplets className="h-5 w-5" /></div><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><p className="truncate text-sm font-bold text-slate-800">{reading.name}</p><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${reading.tone === "amber" ? "bg-amber-100 text-amber-700" : "bg-teal-100 text-teal-700"}`}>{reading.status}</span></div><div className="mt-2 flex items-center gap-3"><span className="text-lg font-extrabold text-[#102a3a]">{reading.value}</span><span className="text-xs font-semibold text-slate-400">{reading.change} m / hr</span></div></div></div>)}</div></div>
        <div className="panel p-6"><div className="mb-5 flex items-start justify-between"><div><p className="eyebrow mb-1">Your readiness</p><h2 className="text-xl font-extrabold text-[#102a3a]">Small steps, big difference</h2></div><Sparkles className="h-5 w-5 text-amber-500" /></div><div className="mb-5 flex items-center gap-4"><div className="relative h-16 w-16"><svg className="h-full w-full -rotate-90" viewBox="0 0 64 64"><circle cx="32" cy="32" r="27" fill="none" stroke="#e8eff0" strokeWidth="7" /><circle cx="32" cy="32" r="27" fill="none" stroke="#0d9488" strokeWidth="7" strokeDasharray="169.6" strokeDashoffset="34" strokeLinecap="round" /></svg><span className="absolute inset-0 flex items-center justify-center text-sm font-black text-[#102a3a]">80%</span></div><div><p className="text-sm font-bold text-slate-800">You are well prepared</p><p className="mt-1 text-xs text-slate-500">2 items left on your checklist</p></div></div><Link href="/safety-tips" className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-teal-50 hover:text-teal-700">Continue checklist <ArrowUpRight className="h-4 w-4" /></Link></div>
      </section>

      <section className="rise-in rise-in-delay-3 mt-6"><div className="mb-4 flex items-end justify-between"><div><p className="eyebrow mb-1">What would you like to do?</p><h2 className="text-xl font-extrabold text-[#102a3a]">Stay informed and ready</h2></div><Link href="/dashboard" className="hidden text-xs font-bold text-teal-700 sm:block">Open full dashboard <ChevronRight className="inline h-3.5 w-3.5" /></Link></div><div className="grid gap-4 md:grid-cols-3">{actions.map(({ href, icon: Icon, title, text, color }) => <Link key={href} href={href} className="group panel flex items-start gap-4 p-5 transition duration-200 hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-[0_16px_34px_rgba(13,148,136,0.11)]"><span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${color === "teal" ? "bg-teal-100 text-teal-700" : color === "navy" ? "bg-[#102a3a] text-teal-200" : "bg-slate-100 text-slate-600"}`}><Icon className="h-5 w-5" /></span><span className="min-w-0"><span className="flex items-center gap-2 text-sm font-extrabold text-[#102a3a]">{title}<ArrowUpRight className="h-3.5 w-3.5 text-slate-300 transition group-hover:text-teal-600" /></span><span className="mt-1 block text-xs leading-5 text-slate-500">{text}</span></span></Link>)}</div></section>

      <section className="mt-8 grid gap-4 sm:grid-cols-3"><div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"><Activity className="h-5 w-5 text-teal-600" /><div><p className="text-lg font-black text-[#102a3a]">24</p><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Sensors online</p></div></div><div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"><Radio className="h-5 w-5 text-teal-600" /><div><p className="text-lg font-black text-[#102a3a]">3</p><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Clear routes</p></div></div><div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"><Users className="h-5 w-5 text-teal-600" /><div><p className="text-lg font-black text-[#102a3a]">1,248</p><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">People protected</p></div></div></section>
    </div>
  );
}
