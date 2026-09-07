"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Radio,
  Wifi,
  Battery,
  Zap,
  Activity,
  Droplet,
  Compass,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sliders,
  Settings2,
} from "lucide-react";

interface StationTelemetry {
  id: string;
  name: string;
  location: string;
  elevation: number;
  batteryV: number;
  solarStatus: "CHARGING" | "FLOAT" | "DISCHARGING";
  rssi: number;
  packetRate: number;
  sensors: {
    type: string;
    reading: string;
    unit: string;
    status: "NORMAL" | "WARNING" | "CRITICAL";
  }[];
  lastPingSec: number;
}

export default function SensorNetworkPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isPinging, setIsPinging] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const [stations, setStations] = useState<StationTelemetry[]>([
    {
      id: "ST-01",
      name: "Upper Catchment Meteorology Post",
      location: "Kalka-Shimla Ridge (30.912° N, 77.089° E)",
      elevation: 1650,
      batteryV: 12.8,
      solarStatus: "FLOAT",
      rssi: -84,
      packetRate: 99.8,
      lastPingSec: 22,
      sensors: [
        { type: "Tipping Bucket Rain Gauge", reading: "14.2", unit: "mm/h", status: "WARNING" },
        { type: "Atmospheric Barometer", reading: "835.4", unit: "hPa", status: "NORMAL" },
        { type: "Ambient Air Temp / Humidity", reading: "19.4°C / 88%", unit: "", status: "NORMAL" },
      ],
    },
    {
      id: "ST-02",
      name: "Khad River Bridge Hydrometric Radar",
      location: "Main Solan Embankment (30.904° N, 77.093° E)",
      elevation: 1485,
      batteryV: 12.5,
      solarStatus: "CHARGING",
      rssi: -78,
      packetRate: 99.4,
      lastPingSec: 14,
      sensors: [
        { type: "Ultrasonic 24GHz Stage Radar", reading: "2.84", unit: "m MSL", status: "CRITICAL" },
        { type: "Surface Doppler Water Velocity", reading: "3.4", unit: "m/s", status: "WARNING" },
        { type: "Water Temperature Sensor", reading: "14.8", unit: "°C", status: "NORMAL" },
      ],
    },
    {
      id: "ST-03",
      name: "Temple Hill Inclinometer & Geotech",
      location: "Slope Transect B (30.908° N, 77.098° E)",
      elevation: 1540,
      batteryV: 12.2,
      solarStatus: "DISCHARGING",
      rssi: -92,
      packetRate: 97.2,
      lastPingSec: 45,
      sensors: [
        { type: "3-Axis MEMS Tilt Inclinometer", reading: "0.82", unit: "degrees", status: "NORMAL" },
        { type: "Pore-Water Pressure Transducer", reading: "44.2", unit: "kPa", status: "WARNING" },
        { type: "Capacitive Soil Saturation", reading: "82.5", unit: "% Vol", status: "CRITICAL" },
      ],
    },
    {
      id: "ST-04",
      name: "Saproon Tributary Culvert Station",
      location: "East Gorge Siphon (30.898° N, 77.085° E)",
      elevation: 1460,
      batteryV: 12.9,
      solarStatus: "FLOAT",
      rssi: -86,
      packetRate: 99.1,
      lastPingSec: 18,
      sensors: [
        { type: "Hydrostatic Submersible Pressure", reading: "1.95", unit: "m", status: "WARNING" },
        { type: "Turbidity Nephelometer", reading: "420", unit: "NTU", status: "WARNING" },
        { type: "Runoff Discharge Estimate", reading: "38.5", unit: "m³/s", status: "WARNING" },
      ],
    },
  ]);

  const handlePingAll = () => {
    setIsPinging(true);
    setTimeout(() => {
      setIsPinging(false);
      setStations((prev) =>
        prev.map((s) => ({
          ...s,
          lastPingSec: Math.floor(Math.random() * 5 + 1),
        }))
      );
      showToast("All 4 IoT stations responded with 100% telemetry integrity.");
    }, 1000);
  };

  return (
    <div className="sensor-telemetry-page mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
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
            <span className="uppercase tracking-wider">IoT Hydro-Meteorological Gateway</span>
            <span className="text-[#8f897e]">•</span>
            <span>LoRaWAN 868 MHz &amp; 4G Dual Uplink</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#261b07] tracking-tight flex items-center gap-3">
            Sensor Network &amp; Telemetry Health
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="ping-sensors-btn"
            onClick={handlePingAll}
            disabled={isPinging}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#e3dfd5] hover:bg-slate-700 text-[#261b07] text-xs font-bold border border-[#d5d2cd] transition"
          >
            <RefreshCw className={`w-4 h-4 ${isPinging ? "animate-spin" : ""}`} />
            <span>{isPinging ? "Querying Nodes..." : "Ping All Stations"}</span>
          </button>
          <Link
            href="/admin-dashboard"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#e3dfd5] hover:bg-slate-700 text-[#261b07] text-xs font-bold border border-[#d5d2cd] transition"
          >
            <span>← Command Center</span>
          </Link>
        </div>
      </div>

      {/* Network Health KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#e3dfd5] shadow-[0_4px_8px_rgba(38,27,7,.06)] space-y-1">
          <span className="text-[10px] font-mono text-[#8f897e] uppercase font-bold">
            Active Telemetry Nodes
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#6f8d54] font-mono">4 / 4</span>
            <span className="text-xs text-[#8f897e] font-mono">100% Online</span>
          </div>
          <p className="text-[11px] text-[#8f897e]">Zero packet dropouts past 6 hrs</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#e3dfd5] shadow-[0_4px_8px_rgba(38,27,7,.06)] space-y-1">
          <span className="text-[10px] font-mono text-[#8f897e] uppercase font-bold">
            Average Uplink RSSI
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#e89b01] font-mono">-85</span>
            <span className="text-xs text-[#8f897e] font-mono">dBm (Strong)</span>
          </div>
          <p className="text-[11px] text-[#8f897e]">LoRa Gateway: Solan Ridge Mast</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#e3dfd5] shadow-[0_4px_8px_rgba(38,27,7,.06)] space-y-1">
          <span className="text-[10px] font-mono text-[#8f897e] uppercase font-bold">
            Battery Array Average
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#261b07] font-mono">12.6</span>
            <span className="text-xs text-[#8f897e] font-mono">Volts DC</span>
          </div>
          <p className="text-[11px] text-[#6f8d54]">Solar float charge active</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#e3dfd5] shadow-[0_4px_8px_rgba(38,27,7,.06)] space-y-1">
          <span className="text-[10px] font-mono text-[#8f897e] uppercase font-bold">
            Telemetry Cadence
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#e89b01] font-mono">30</span>
            <span className="text-xs text-[#8f897e] font-mono">sec interval</span>
          </div>
          <p className="text-[11px] text-[#8f897e]">Storm burst mode enabled</p>
        </div>
      </div>

      {/* Telemetry Station Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {stations.map((station) => (
          <div
            key={station.id}
            className="p-6 rounded-3xl bg-white border border-[#e3dfd5] shadow-[0_4px_8px_rgba(38,27,7,.06)] space-y-4"
          >
            {/* Top Bar of Card */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-[#f9a600]/20 text-[#e89b01]">
                    {station.id}
                  </span>
                  <span className="text-xs font-mono text-[#8f897e]">
                    {station.elevation}m MSL
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#261b07] mt-1">{station.name}</h3>
                <p className="text-xs text-[#8f897e] mt-0.5">{station.location}</p>
              </div>

              {/* Ping badge */}
              <div className="text-right">
                <span className="px-2 py-0.5 rounded-full bg-[#6f8d54]/20 text-[#6f8d54] text-[10px] font-mono font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  LIVE
                </span>
                <span className="text-[10px] font-mono text-[#aca89f] block mt-1">
                  Ping: {station.lastPingSec}s ago
                </span>
              </div>
            </div>

            {/* Hardware Telemetry Bar */}
            <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-[#e3dfd5]/60 border border-[#d5d2cd]/60 text-xs font-mono">
              <div>
                <span className="text-[10px] text-[#aca89f] block uppercase">Power</span>
                <span className="font-bold text-[#261b07] mt-0.5 block flex items-center gap-1">
                  <Battery className="w-3.5 h-3.5 text-[#6f8d54]" />
                  {station.batteryV}V
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#aca89f] block uppercase">Signal</span>
                <span className="font-bold text-[#e89b01] mt-0.5 block flex items-center gap-1">
                  <Wifi className="w-3.5 h-3.5" />
                  {station.rssi} dBm
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#aca89f] block uppercase">Packets</span>
                <span className="font-bold text-[#6f8d54] mt-0.5 block">
                  {station.packetRate}%
                </span>
              </div>
            </div>

            {/* Sensor Readings Table */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase text-[#8f897e] block font-bold">
                Instrument Sensor Array
              </span>
              <div className="space-y-1.5">
                {station.sensors.map((sensor, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-[#e3dfd5]/40 border border-[#d5d2cd]/40 flex items-center justify-between text-xs"
                  >
                    <span className="text-[#61594a] font-medium">{sensor.type}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#261b07]">
                        {sensor.reading} {sensor.unit}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold ${
                          sensor.status === "CRITICAL"
                            ? "bg-[#f0624f]/20 text-[#d94b3b]"
                            : sensor.status === "WARNING"
                            ? "bg-[#f9a600]/20 text-[#e89b01]"
                            : "bg-[#6f8d54]/20 text-[#6f8d54]"
                        }`}
                      >
                        {sensor.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Diagnostic Action Button */}
            <div className="pt-2 border-t border-[#e3dfd5] flex items-center justify-between text-xs">
              <span className="text-[#aca89f] font-mono text-[11px]">
                Firmware: v2.4.1-LoRaWAN
              </span>
              <button
                onClick={() => showToast(`Sent diagnostic recalibration pulse to ${station.id}.`)}
                className="px-3 py-1.5 rounded-lg bg-[#e3dfd5] hover:bg-slate-700 text-[#e89b01] font-semibold transition flex items-center gap-1"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Zero Recalibrate</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
