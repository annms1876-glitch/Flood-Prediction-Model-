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
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 p-4 rounded-xl bg-cyan-600 text-white shadow-2xl flex items-center gap-3 border border-cyan-400/40 animate-slide-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <span className="uppercase tracking-wider">DDMA Evacuation Logistics</span>
            <span className="text-slate-600">•</span>
            <span>Civil Protection &amp; Shelters</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Evacuation &amp; Relief Tracker
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => showToast("Shelter census & headcount updated across all 3 bases.")}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Sync Census</span>
          </button>
          <button
            onClick={() => showToast("Dispatched emergency requisition for 3 additional HRTC relief buses.")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/30 transition"
          >
            <Truck className="w-4 h-4" />
            <span>Request Extra Convoys</span>
          </button>
        </div>
      </div>

      {/* Overall Progress Meter */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-white">Total District Relief Camp Capacity</h2>
            <p className="text-xs text-slate-400">
              {totalOccupied} citizens safe across 3 designated high-ground shelters
            </p>
          </div>
          <div className="flex items-baseline gap-2 font-mono">
            <span className="text-2xl font-black text-cyan-400">{totalOccupied}</span>
            <span className="text-xs text-slate-400">/ {totalCapacity} Beds Total</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 ml-2">
              {overallOccupancyPct}% Occupied
            </span>
          </div>
        </div>

        <div className="w-full bg-slate-800 h-3.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${overallOccupancyPct}%` }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
            <span className="text-slate-400">Sector 4 (Basin) Evacuated:</span>
            <span className="text-emerald-400 font-bold">82% (340/415)</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
            <span className="text-slate-400">Sector 9 (Lowland) Evacuated:</span>
            <span className="text-amber-400 font-bold">68% (190/280)</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
            <span className="text-slate-400">Remaining in Risk Zones:</span>
            <span className="text-rose-400 font-bold">165 Persons</span>
          </div>
        </div>
      </div>

      {/* Shelter Camps Breakdown */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Building className="w-5 h-5 text-cyan-400" />
          <span>Designated Safe Shelters &amp; Triage Camps</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {shelters.map((shelter) => {
            const pct = Math.round((shelter.occupied / shelter.capacity) * 100);
            return (
              <div
                key={shelter.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        shelter.status === "NEAR_CAPACITY"
                          ? "bg-amber-500/20 text-amber-300"
                          : "bg-emerald-500/20 text-emerald-400"
                      }`}
                    >
                      {shelter.status}
                    </span>
                    <span className="text-xs font-mono font-bold text-white">{pct}%</span>
                  </div>

                  <h3 className="text-base font-bold text-white">{shelter.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{shelter.location}</span>
                  </p>

                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
                    <div
                      className={`h-full rounded-full ${
                        pct > 70 ? "bg-amber-400" : "bg-emerald-400"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800 text-xs">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase block">
                        Beds Free
                      </span>
                      <span className="font-mono font-bold text-emerald-400 mt-0.5 block">
                        {shelter.capacity - shelter.occupied} Beds
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase block">
                        Dry Rations
                      </span>
                      <span className="font-mono font-bold text-white mt-0.5 block">
                        {shelter.rationStockDays} Days Stock
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 text-xs text-slate-400 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="truncate">{shelter.contactPerson}</span>
                    <a
                      href={`tel:${shelter.phone}`}
                      className="text-cyan-400 font-mono font-bold hover:underline"
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
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Truck className="w-5 h-5 text-cyan-400" />
          <span>Active Rescue Transport Convoys (HRTC &amp; SDRF)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {convoys.map((convoy) => (
            <div
              key={convoy.id}
              className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white font-mono">{convoy.id}</span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold">
                  {convoy.status}
                </span>
              </div>
              <p className="font-semibold text-slate-200">{convoy.unit}</p>
              <p className="text-[11px] text-slate-400">Route: {convoy.route}</p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-700/60 text-slate-300">
                <span>
                  Load: <strong>{convoy.passengers} / {convoy.capacity}</strong>
                </span>
                <span className="text-cyan-400 font-mono font-bold">
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
