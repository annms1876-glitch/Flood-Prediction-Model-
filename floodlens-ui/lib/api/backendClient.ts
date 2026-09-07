const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

interface RequestOptions {
  method?: string;
  body?: unknown;
  signal?: AbortSignal;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, signal } = options;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    signal,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
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
  return backendApi.risk();
}

export async function getLatestSensors(): Promise<unknown[]> {
  const result = await backendApi.readings(8);
  return (result as { data: unknown[] }).data;
}
