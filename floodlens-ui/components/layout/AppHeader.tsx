"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, ChevronDown, Languages, LogIn, Menu, Moon, ShieldCheck, Sun, Waves } from "lucide-react";
import { useUIStore } from "@/lib/store/uiStore";
import { useAuth } from "@/lib/context/AuthContext";
import { useLanguage, useTranslation } from "@/lib/context/LanguageContext";

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { portal, setPortal, sidebarOpen, setSidebarOpen, theme, toggleTheme } = useUIStore();
  const { user, profile, openAuthModal, openProfileModal } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const isAdminRoute = ["/admin", "/risk-analytics", "/evacuation-tracker", "/alert-management", "/sensor-network"].some((route) => pathname.startsWith(route));
  const isAuthority = isAdminRoute || portal === "authority";
  const switchPortal = (next: "villager" | "authority") => { setPortal(next); router.push(next === "authority" ? "/admin-dashboard" : "/"); };

  return <header className="fixed inset-x-0 top-0 z-50 h-20 border-b border-[#b8dec1] bg-white/95 shadow-[0_4px_18px_rgba(33,33,33,0.08)] backdrop-blur-xl">
    <div className="mx-auto flex h-full max-w-[1500px] items-center gap-3 px-4 sm:px-6 lg:px-8">
      {isAuthority && <button onClick={() => setSidebarOpen(!sidebarOpen)} className="min-h-12 min-w-12 rounded-xl border border-slate-200 p-2 text-slate-700 hover:bg-slate-50 lg:hidden" aria-label="Toggle menu"><Menu className="mx-auto h-5 w-5" /></button>}
      <Link href="/" className="flex shrink-0 items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#212121] text-[#26c6da] shadow-sm"><Waves className="h-6 w-6" /></span><span className="hidden sm:block"><span className="block text-lg font-black tracking-tight text-[#212121]">Umeed <span className="text-[#0097a7]">AI</span></span><span className="block text-[10px] font-bold uppercase tracking-[.14em] text-slate-500">{t("tagline")}</span></span></Link>
      <div className="hidden h-8 w-px bg-slate-200 xl:block" />
      <div className="hidden items-center gap-1 rounded-xl bg-slate-100 p-1 xl:flex"><button onClick={() => switchPortal("villager")} className={`min-h-10 rounded-lg px-3 text-sm font-bold ${!isAuthority ? "bg-white text-[#212121] shadow-sm" : "text-slate-500"}`}>{t("community")}</button><button onClick={() => switchPortal("authority")} className={`min-h-10 rounded-lg px-3 text-sm font-bold ${isAuthority ? "bg-[#212121] text-white" : "text-slate-500"}`}>{t("command")}</button></div>
      {!isAuthority && <nav className="hidden items-center gap-1 lg:flex"><Link href="/" className={`rounded-lg px-3 py-2 text-sm font-bold ${pathname === "/" ? "bg-[#e8f5e9] text-[#00796b]" : "text-slate-600 hover:bg-slate-50"}`}>{t("overview")}</Link><Link href="/3d-map-view" className={`rounded-lg px-3 py-2 text-sm font-bold ${pathname.includes("map") ? "bg-[#e8f5e9] text-[#00796b]" : "text-slate-600 hover:bg-slate-50"}`}>{t("liveMap")}</Link><Link href="/safety-tips" className="rounded-lg px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">{t("preparedness")}</Link></nav>}
      <div className="ml-auto flex items-center gap-2">
        <div className="flex items-center gap-1 rounded-xl border border-[#80cbc4] bg-[#e8f5e9] p-1" aria-label={t("language")}><Languages className="ml-2 h-4 w-4 text-[#00796b]" /><button onClick={() => setLanguage("en")} className={`min-h-10 rounded-lg px-2.5 text-sm font-bold ${language === "en" ? "bg-white text-[#212121] shadow-sm" : "text-slate-500"}`}>EN</button><button onClick={() => setLanguage("hi")} className={`min-h-10 rounded-lg px-2.5 text-sm font-bold ${language === "hi" ? "bg-white text-[#212121] shadow-sm" : "text-slate-500"}`}>हिन्दी</button></div>
        <button onClick={toggleTheme} className="flex min-h-12 min-w-12 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-[#e8f5e9]" aria-label={theme === "dark" ? t("lightTheme") : t("darkTheme")} title={theme === "dark" ? t("lightTheme") : t("darkTheme")}>{theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}</button>
        <Link href={isAuthority ? "/alert-management" : "/dashboard"} className="relative flex min-h-12 min-w-12 items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:bg-[#e8f5e9]" aria-label={t("alerts")}><Bell className="h-5 w-5" /><span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#d32f2f] px-1 text-[10px] font-black text-white">12</span></Link>
        <Link href="/sos-emergency" className="hidden min-h-12 items-center gap-2 rounded-xl bg-[#d32f2f] px-4 text-sm font-black text-white shadow-sm transition hover:bg-[#b71c1c] sm:flex"><ShieldCheck className="h-4 w-4" />SOS</Link>
        {user ? <button onClick={openProfileModal} className="flex min-h-12 items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 pr-3 hover:bg-slate-50"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e0f2f1] text-sm font-black text-[#00796b]">{profile?.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}</span><span className="hidden max-w-[100px] truncate text-sm font-bold text-slate-700 md:block">{profile?.name || user.displayName || user.email?.split("@")[0]}</span><ChevronDown className="hidden h-4 w-4 text-slate-400 md:block" /></button> : <button onClick={openAuthModal} className="flex min-h-12 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-700 hover:bg-slate-50"><LogIn className="h-4 w-4" />{t("signIn")}</button>}
      </div>
    </div>
  </header>;
}
