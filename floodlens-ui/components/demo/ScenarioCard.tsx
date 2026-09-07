"use client";

import { DemoScenario } from "@/lib/types";
import { cn } from "@/lib/utils";
import { getRiskBadgeClass } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

interface ScenarioCardProps {
  scenario: DemoScenario;
  onClick: () => void;
}

export function ScenarioCard({ scenario, onClick }: ScenarioCardProps) {
  return (
    <div className="card-glass rounded-xl p-5 hover:bg-white/5 transition-colors cursor-pointer group" onClick={onClick}>
      <div className="text-3xl mb-3">{scenario.icon}</div>
      <h3 className="text-sm font-semibold text-white mb-1 group-hover:text-brand-accent transition-colors">
        {scenario.name}
      </h3>
      <p className="text-xs text-gray-500 mb-3">{scenario.description}</p>
      <Button variant="outline" size="sm" className="w-full">
        <Play className="w-3 h-3 mr-1" />
        Run Scenario
      </Button>
    </div>
  );
}
