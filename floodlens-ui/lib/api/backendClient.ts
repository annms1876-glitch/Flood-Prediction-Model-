import { getCurrentRisk, getSensors, getSensorReadings } from "@/lib/data/floodEngine";

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "";

interface RequestOptions {
  method?: string;
  body?: unknown;
  signal?: AbortSignal;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, signal } = options;
  const url = typeof window !== "undefined" ? path : (BASE ? `${BASE}${path}` : path);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);

  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
      signal: signal || controller.signal,
    });
    clearTimeout(timeoutId);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: "Request failed" }));
      throw new Error(err.message || `HTTP ${res.status}`);
    }
    return res.json();
  } catch (e) {
    clearTimeout(timeoutId);
    throw e;
  }
}

export const backendApi = {
  health: () => request<{ status: string }>("/api/health"),
  readings: (limit = 100) => request<{ data: unknown[]; count: number }>(`/api/readings?limit=${limit}`),
  readingsByLocation: (location: string, limit = 100) =>
    request<{ data: unknown[] }>(`/api/readings/${location}?limit=${limit}`),
  insertReading: (data: unknown) => request("/api/readings", { method: "POST", body: data }),
  risk: () => request<{ risk_score: number; risk_level: string }>("/api/risk"),
  riskML: () => request("/api/risk/ml"),
  mlPredict: (data: { location: string; readings: unknown[] }) =>
    request("/api/ml/predict", { method: "POST", body: data }),
  mlPredictBatch: (locations: string[]) =>
    request("/api/ml/predict/batch", { method: "POST", body: { locations } }),
  mlHealth: () => request("/api/ml/health"),
  mlModelInfo: () => request("/api/ml/model-info"),
};

export async function getRiskScore(): Promise<{ risk_score: number; risk_level: string }> {
  if (typeof window === "undefined") {
    return getCurrentRisk();
  }
  try {
    return await backendApi.risk();
  } catch {
    return getCurrentRisk();
  }
}

export async function getLatestSensors(): Promise<unknown[]> {
  if (typeof window === "undefined") {
    return getSensors();
  }
  try {
    const result = await backendApi.readings(8);
    return (result as { data: unknown[] }).data || getSensors();
  } catch {
    return getSensors();
  }
}
