"use client";

import React from "react";
import { Radio, Satellite, Phone } from "lucide-react";

export function TacticalFooter() {
  return (
    <footer
      id="tactical-global-footer"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#0a0e1a]/95 backdrop-blur-xl border-t border-slate-800/80 shadow-[0_-1px_8px_rgba(0,0,0,0.5)]"
    >
      <div className="h-11 w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between text-slate-400 text-xs font-mono">
        <div className="flex items-center gap-4 overflow-hidden whitespace-nowrap">
          <div className="flex items-center gap-1.5 text-cyan-400 shrink-0">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="font-medium text-slate-200">
              Network Status:{" "}
              <span className="text-cyan-400 font-bold">1,247 sensors connected</span> across
              Himachal &amp; Uttarakhand
            </span>
          </div>
          <span className="text-slate-700 hidden md:inline-block">|</span>
          <div className="hidden md:flex items-center gap-1.5 shrink-0 text-slate-400">
            <Satellite className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              Last Satellite &amp; Doppler Sync:{" "}
              <span className="text-slate-200 font-medium">12s ago</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="hidden lg:inline-block text-slate-400">Tactical Helplines:</span>
          <div className="flex items-center gap-2">
            <a
              id="footer-112-call"
              href="tel:112"
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 hover:text-white transition-colors font-bold text-[11px]"
            >
              <Phone className="w-3 h-3" />
              <span>112 (Natl)</span>
            </a>
            <a
              id="footer-108-call"
              href="tel:108"
              className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-400 hover:text-white transition-colors font-bold text-[11px]"
            >
              <span>108 (Med)</span>
            </a>
            <a
              id="footer-1070-call"
              href="tel:1070"
              className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 hover:text-white transition-colors font-bold text-[11px]"
            >
              <span>1070 (Disaster)</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
