"use client";

interface SensorReadingsProps {
  location: string;
}

export function SensorReadings({ location }: SensorReadingsProps) {
  return (
    <div className="card-glass rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white mb-4">
        Readings for {location}
      </h3>
      <div className="space-y-2">
        {["water_level_m", "rainfall_mm", "soil_moisture_percent", "tilt_degrees", "temperature_c", "humidity_percent"].map((field) => (
          <div key={field} className="flex justify-between text-sm">
            <span className="text-gray-400 capitalize">
              {field.replace(/_/g, " ")}
            </span>
            <span className="text-white">--</span>
          </div>
        ))}
      </div>
    </div>
  );
}
