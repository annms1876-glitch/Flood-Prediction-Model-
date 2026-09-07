"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUIStore } from "@/lib/store/uiStore";
import { useAuth } from "@/lib/context/AuthContext";
import { AppHeader } from "./AppHeader";
import { AdminSidebar } from "./AdminSidebar";
import { TacticalFooter } from "./TacticalFooter";
import { AuthModal } from "@/components/auth/AuthModal";
import { ProfileModal } from "@/components/auth/ProfileModal";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { portal, setPortal, theme, setTheme } = useUIStore();
  const { user, loading } = useAuth();

  const isAdminRoute = [
    "/admin",
    "/risk-analytics",
    "/evacuation-tracker",
    "/alert-management",
    "/sensor-network",
  ].some((route) => pathname.startsWith(route));

  const isUserAdmin = !!(user && user.email === "somenbarik75@gmail.com");

  useEffect(() => {
    if (!loading) {
      if (isAdminRoute && !isUserAdmin) {
        // Force redirect unauthorized users
        setPortal("villager");
        router.push("/");
      }
    }
  }, [loading, user, isUserAdmin, isAdminRoute, router, setPortal]);

  useEffect(() => {
    if (isAdminRoute && isUserAdmin) {
      if (portal !== "authority") setPortal("authority");
    } else {
      if (portal !== "villager") setPortal("villager");
    }
  }, [pathname, isAdminRoute, portal, setPortal, isUserAdmin]);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("umeed-theme");
    if (storedTheme === "dark" || storedTheme === "light") setTheme(storedTheme);
  }, [setTheme]);

  useEffect(() => {
    window.localStorage.setItem("umeed-theme", theme);
  }, [theme]);

  const isAuthority = isAdminRoute && isUserAdmin;
  const shouldRenderContent = !isAdminRoute || (isUserAdmin && !loading);

  return (
    <div data-theme={theme} className="app-root min-h-screen selection:bg-[#f8da9d] selection:text-[#261b07]">
      <AppHeader />
      {isAuthority && <AdminSidebar />}
      <div className={`flex min-h-screen flex-col transition-all duration-300 ${isAuthority ? "lg:pl-72" : ""}`}>
        <main className="dashboard-grid flex-1 pt-20 pb-12">
          {shouldRenderContent ? (
            children
          ) : (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </main>
        <TacticalFooter />
      </div>
      <AuthModal />
      <ProfileModal />
    </div>
  );
}
