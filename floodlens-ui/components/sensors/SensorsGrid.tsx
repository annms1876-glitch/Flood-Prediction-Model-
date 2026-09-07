"use client";

import { useEffect } from "react";
import { usePredictionStore } from "@/lib/store/predictionStore";
import { backendApi } from "@/lib/api/backendClient";
import { SensorCard } from "@/components/dashboard/SensorCard";
import { Loader2 } from "lucide-react";

export function SensorsGrid() {
  const { sensors, setSensors, isLoading } = usePredictionStore();

  useEffect(() => {
    backendApi.readings(12).then((res) => {
      setSensors((res as { data: any[] }).data);
    });
  }, []);

  if (isLoading || sensors.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-brand-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sensors.map((sensor: any) => (
        <SensorCard key={sensor.location} sensor={sensor} />
      ))}
    </div>
  );
}
