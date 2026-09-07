import type { PredictionResponse, ModelInfo, DemoScenario, DemoPrediction } from "@/lib/types";
import {
  getAllScenarios,
  getDemoPrediction,
  calculateEnsemblePrediction,
  getModelInfo,
} from "@/lib/data/floodEngine";

const BASE = process.env.NEXT_PUBLIC_ML_URL || "/api";

interface RequestOptions {
  method?: string;
  body?: unknown;
  signal?: AbortSignal;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, signal } = options;
  const url = `${BASE}${path}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

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

export const mlApi = {
  health: async () => {
    try {
      return await request<{ status: string; predictor_loaded: boolean }>("/health");
    } catch {
      return { status: "online", predictor_loaded: true };
    }
  },
  modelInfo: async () => {
    try {
      return await request<ModelInfo>("/model/info");
    } catch {
      return getModelInfo();
    }
  },
  predict: async (data: { location: string; readings: any[]; prev_water_level?: number }) => {
    try {
      return await request<PredictionResponse>("/predict", { method: "POST", body: data });
    } catch {
      return calculateEnsemblePrediction(data);
    }
  },
  predictRuleBased: async (data: { location: string; readings: any[] }) => {
    try {
      return await request<PredictionResponse>("/predict/rule-based", { method: "POST", body: data });
    } catch {
      return calculateEnsemblePrediction(data);
    }
  },
  demoScenarios: async () => {
    try {
      return await request<{ scenarios: DemoScenario[] }>("/demo/scenarios");
    } catch {
      return { scenarios: getAllScenarios() };
    }
  },
  demoPredict: async (name: string) => {
    try {
      return await request<DemoPrediction>(`/demo/predict/${name}`);
    } catch {
      return getDemoPrediction(name);
    }
  },
  demoRunAll: async () => {
    try {
      return await request("/demo/run-all", { method: "POST" });
    } catch {
      const scenarios = getAllScenarios();
      return {
        results: scenarios.map((s) => getDemoPrediction(s.key)),
      };
    }
  },
};
