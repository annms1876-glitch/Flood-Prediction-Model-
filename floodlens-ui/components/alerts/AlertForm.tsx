"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { usePredictionStore } from "@/lib/store/predictionStore";
import { Alert } from "@/lib/types";
import { Send } from "lucide-react";

export function AlertForm() {
  const { addAlert, setLoading } = usePredictionStore();
  const [location, setLocation] = useState("");
  const [severity, setSeverity] = useState<Alert["severity"]>("warning");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location || !message) return;
    setLoading(true);
    try {
      const alert: Alert = {
        id: Date.now().toString(),
        location,
        severity,
        message,
        status: "sent",
        timestamp: new Date().toISOString(),
      };
      addAlert(alert);
      setLocation("");
      setMessage("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Location"
        placeholder="e.g., hill_station_1"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        required
      />
      <Select
        label="Severity"
        value={severity}
        onChange={(e) => setSeverity(e.target.value as Alert["severity"])}
        options={[
          { value: "normal", label: "Normal" },
          { value: "watch", label: "Watch" },
          { value: "warning", label: "Warning" },
          { value: "high", label: "High" },
          { value: "critical", label: "Critical" },
        ]}
      />
      <Input
        label="Message"
        placeholder="Alert message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
      />
      <Button type="submit" className="w-full" disabled={!location || !message}>
        <Send className="w-4 h-4 mr-2" />
        Send Alert
      </Button>
    </form>
  );
}
