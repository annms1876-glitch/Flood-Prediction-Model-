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

  return <header className="fixed inset-x-0 top-0 z-50 h-16 border-b border-[#b8dec1] bg-white/95 shadow-[0_2px_12px_rgba(33,33,33,0.06)] backdrop-blur-xl transition-all duration-300">
    <div className="mx-auto flex h-full max-w-[1500px] items-center gap-2 px-4 sm:px-6 lg:px-8">
      {isAuthority && (
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)} 
          className="h-9 w-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 lg:hidden transition-all duration-200 hover:scale-105 active:scale-95" 
          aria-label="Toggle menu"
        >
          <Menu className="h-4 w-4" />
        </button>
      )}
      <Link href="/" className="flex shrink-0 items-center gap-2.5 transition-all duration-200 hover:opacity-90">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-transparent overflow-hidden">
          <img src="/logo.svg" alt="Umeed AI Logo" className="h-full w-full object-contain" />
        </span>
        <span className="hidden sm:block">
          <span className="block text-base font-black tracking-tight text-[#212121] leading-none">Umeed <span className="text-[#0097a7]">AI</span></span>
          <span className="block text-[8px] font-extrabold uppercase tracking-[.14em] text-slate-500 mt-0.5 leading-none">{t("tagline")}</span>
        </span>
      </Link>
      <div className="hidden h-6 w-px bg-slate-200 xl:block" />
      <nav className="hidden items-center gap-0.5 lg:flex">
        <Link href="/" className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all duration-200 hover:scale-102 ${pathname === "/" ? "bg-[#e8f5e9] text-[#00796b]" : "text-slate-600 hover:bg-slate-50"}`}>
          {t("overview")}
        </Link>
        <Link href="/3d-map-view" className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all duration-200 hover:scale-102 ${pathname.includes("map") ? "bg-[#e8f5e9] text-[#00796b]" : "text-slate-600 hover:bg-slate-50"}`}>
          {t("liveMap")}
        </Link>
        <Link href="/safety-tips" className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all duration-200 hover:scale-102">
          {t("preparedness")}
        </Link>
        {user && user.email === "somenbarik75@gmail.com" && (
          <Link href="/admin-dashboard" className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all duration-200 hover:scale-102 ${pathname.startsWith("/admin") || pathname === "/risk-analytics" || pathname === "/evacuation-tracker" || pathname === "/alert-management" || pathname === "/sensor-network" ? "bg-cyan-500/10 text-cyan-500 border border-cyan-500/20" : "text-cyan-600 hover:bg-cyan-50"}`}>
            Command Centre
          </Link>
        )}
      </nav>
      <div className="ml-auto flex items-center gap-1.5">
        <div className="flex items-center gap-0.5 rounded-lg border border-[#80cbc4] bg-[#e8f5e9] p-0.5 transition-all duration-200" aria-label={t("language")}>
          <Languages className="ml-1.5 mr-0.5 h-3.5 w-3.5 text-[#00796b]" />
          <button 
            onClick={() => setLanguage("en")} 
            className={`h-7 rounded px-2 text-[11px] font-bold transition-all duration-200 ${language === "en" ? "bg-white text-[#212121] shadow-xs hover:scale-102" : "text-slate-500 hover:text-slate-800"}`}
          >
            EN
          </button>
          <button 
            onClick={() => setLanguage("hi")} 
            className={`h-7 rounded px-2 text-[11px] font-bold transition-all duration-200 ${language === "hi" ? "bg-white text-[#212121] shadow-xs hover:scale-102" : "text-slate-500 hover:text-slate-800"}`}
          >
            हिन्दी
          </button>
        </div>
        <button 
          onClick={toggleTheme} 
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-[#e8f5e9] hover:text-[#00796b] transition-all duration-200 hover:scale-105 active:scale-95" 
          aria-label={theme === "dark" ? t("lightTheme") : t("darkTheme")} 
          title={theme === "dark" ? t("lightTheme") : t("darkTheme")}
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        <Link 
          href={isAuthority ? "/alert-management" : "/dashboard"} 
          className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-[#e8f5e9] hover:text-[#00796b] transition-all duration-200 hover:scale-105 active:scale-95" 
          aria-label={t("alerts")}
        >
          <Bell className="h-4 w-4" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#d32f2f] px-0.5 text-[8px] font-black text-white leading-none">
            12
          </span>
        </Link>
        <Link 
          href="/sos-emergency" 
          className="hidden h-8 items-center gap-1.5 rounded-lg bg-[#d32f2f] px-3 text-xs font-black text-white shadow-sm transition-all duration-200 hover:bg-[#b71c1c] hover:scale-105 active:scale-95 sm:flex"
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          SOS
        </Link>
        {user ? (
          <button 
            onClick={openProfileModal} 
            className="flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white p-0.5 pr-2.5 hover:bg-slate-50 transition-all duration-200 hover:scale-103 active:scale-97"
          >
            <span className="flex h-6.5 w-6.5 items-center justify-center rounded bg-[#e0f2f1] text-[11px] font-black text-[#00796b]">
              {profile?.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
            </span>
            <span className="hidden max-w-[80px] truncate text-xs font-bold text-slate-700 md:block">
              {profile?.name || user.displayName || user.email?.split("@")[0]}
            </span>
            <ChevronDown className="hidden h-3 w-3 text-slate-400 md:block" />
          </button>
        ) : (
          <button 
            onClick={openAuthModal} 
            className="flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <LogIn className="h-3.5 w-3.5" />
            {t("signIn")}
          </button>
        )}
      </div>
    </div>
  </header>;
}
