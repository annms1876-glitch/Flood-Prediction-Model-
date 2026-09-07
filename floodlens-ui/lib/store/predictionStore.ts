import { create } from "zustand";
import type { PredictionResponse, RiskScore, Sensor, Alert } from "@/lib/types";

interface PredictionState {
  currentPrediction: PredictionResponse | null;
  riskScore: RiskScore | null;
  predictionHistory: PredictionResponse[];
  sensors: Sensor[];
  alerts: Alert[];
  isLoading: boolean;
  error: string | null;

  setPrediction: (pred: PredictionResponse) => void;
  setRiskScore: (score: RiskScore) => void;
  addToHistory: (pred: PredictionResponse) => void;
  setSensors: (sensors: Sensor[]) => void;
  addAlert: (alert: Alert) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const usePredictionStore = create<PredictionState>((set) => ({
  currentPrediction: null,
  riskScore: null,
  predictionHistory: [],
  sensors: [],
  alerts: [],
  isLoading: false,
  error: null,

  setPrediction: (pred) => set({ currentPrediction: pred }),
  setRiskScore: (score) => set({ riskScore: score }),
  addToHistory: (pred) =>
    set((state) => ({ predictionHistory: [pred, ...state.predictionHistory.slice(0, 19)] })),
  setSensors: (sensors) => set({ sensors }),
  addAlert: (alert) => set((state) => ({ alerts: [alert, ...state.alerts] })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      currentPrediction: null,
      riskScore: null,
      predictionHistory: [],
      sensors: [],
      alerts: [],
      isLoading: false,
      error: null,
    }),
}));
