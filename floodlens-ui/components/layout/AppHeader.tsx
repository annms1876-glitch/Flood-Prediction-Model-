"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUIStore } from "@/lib/store/uiStore";
import { useAuth } from "@/lib/context/AuthContext";
import { Bell, ChevronDown, LogIn, Menu, ShieldCheck, Thermometer, Waves } from "lucide-react";

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { portal, setPortal, sidebarOpen, setSidebarOpen } = useUIStore();
  const { user, profile, openAuthModal, openProfileModal } = useAuth();

  const isAdminRoute = ["/admin", "/risk-analytics", "/evacuation-tracker", "/alert-management", "/sensor-network"].some((route) => pathname.startsWith(route));
  const currentPortal = isAdminRoute ? "authority" : portal;
  const navLinks = [
    { href: "/", label: "Overview" },
    { href: "/3d-map-view", label: "Live map" },
    { href: "/evacuation-routes", label: "Evacuation" },
    { href: "/safety-tips", label: "Preparedness" },
  ];

  const switchPortal = (target: "villager" | "authority") => {
    setPortal(target);
    router.push(target === "authority" ? "/admin-dashboard" : "/");
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-20 border-b border-slate-200/80 bg-white/95 shadow-[0_4px_18px_rgba(16,42,58,0.06)] backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-[1600px] items-center gap-4 px-4 sm:px-6 lg:px-8">
        {currentPortal === "authority" && (
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 lg:hidden" aria-label="Toggle command menu">
            <Menu className="h-5 w-5" />
          </button>
        )}

        <Link href="/" className="flex shrink-0 items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#102a3a] text-teal-300 shadow-sm"><Waves className="h-5 w-5" /></span>
          <span className="hidden sm:block">
            <span className="block text-[15px] font-extrabold tracking-tight text-[#102a3a]">FloodShield <span className="text-teal-600">AI</span></span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Early warning network</span>
          </span>
        </Link>

        <div className="hidden h-8 w-px bg-slate-200 xl:block" />
        <div className="hidden items-center gap-1 rounded-xl bg-slate-100 p-1 xl:flex">
          <button onClick={() => switchPortal("villager")} className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${currentPortal === "villager" ? "bg-white text-[#102a3a] shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>Community</button>
          <button onClick={() => switchPortal("authority")} className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${currentPortal === "authority" ? "bg-[#102a3a] text-white shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>Command center</button>
        </div>

        {currentPortal === "villager" && (
          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((item) => {
              const active = pathname === item.href || (item.href === "/3d-map-view" && pathname === "/map");
              return <Link key={item.href} href={item.href} className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${active ? "bg-teal-50 text-teal-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}>{item.label}</Link>;
            })}
          </nav>
        )}

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs md:flex">
            <span className="flex h-2 w-2 rounded-full bg-teal-500" />
            <span className="font-semibold text-slate-700">Solan, HP</span>
            <span className="text-slate-400">24°C</span>
          </div>
          <Link href={currentPortal === "authority" ? "/alert-management" : "/dashboard"} className="relative rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700" aria-label="View alerts">
            <Bell className="h-4 w-4" />
            <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">12</span>
          </Link>
          <Link href="/sos-emergency" className="hidden items-center gap-2 rounded-xl bg-rose-500 px-3.5 py-2.5 text-xs font-extrabold tracking-wide text-white shadow-[0_5px_14px_rgba(220,76,76,0.22)] transition hover:bg-rose-600 active:scale-[.98] sm:flex"><span className="h-2 w-2 rounded-full bg-white" />SOS</Link>
          {user ? (
            <button onClick={openProfileModal} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 pr-2.5 hover:bg-slate-50">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-xs font-bold text-teal-700">{profile?.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}</span>
              <span className="hidden max-w-[100px] truncate text-xs font-bold text-slate-700 md:block">{profile?.name || user.displayName || user.email?.split("@")[0]}</span>
              <ChevronDown className="hidden h-3.5 w-3.5 text-slate-400 md:block" />
            </button>
          ) : (
            <button onClick={openAuthModal} className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"><LogIn className="h-3.5 w-3.5" /> Sign in</button>
          )}
        </div>
      </div>
    </header>
  );
}
