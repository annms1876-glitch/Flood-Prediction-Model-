"use client";

import { SensorsGrid } from "@/components/sensors/SensorsGrid";
import { SensorReadings } from "@/components/sensors/SensorReadings";

export default function SensorsPage() {
  return (
    <div className="space-y-6 animate-slide-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Sensor Network</h1>
        <p className="text-gray-400 mt-1">
          Monitor IoT sensor readings across all locations
        </p>
      </div>

      <SensorsGrid />
      <SensorReadings location="village_a" />
    </div>
  );
}
