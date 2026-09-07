"use client";

import { useUIStore } from "@/lib/store/uiStore";
import { Bell, Menu, Search } from "lucide-react";

export function Navbar() {
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  return (
    <header className="h-16 border-b border-white/5 bg-brand-card/80 backdrop-blur-xl flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors"
        >
          <Menu className="w-5 h-5 text-gray-400" />
        </button>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search sensors, locations..."
            className="bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-accent/50 w-64"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-lg hover:bg-white/5 transition-colors">
          <Bell className="w-5 h-5 text-gray-400" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <div className="w-8 h-8 rounded-full bg-brand-accent/20 flex items-center justify-center text-brand-accent text-sm font-semibold">
          UA
        </div>
      </div>
    </header>
  );
}
