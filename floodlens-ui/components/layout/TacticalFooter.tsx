"use client";

import React from "react";
import { Radio, Satellite, Phone } from "lucide-react";

export function TacticalFooter() {
  return (
    <footer
      id="tactical-global-footer"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#e3dfd5] bg-[#261b07]/95 shadow-[0_-1px_8px_rgba(38,27,7,.12)] backdrop-blur-xl"
    >
      <div className="flex h-11 w-full items-center justify-between px-4 text-xs text-[#d5d2cd] sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 overflow-hidden whitespace-nowrap">
          <div className="flex shrink-0 items-center gap-1.5 text-[#f9a600]">
            <Radio className="h-3.5 w-3.5 animate-pulse text-[#f9a600]" />
            <span className="font-medium text-[#fffdf8]">
              Network Status:{" "}
              <span className="font-semibold text-[#f9a600]">1,247 sensors connected</span> across
              Himachal &amp; Uttarakhand
            </span>
          </div>
          <span className="hidden text-[#61594a] md:inline-block">|</span>
          <div className="hidden shrink-0 items-center gap-1.5 text-[#aca89f] md:flex">
            <Satellite className="h-3.5 w-3.5 text-[#f9a600]" />
            <span>
              Last Satellite &amp; Doppler Sync:{" "}
              <span className="font-medium text-[#fffdf8]">12s ago</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="hidden text-[#aca89f] lg:inline-block">Tactical helplines:</span>
          <div className="flex items-center gap-2">
            <a
              id="footer-112-call"
              href="tel:112"
              className="flex items-center gap-1 rounded bg-[#f0624f]/20 px-2 py-0.5 text-[11px] font-semibold text-[#f8da9d] transition-colors hover:bg-[#f0624f]/35"
            >
              <Phone className="w-3 h-3" />
              <span>112 (Natl)</span>
            </a>
            <a
              id="footer-108-call"
              href="tel:108"
              className="hidden items-center gap-1 rounded bg-[#61594a]/40 px-2 py-0.5 text-[11px] font-semibold text-[#d5d2cd] transition-colors hover:bg-[#61594a] sm:flex"
            >
              <span>108 (Med)</span>
            </a>
            <a
              id="footer-1070-call"
              href="tel:1070"
              className="hidden items-center gap-1 rounded bg-[#f9a600]/15 px-2 py-0.5 text-[11px] font-semibold text-[#f9a600] transition-colors hover:bg-[#f9a600]/30 sm:flex"
            >
              <span>1070 (Disaster)</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
