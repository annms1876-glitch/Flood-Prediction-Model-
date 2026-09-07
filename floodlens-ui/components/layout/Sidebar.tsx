"use client";

import { useUIStore } from "@/lib/store/uiStore";
import {
  LayoutDashboard,
  Gauge,
  MapPinned,
  AlertTriangle,
  Camera,
  Settings,
  Droplets,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const navItems = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/predictions", label: "Predict", icon: Droplets },
  { href: "/map", label: "3D Map", icon: MapPinned },
  { href: "/sensors", label: "Sensors", icon: Camera },
  { href: "/alerts", label: "Alerts", icon: AlertTriangle },
  { href: "/model", label: "Model", icon: Settings },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const { sidebarOpen, activePage } = useUIStore();

  return (
    <aside
      className={cn(
        "h-full border-r border-white/5 bg-brand-card/50 backdrop-blur-xl transition-all duration-300 shrink-0 flex flex-col",
        sidebarOpen ? "w-64" : "w-16"
      )}
    >
      <div className="h-16 flex items-center px-4 border-b border-white/5 shrink-0">
        {sidebarOpen && (
          <span className="text-lg font-bold text-white">
            FloodLens
            <span className="text-brand-accent"> AI</span>
          </span>
        )}
      </div>
      <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto scrollbar-thin">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
              activePage === label || href === "/"
                ? "bg-brand-accent/10 text-brand-accent"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            )}
          >
            <Icon className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span>{label}</span>}
          </Link>
        ))}
      </nav>
      <div className="p-3 border-t border-white/5 shrink-0">
        {sidebarOpen && (
          <div className="text-xs text-gray-500 text-center">
            SIH 2026 — Hilly Regions
          </div>
        )}
      </div>
    </aside>
  );
}
