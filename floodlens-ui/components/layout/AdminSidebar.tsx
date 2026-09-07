"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUIStore } from "@/lib/store/uiStore";
import {
  LayoutGrid,
  BarChart3,
  Route,
  AlertTriangle,
  Radio,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
} from "lucide-react";

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { sidebarOpen, setPortal } = useUIStore();

  const navItems = [
    {
      href: "/admin-dashboard",
      label: "Command Overview",
      icon: LayoutGrid,
    },
    {
      href: "/risk-analytics",
      label: "Risk Analytics",
      icon: BarChart3,
    },
    {
      href: "/evacuation-tracker",
      label: "Evacuation Tracker",
      icon: Route,
    },
    {
      href: "/alert-management",
      label: "Alert Dispatch",
      icon: AlertTriangle,
    },
    {
      href: "/sensor-network",
      label: "Sensor Telemetry",
      icon: Radio,
    },
  ];

  return (
    <aside
      id="admin-tactical-sidebar"
      className={`fixed left-0 top-0 bottom-0 w-72 bg-[#0a0e1a] z-50 flex flex-col justify-between border-r border-slate-800 shadow-[1px_0_12px_rgba(0,0,0,0.5)] transition-transform duration-300 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}
    >
      <div className="flex flex-col">
        {/* Header Branding */}
        <div className="h-20 px-6 flex items-center gap-3 bg-slate-900/40 border-b border-slate-800/80">
          <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center p-0.5 overflow-hidden border border-slate-800">
            <img src="/logo.svg" alt="Umeed AI Logo" className="h-full w-full object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-white">
              Umeed AI
            </span>
            <span className="text-[10px] text-cyan-400 uppercase tracking-widest font-semibold font-mono">
              NDMA COMMAND
            </span>
          </div>
        </div>



        {/* Operations Hub Navigation */}
        <div className="px-4 py-2">
          <span className="px-3 text-[10px] text-slate-500 uppercase tracking-wider font-semibold font-mono">
            OPERATIONS HUB
          </span>
          <nav className="mt-2 flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href === "/admin-dashboard" && (pathname === "/admin" || pathname === "/admin/dashboard"));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? "bg-cyan-600 text-white font-bold shadow-md shadow-cyan-600/20"
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Profile & Node Online status */}
      <div className="p-6 bg-slate-900/60 border-t border-slate-800/80 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400" />
            </span>
            <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider font-mono">
              NODE ONLINE
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">v4.2.1-MIL</span>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <div className="w-9 h-9 rounded-full bg-cyan-600 flex items-center justify-center shrink-0 text-white shadow-[0_0_12px_rgba(14,165,233,0.35)]">
            <UserCheck className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-white truncate">NDMA Command</span>
            <span className="text-[10px] text-slate-400 truncate">Collector Officer</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
