const BASE = process.env.NEXT_PUBLIC_ML_URL || "http://localhost:8000";

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

export const mlApi = {
  health: () => request<{ status: string; predictor_loaded: boolean }>("/health"),
  modelInfo: () => request<{ model_version: string; models: string[]; formula: string }>("/model/info"),
  predict: (data: { location: string; readings: unknown[]; prev_water_level?: number }) =>
    request<{ location: string; risk_score: number; risk_level: string }>("/predict", { method: "POST", body: data }),
  predictRuleBased: (data: { location: string; readings: unknown[] }) =>
    request<{ risk_score: number; risk_level: string }>("/predict/rule-based", { method: "POST", body: data }),
  demoScenarios: () => request<{ scenarios: unknown[] }>("/demo/scenarios"),
  demoPredict: (name: string) => request(`/demo/predict/${name}`),
  demoRunAll: () => request("/demo/run-all", { method: "POST" }),
};
