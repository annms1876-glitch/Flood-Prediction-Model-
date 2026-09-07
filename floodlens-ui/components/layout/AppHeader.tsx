"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Languages, LogIn, Menu, Moon, ShieldCheck, Sun } from "lucide-react";
import { useUIStore } from "@/lib/store/uiStore";
import { useAuth } from "@/lib/context/AuthContext";
import { useLanguage, useTranslation } from "@/lib/context/LanguageContext";
import { playEmergencySiren } from "@/lib/notifications";

export function AppHeader() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen, theme, toggleTheme } = useUIStore();
  const { user, profile, openAuthModal, openProfileModal } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const isAuthority = ["/admin", "/risk-analytics", "/evacuation-tracker", "/alert-management", "/sensor-network"].some((route) => pathname.startsWith(route));

  return <header className="fixed inset-x-0 top-0 z-50 h-16 border-b border-[#e3dfd5] bg-[#f8f7f5]/95 backdrop-blur-xl">
    <div className="mx-auto flex h-full max-w-[1200px] items-center gap-3 px-4 sm:px-6 lg:px-8">
      {isAuthority && <button onClick={() => setSidebarOpen(!sidebarOpen)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e3dfd5] text-[#61594a] lg:hidden" aria-label="Toggle menu"><Menu className="h-4 w-4" /></button>}
      <Link href="/" className="flex shrink-0 items-center gap-2.5"><img src="/logo.svg" alt="Umeed AI" className="h-9 w-9 object-contain" /><span className="hidden sm:block"><span className="block text-base font-semibold tracking-[-.03em] text-[#261b07]">Umeed <span className="text-[#e89b01]">AI</span></span><span className="block text-[8px] font-semibold uppercase tracking-[.14em] text-[#8f897e]">{t("tagline")}</span></span></Link>
      <div className="hidden h-6 w-px bg-[#e3dfd5] lg:block" />
      <nav className="hidden items-center gap-1 lg:flex"><Link href="/" className={`rounded-lg px-3 py-2 text-sm transition ${pathname === "/" ? "bg-[#e3dfd5] font-semibold text-[#261b07]" : "text-[#61594a] hover:bg-white"}`}>{t("overview")}</Link><Link href="/3d-map-view" className={`rounded-lg px-3 py-2 text-sm transition ${pathname.includes("map") ? "bg-[#e3dfd5] font-semibold text-[#261b07]" : "text-[#61594a] hover:bg-white"}`}>{t("liveMap")}</Link><Link href="/safety-tips" className="rounded-lg px-3 py-2 text-sm text-[#61594a] transition hover:bg-white">{t("preparedness")}</Link>{user?.email === "somenbarik75@gmail.com" && <Link href="/admin-dashboard" className="rounded-lg px-3 py-2 text-sm text-[#8f897e] transition hover:bg-white">{t("command")}</Link>}</nav>
      <div className="ml-auto flex items-center gap-2"><div className="flex items-center gap-0.5 rounded-lg border border-[#e3dfd5] bg-white p-0.5"><Languages className="ml-1.5 h-3.5 w-3.5 text-[#8f897e]" /><button aria-label={t("english")} onClick={() => setLanguage("en")} className={`rounded px-2 py-1 text-[11px] font-semibold ${language === "en" ? "bg-[#f8da9d] text-[#261b07]" : "text-[#8f897e]"}`}>EN</button><button aria-label={t("hindi")} onClick={() => setLanguage("hi")} className={`rounded px-2 py-1 text-[11px] font-semibold ${language === "hi" ? "bg-[#f8da9d] text-[#261b07]" : "text-[#8f897e]"}`}>हिन्दी</button></div><button onClick={toggleTheme} className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e3dfd5] bg-white text-[#61594a]" aria-label="Toggle theme">{theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</button><Link href={isAuthority ? "/alert-management" : "/dashboard"} className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[#e3dfd5] bg-white text-[#61594a]" aria-label={t("alerts")}><Bell className="h-4 w-4" /><span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#f0624f] px-1 text-[9px] font-semibold text-white">12</span></Link><Link href="/sos-emergency" onClick={() => { void playEmergencySiren(); }} className="hidden h-9 items-center gap-1.5 rounded-lg bg-[#261b07] px-3 text-xs font-semibold text-white transition hover:bg-[#61594a] sm:flex"><ShieldCheck className="h-3.5 w-3.5 text-[#f9a600]" /> SOS</Link>{user ? <button onClick={openProfileModal} className="hidden h-9 items-center gap-2 rounded-lg border border-[#e3dfd5] bg-white px-3 text-xs font-semibold text-[#61594a] md:flex">{profile?.name || user.email?.split("@")[0]}</button> : <button onClick={openAuthModal} className="flex items-center gap-1.5 rounded-lg border border-[#261b07] px-3 py-2 text-xs font-semibold text-[#261b07]"><LogIn className="h-3.5 w-3.5" /> {t("signIn")}</button>}</div>
    </div>
  </header>;
}
