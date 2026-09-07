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
  const { portal, setPortal, theme, setTheme } = useUIStore();

  const isAdminRoute = [
    "/admin",
    "/risk-analytics",
    "/evacuation-tracker",
    "/alert-management",
    "/sensor-network",
  ].some((route) => pathname.startsWith(route));

  useEffect(() => {
    if (isAdminRoute && portal !== "authority") setPortal("authority");
    if (!isAdminRoute && portal === "authority" && pathname === "/") setPortal("villager");
  }, [pathname, isAdminRoute, portal, setPortal]);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("umeed-theme");
    if (storedTheme === "dark" || storedTheme === "light") setTheme(storedTheme);
  }, [setTheme]);

  useEffect(() => {
    window.localStorage.setItem("umeed-theme", theme);
  }, [theme]);

  const isAuthority = isAdminRoute || portal === "authority";

  return (
    <div data-theme={theme} className="min-h-screen bg-[#f4f7f8] text-[#102331] selection:bg-teal-100 selection:text-teal-950">
      <AppHeader />
      {isAuthority && <AdminSidebar />}
      <div className={`flex min-h-screen flex-col transition-all duration-300 ${isAuthority ? "lg:pl-72" : ""}`}>
        <main className="dashboard-grid flex-1 pt-20 pb-12">
          {children}
        </main>
        <TacticalFooter />
      </div>
      <AuthModal />
      <ProfileModal />
    </div>
  );
}
