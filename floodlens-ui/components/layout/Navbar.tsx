"use client";

import { useUIStore } from "@/lib/store/uiStore";
import { useAuth } from "@/lib/context/AuthContext";
import { Bell, Menu, Search, User as UserIcon, LogIn, Database, ShieldCheck } from "lucide-react";

export function Navbar() {
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const { user, profile, loading, openAuthModal, openProfileModal } = useAuth();

  return (
    <header className="h-16 border-b border-white/5 bg-brand-card/80 backdrop-blur-xl flex items-center justify-between px-6 shrink-0 z-30">
      <div className="flex items-center gap-4">
        <button
          id="toggle-sidebar-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5 text-gray-400" />
        </button>
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            id="nav-search-input"
            type="text"
            placeholder="Search sensors, locations..."
            className="bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-hidden focus:border-cyan-500 w-64"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Firestore status badge */}
        <div
          id="firestore-connection-pill"
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-300"
          title="Connected to Firebase Firestore"
        >
          <Database className="w-3.5 h-3.5 text-cyan-400" />
          <span>Firestore Connected</span>
        </div>

        {/* Notifications */}
        <button
          id="nav-notifications-btn"
          className="relative p-2 rounded-lg hover:bg-white/5 transition-colors"
          aria-label="Alerts"
        >
          <Bell className="w-5 h-5 text-gray-400" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
        </button>

        {/* Authentication controls */}
        {loading ? (
          <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />
        ) : user ? (
          <button
            id="user-profile-button"
            onClick={openProfileModal}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition duration-150"
            title="View & Edit Firestore Profile"
          >
            <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-bold text-xs">
              {profile?.name ? profile.name[0].toUpperCase() : user.email?.[0].toUpperCase() || "U"}
            </div>
            <div className="text-left hidden sm:block">
              <span className="text-xs font-semibold text-white block leading-tight truncate max-w-[120px]">
                {profile?.name || user.displayName || user.email?.split("@")[0]}
              </span>
              <span className="text-[10px] text-cyan-400 block leading-tight truncate max-w-[120px]">
                {profile?.location || "Regional Station"}
              </span>
            </div>
          </button>
        ) : (
          <button
            id="open-signin-button"
            onClick={openAuthModal}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition duration-150 shadow-md shadow-cyan-600/20"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In / Register</span>
          </button>
        )}
      </div>
    </header>
  );
}
