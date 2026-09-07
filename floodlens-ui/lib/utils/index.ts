import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRiskScore(score: number): string {
  return `${Math.round(score)}/100`;
}

export function getRiskColor(level: string): string {
  const colors: Record<string, string> = {
    normal: "#22c55e",
    watch: "#eab308",
    warning: "#f97316",
    high: "#ef4444",
    critical: "#dc2626",
  };
  return colors[level] || "#22c55e";
}

export function getRiskBadgeClass(level: string): string {
  const classes: Record<string, string> = {
    normal: "badge-risk-normal",
    watch: "badge-risk-watch",
    warning: "badge-risk-warning",
    high: "badge-risk-high",
    critical: "badge-risk-critical",
  };
  return classes[level] || "badge-risk-normal";
}

export function calculateGaugePercent(score: number): number {
  return Math.min(Math.max(score, 0), 100);
}

export function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function slugToTitle(slug: string): string {
  return slug
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
