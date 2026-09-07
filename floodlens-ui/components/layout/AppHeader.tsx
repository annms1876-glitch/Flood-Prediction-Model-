"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUIStore } from "@/lib/store/uiStore";
import { useAuth } from "@/lib/context/AuthContext";
import {
  Bell,
  Thermometer,
  User as UserIcon,
  ShieldAlert,
  Radio,
  Satellite,
  Menu,
  Sparkles,
  LogIn,
} from "lucide-react";

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { portal, setPortal, sidebarOpen, setSidebarOpen } = useUIStore();
  const { user, profile, openAuthModal, openProfileModal } = useAuth();

  // Determine portal from route or store
  const isAdminRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/risk-analytics") ||
    pathname.startsWith("/evacuation-tracker") ||
    pathname.startsWith("/alert-management") ||
    pathname.startsWith("/sensor-network");

  const currentPortal = isAdminRoute ? "authority" : portal;

  const handlePortalSwitch = (targetPortal: "villager" | "authority") => {
    setPortal(targetPortal);
    if (targetPortal === "authority") {
      router.push("/admin-dashboard");
    } else {
      router.push("/");
    }
  };

  const villagerNavLinks = [
    { href: "/", label: "Dashboard" },
    { href: "/3d-map-view", label: "3D Map" },
    { href: "/evacuation-routes", label: "Evacuation Routes" },
    { href: "/safety-tips", label: "Safety Tips" },
    { href: "/sos-emergency", label: "SOS Urgent", isUrgent: true },
  ];

  return (
    <header
      id="app-global-header"
      className="fixed top-0 left-0 right-0 z-50 h-20 bg-[#0a0e1a]/90 backdrop-blur-xl border-b border-slate-800/80 shadow-[0_1px_8px_rgba(0,0,0,0.4)]"
    >
      <div className="h-full w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Left Segment: Logo & Portal Switcher */}
        <div className="flex items-center gap-4 lg:gap-6 shrink-0">
          {/* Mobile Admin sidebar toggle */}
          {currentPortal === "authority" && (
            <button
              id="mobile-admin-sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400 font-bold shadow-[0_0_12px_rgba(14,165,233,0.35)]">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base sm:text-lg tracking-tight text-white">
                  FloodShield <span className="text-cyan-400">AI</span>
                </span>
                <span className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[9px] font-mono font-bold text-cyan-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  SYS ONLINE
                </span>
              </div>
              <span className="text-[10px] text-slate-400 hidden sm:inline-block">
                Early Warning, Every Life Matters
              </span>
            </div>
          </Link>

          {/* Portal Switcher Pill */}
          <div
            id="portal-switcher-pill"
            className="flex items-center bg-slate-900/90 border border-slate-800 p-1 rounded-xl shadow-inner"
          >
            <button
              id="switch-to-villager-btn"
              onClick={() => handlePortalSwitch("villager")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                currentPortal === "villager"
                  ? "bg-cyan-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Villager Portal
            </button>
            <button
              id="switch-to-authority-btn"
              onClick={() => handlePortalSwitch("authority")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                currentPortal === "authority"
                  ? "bg-cyan-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Authority Command Center
            </button>
          </div>
        </div>

        {/* Center: Villager Navigation Links (if in Villager mode) */}
        {currentPortal === "villager" && (
          <nav className="hidden xl:flex items-center gap-1">
            {villagerNavLinks.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href === "/3d-map-view" && pathname === "/map") ||
                (item.href === "/evacuation-routes" && pathname === "/evacuation") ||
                (item.href === "/safety-tips" && pathname === "/safety") ||
                (item.href === "/sos-emergency" && pathname === "/sos");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                      : item.isUrgent
                      ? "text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}

        {/* Right Segment: Zone, Sync, Alerts, SOS, Auth */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Weather & Location Pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <Thermometer className="w-4 h-4 text-cyan-400" />
            <span className="text-white font-medium">Solan, HP</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400 font-mono">24°C / 65% RH</span>
          </div>

          {/* Sync badge */}
          <div className="hidden 2xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <Satellite className="w-3.5 h-3.5 text-cyan-400" />
            <span>Sync: 12s ago</span>
          </div>

          {/* Alert Counter Badge */}
          <Link
            id="nav-alerts-badge"
            href={currentPortal === "authority" ? "/alert-management" : "/dashboard"}
            className="relative flex items-center justify-center p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Active flood advisories"
          >
            <Bell className="w-4 h-4 text-slate-300" />
            <span className="absolute -top-1.5 -right-1.5 flex h-4 px-1.5 items-center justify-center rounded-full bg-rose-600 text-white font-mono text-[9px] font-bold ring-2 ring-slate-950">
              12 Alerts
            </span>
          </Link>

          {/* SOS Urgent Action Button */}
          <Link
            id="header-sos-button"
            href="/sos-emergency"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_14px_rgba(239,68,68,0.45)] active:scale-95"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            <span>{currentPortal === "authority" ? "BROADCAST SOS" : "SOS HOTLINE"}</span>
          </Link>

          {/* User Auth & Profile Trigger */}
          {user ? (
            <button
              id="header-profile-btn"
              onClick={openProfileModal}
              className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
              title="View & Edit Demographics Database"
            >
              <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-bold text-xs">
                {profile?.name ? profile.name[0].toUpperCase() : user.email?.[0].toUpperCase() || "U"}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-semibold text-white leading-none truncate max-w-[100px]">
                  {profile?.name || user.displayName || user.email?.split("@")[0]}
                </span>
                <span className="text-[10px] text-cyan-400 font-mono leading-none mt-1">
                  {profile?.role || "Resident"}
                </span>
              </div>
            </button>
          ) : (
            <button
              id="header-signin-btn"
              onClick={openAuthModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
