"use client";

import Link from "next/link";
import { CheckCircle2, CloudSun, Droplets, MapPinned, Phone, ShieldAlert, Users, Wind, ArrowUpRight, Activity, Clock3 } from "lucide-react";
import { useTranslation } from "@/lib/context/LanguageContext";

const metrics = [
  { label: "Connected sensors", value: "24 / 24", note: "Network online", icon: Droplets },
  { label: "People in safe zones", value: "1,248", note: "+18 since 06:00", icon: Users },
  { label: "Catchment status", value: "Stable", note: "No surge detected", icon: Wind },
];

export default function UmeedDashboard() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="eyebrow mb-3">Solan catchment · Himachal Pradesh</p>
          <h1 className="display-heading">Good morning, Som<span className="text-[#f9a600]">.</span></h1>
          <p className="mt-3 max-w-xl text-base leading-6 text-[#61594a]">A clear view of your local flood picture, tuned for the next decision—not the last event.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-[#8f897e]"><Clock3 className="h-4 w-4" /> Updated 12 seconds ago</div>
      </section>

      <section className="paper-card mb-6 border-[#e89b01]/50 bg-[#fffdf8] p-5 sm:p-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#f8da9d] text-[#261b07]"><CheckCircle2 className="h-6 w-6" /></div>
            <div><p className="text-xl font-semibold tracking-[-.02em] text-[#261b07]">All clear in your area</p><p className="mt-1 text-sm text-[#61594a]">Monitoring is active. We will notify you if conditions change.</p></div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-medium"><span className="tag tag-amber">Risk · low</span><span className="tag tag-linen">Rain outlook · clear</span><span className="tag tag-linen">Visibility · good</span></div>
        </div>
        <div className="mt-6 grid gap-px overflow-hidden rounded-lg border border-[#e3dfd5] bg-[#e3dfd5] sm:grid-cols-2">
          <div className="bg-white p-4"><div className="flex items-center gap-2 text-sm font-semibold text-[#261b07]"><CloudSun className="h-4 w-4 text-[#e89b01]" /> Weather now</div><p className="mt-3 text-2xl font-semibold tracking-[-.03em] text-[#261b07]">24° <span className="text-base font-normal text-[#8f897e]">· Clear skies</span></p><p className="mt-1 text-xs text-[#8f897e]">65% humidity · no rain expected</p></div>
          <div className="bg-white p-4"><div className="flex items-center gap-2 text-sm font-semibold text-[#261b07]"><ShieldAlert className="h-4 w-4 text-[#e89b01]" /> Current status</div><p className="mt-3 text-2xl font-semibold tracking-[-.03em] text-[#261b07]">Low flood risk</p><p className="mt-1 text-xs text-[#8f897e]">You are safe right now</p></div>
        </div>
      </section>

      <Link href="/3d-map-view" className="group mb-8 flex items-center justify-between rounded-lg bg-[#f9a600] px-5 py-4 text-[#261b07] shadow-[inset_0_2px_4px_rgba(255,255,255,.56),0_4px_8px_rgba(38,27,7,.06)] transition hover:bg-[#e89b01] active:scale-[.99] sm:px-6"><span className="flex items-center gap-3"><MapPinned className="h-5 w-5" /><span><span className="block text-base font-semibold">Open live evacuation map</span><span className="mt-0.5 block text-xs text-[#61594a]">See your location, safe zones, terrain and the safest route home.</span></span></span><ArrowUpRight className="h-5 w-5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></Link>

      <section className="mb-8 grid gap-3 md:grid-cols-3">{metrics.map(({ label, value, note, icon: Icon }) => <div key={label} className="paper-card p-5"><div className="flex items-center justify-between"><p className="eyebrow">{label}</p><Icon className="h-4 w-4 text-[#8f897e]" /></div><p className="mt-4 text-2xl font-semibold tracking-[-.03em] text-[#261b07]">{value}</p><p className="mt-1 text-xs text-[#8f897e]">{note}</p><div className="mt-4 h-1 overflow-hidden rounded-full bg-[#e3dfd5]"><div className="h-full w-[82%] rounded-full bg-[#f9a600]" /></div></div>)}</section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
        <div className="paper-card p-6"><div className="flex items-start justify-between"><div><p className="eyebrow mb-2">Preparedness / next steps</p><h2 className="section-heading">Keep your household ready</h2></div><Activity className="h-5 w-5 text-[#f9a600]" /></div><ul className="mt-6 space-y-4 text-sm text-[#61594a]"><li className="flex gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-[#f9a600]" />Stay indoors if flooding starts.</li><li className="flex gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-[#f9a600]" />Keep your emergency kit ready and charged.</li><li className="flex gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-[#f9a600]" />Move to higher ground when advised.</li></ul><Link href="/safety-tips" className="ghost-button mt-6 inline-flex">Review preparedness <ArrowUpRight className="h-4 w-4" /></Link></div>
        <div className="paper-card bg-[#261b07] p-6 text-white"><div className="flex items-center gap-3"><Phone className="h-5 w-5 text-[#f9a600]" /><h2 className="section-heading text-white">Emergency contacts</h2></div><p className="mt-2 text-sm text-[#d5d2cd]">Keep these numbers close when the weather turns.</p><div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2"><a href="tel:112" className="flex items-center justify-between rounded-lg bg-white px-4 py-3 text-sm font-semibold text-[#261b07] transition hover:bg-[#f8da9d]"><span>National emergency</span><span>112</span></a><a href="tel:1070" className="flex items-center justify-between rounded-lg border border-[#61594a] px-4 py-3 text-sm font-semibold text-white transition hover:border-[#f9a600] hover:text-[#f9a600]"><span>SDRF helpline</span><span>1070</span></a></div></div>
      </section>
    </div>
  );
}
