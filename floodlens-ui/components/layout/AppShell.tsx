"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useUIStore } from "@/lib/store/uiStore";
import { AppHeader } from "./AppHeader";
import { AdminSidebar } from "./AdminSidebar";
import { TacticalFooter } from "./TacticalFooter";
import { AuthModal } from "@/components/auth/AuthModal";
import { ProfileModal } from "@/components/auth/ProfileModal";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { portal, setPortal } = useUIStore();

  const isAdminRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/risk-analytics") ||
    pathname.startsWith("/evacuation-tracker") ||
    pathname.startsWith("/alert-management") ||
    pathname.startsWith("/sensor-network");

  useEffect(() => {
    if (isAdminRoute && portal !== "authority") {
      setPortal("authority");
    } else if (!isAdminRoute && portal === "authority" && (pathname === "/" || pathname === "/3d-map-view" || pathname === "/evacuation-routes" || pathname === "/safety-tips" || pathname === "/sos-emergency")) {
      setPortal("villager");
    }
  }, [pathname, isAdminRoute, portal, setPortal]);

  const isAuthority = isAdminRoute || portal === "authority";

  return (
    <div className="min-h-screen bg-[#0f131f] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Header */}
      <AppHeader />

      {/* Admin Sidebar if Authority Portal */}
      {isAuthority && <AdminSidebar />}

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isAuthority ? "lg:pl-72" : ""
        }`}
      >
        <main className="w-full pt-20 pb-16 min-h-[calc(100vh-80px)] flex flex-col">
          {children}
        </main>
      </div>

      {/* Global Tactical Footer */}
      <TacticalFooter />

      {/* Auth and Profile Modals */}
      <AuthModal />
      <ProfileModal />
    </div>
  );
}
