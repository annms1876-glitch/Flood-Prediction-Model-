"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Route,
  Building,
  Truck,
  Users,
  CheckCircle2,
  AlertOctagon,
  ShieldCheck,
  Clock,
  MapPin,
  RefreshCw,
  Plus,
} from "lucide-react";

interface Shelter {
  id: string;
  name: string;
  location: string;
  capacity: number;
  occupied: number;
  status: "OPEN" | "NEAR_CAPACITY" | "FULL";
  medicalTriage: boolean;
  rationStockDays: number;
  contactPerson: string;
  phone: string;
}

interface Convoy {
  id: string;
  unit: string;
  route: string;
  passengers: number;
  capacity: number;
  status: "IN_TRANSIT" | "LOADING" | "STANDBY";
  driver: string;
  etaShelterMin: number;
}

export default function EvacuationTrackerPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const [shelters, setShelters] = useState<Shelter[]>([
    {
      id: "sh-1",
      name: "Govt Model High School Solan",
      location: "Sector 2, Upper Ridge Road (1,540m MSL)",
      capacity: 600,
      occupied: 450,
      status: "NEAR_CAPACITY",
      medicalTriage: true,
      rationStockDays: 7,
      contactPerson: "Principal A. Sharma (Warden)",
      phone: "+91 98160-55441",
    },
    {
      id: "sh-2",
      name: "Govt Degree College Hill Ground",
      location: "Shiva Temple Hill Plateau (1,590m MSL)",
      capacity: 500,
      occupied: 200,
      status: "OPEN",
      medicalTriage: true,
      rationStockDays: 10,
      contactPerson: "Dr. K. Mehta (Relief Officer)",
      phone: "+91 94180-22339",
    },
    {
      id: "sh-3",
      name: "Thodo Ground Sports Pavilion",
      location: "Central Solan High Ground (1,510m MSL)",
      capacity: 300,
      occupied: 120,
      status: "OPEN",
      medicalTriage: false,
      rationStockDays: 4,
      contactPerson: "Sports Officer R. Chauhan",
      phone: "+91 98055-33221",
    },
  ]);

  const [convoys, setConvoys] = useState<Convoy[]>([
    {
      id: "HRTC-401",
      unit: "42-Seater Himachal Bus #401",
      route: "Sector 4 Lower Khad → Model High School",
      passengers: 38,
      capacity: 42,
      status: "IN_TRANSIT",
      driver: "Sukhdev Singh (HRTC)",
      etaShelterMin: 7,
    },
    {
      id: "HRTC-402",
      unit: "42-Seater Himachal Bus #402",
      route: "Saproon Nullah → Degree College Ground",
      passengers: 42,
      capacity: 42,
      status: "LOADING",
      driver: "Mohan Lal (HRTC)",
      etaShelterMin: 14,
    },
    {
      id: "SDRF-TRUCK-02",
      unit: "SDRF All-Terrain 4x4 Truck #02",
      route: "Old Bypass Culvert (Rapid Extraction)",
      passengers: 12,
      capacity: 18,
      status: "IN_TRANSIT",
      driver: "Havildar Gurpreet",
      etaShelterMin: 5,
    },
  ]);

  const totalCapacity = shelters.reduce((acc, s) => acc + s.capacity, 0);
  const totalOccupied = shelters.reduce((acc, s) => acc + s.occupied, 0);
  const overallOccupancyPct = Math.round((totalOccupied / totalCapacity) * 100);

  return (
    <div className="evacuation-tracker-page mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 p-4 rounded-xl bg-cyan-600 text-[#261b07] shadow-[0_4px_8px_rgba(38,27,7,.06)] flex items-center gap-3 border border-cyan-400/40 animate-slide-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#e89b01] mb-1">
            <span className="uppercase tracking-wider">DDMA Evacuation Logistics</span>
            <span className="text-[#8f897e]">•</span>
            <span>Civil Protection &amp; Shelters</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#261b07] tracking-tight flex items-center gap-3">
            Evacuation &amp; Relief Tracker
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => showToast("Shelter census & headcount updated across all 3 bases.")}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#e3dfd5] hover:bg-slate-700 text-[#261b07] text-xs font-bold border border-[#d5d2cd] transition"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Sync Census</span>
          </button>
          <button
            onClick={() => showToast("Dispatched emergency requisition for 3 additional HRTC relief buses.")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-[#f9a600] text-[#261b07] text-xs font-bold shadow-lg shadow-cyan-600/30 transition"
          >
            <Truck className="w-4 h-4" />
            <span>Request Extra Convoys</span>
          </button>
        </div>
      </div>

      {/* Overall Progress Meter */}
      <div className="p-6 rounded-3xl bg-white border border-[#e3dfd5] shadow-[0_4px_8px_rgba(38,27,7,.06)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-[#261b07]">Total District Relief Camp Capacity</h2>
            <p className="text-xs text-[#8f897e]">
              {totalOccupied} citizens safe across 3 designated high-ground shelters
            </p>
          </div>
          <div className="flex items-baseline gap-2 font-mono">
            <span className="text-2xl font-black text-[#e89b01]">{totalOccupied}</span>
            <span className="text-xs text-[#8f897e]">/ {totalCapacity} Beds Total</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#f9a600]/20 text-[#e89b01] ml-2">
              {overallOccupancyPct}% Occupied
            </span>
          </div>
        </div>

        <div className="w-full bg-[#e3dfd5] h-3.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${overallOccupancyPct}%` }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
          <div className="p-3 rounded-xl bg-[#e3dfd5]/60 border border-[#d5d2cd]/60 flex items-center justify-between">
            <span className="text-[#8f897e]">Sector 4 (Basin) Evacuated:</span>
            <span className="text-[#6f8d54] font-bold">82% (340/415)</span>
          </div>
          <div className="p-3 rounded-xl bg-[#e3dfd5]/60 border border-[#d5d2cd]/60 flex items-center justify-between">
            <span className="text-[#8f897e]">Sector 9 (Lowland) Evacuated:</span>
            <span className="text-[#e89b01] font-bold">68% (190/280)</span>
          </div>
          <div className="p-3 rounded-xl bg-[#e3dfd5]/60 border border-[#d5d2cd]/60 flex items-center justify-between">
            <span className="text-[#8f897e]">Remaining in Risk Zones:</span>
            <span className="text-[#d94b3b] font-bold">165 Persons</span>
          </div>
        </div>
      </div>

      {/* Shelter Camps Breakdown */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#261b07] flex items-center gap-2">
          <Building className="w-5 h-5 text-[#e89b01]" />
          <span>Designated Safe Shelters &amp; Triage Camps</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {shelters.map((shelter) => {
            const pct = Math.round((shelter.occupied / shelter.capacity) * 100);
            return (
              <div
                key={shelter.id}
                className="p-5 rounded-2xl bg-white border border-[#e3dfd5] shadow-[0_4px_8px_rgba(38,27,7,.06)] flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        shelter.status === "NEAR_CAPACITY"
                          ? "bg-[#f9a600]/20 text-[#e89b01]"
                          : "bg-[#6f8d54]/20 text-[#6f8d54]"
                      }`}
                    >
                      {shelter.status}
                    </span>
                    <span className="text-xs font-mono font-bold text-[#261b07]">{pct}%</span>
                  </div>

                  <h3 className="text-base font-bold text-[#261b07]">{shelter.name}</h3>
                  <p className="text-xs text-[#8f897e] mt-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#e89b01] shrink-0" />
                    <span>{shelter.location}</span>
                  </p>

                  <div className="w-full bg-[#e3dfd5] h-2 rounded-full overflow-hidden mt-3">
                    <div
                      className={`h-full rounded-full ${
                        pct > 70 ? "bg-amber-400" : "bg-emerald-400"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-[#e3dfd5] text-xs">
                    <div>
                      <span className="text-[10px] font-mono text-[#8f897e] uppercase block">
                        Beds Free
                      </span>
                      <span className="font-mono font-bold text-[#6f8d54] mt-0.5 block">
                        {shelter.capacity - shelter.occupied} Beds
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-[#8f897e] uppercase block">
                        Dry Rations
                      </span>
                      <span className="font-mono font-bold text-[#261b07] mt-0.5 block">
                        {shelter.rationStockDays} Days Stock
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#e3dfd5] text-xs text-[#8f897e] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="truncate">{shelter.contactPerson}</span>
                    <a
                      href={`tel:${shelter.phone}`}
                      className="text-[#e89b01] font-mono font-bold hover:underline"
                    >
                      CALL
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Evacuation Convoys & Transit Fleet */}
      <div className="rounded-3xl bg-white border border-[#e3dfd5] p-6 shadow-[0_4px_8px_rgba(38,27,7,.06)] space-y-4">
        <h2 className="text-base font-bold text-[#261b07] flex items-center gap-2">
          <Truck className="w-5 h-5 text-[#e89b01]" />
          <span>Active Rescue Transport Convoys (HRTC &amp; SDRF)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {convoys.map((convoy) => (
            <div
              key={convoy.id}
              className="p-4 rounded-xl bg-[#e3dfd5]/60 border border-[#d5d2cd]/60 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#261b07] font-mono">{convoy.id}</span>
                <span className="px-2 py-0.5 rounded-full bg-[#f9a600]/20 text-[#e89b01] font-mono text-[10px] font-bold">
                  {convoy.status}
                </span>
              </div>
              <p className="font-semibold text-[#261b07]">{convoy.unit}</p>
              <p className="text-[11px] text-[#8f897e]">Route: {convoy.route}</p>

              <div className="flex items-center justify-between pt-2 border-t border-[#d5d2cd]/60 text-[#61594a]">
                <span>
                  Load: <strong>{convoy.passengers} / {convoy.capacity}</strong>
                </span>
                <span className="text-[#e89b01] font-mono font-bold">
                  ETA: ~{convoy.etaShelterMin} mins
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
