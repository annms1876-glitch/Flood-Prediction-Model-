import { create } from "zustand";

export type PortalType = "villager" | "authority";

interface UIState {
  sidebarOpen: boolean;
  activePage: string;
  portal: PortalType;
  theme: "dark" | "light";
  activeLocation: string;
  weatherInfo: {
    temp: string;
    condition: string;
    humidity: string;
    wind: string;
    aqi: string;
    locationName: string;
  };
  simulationProgress: number;
  simulationPlaying: boolean;
  selectedRoute: "A" | "B" | "C";
  sosState: "idle" | "countdown" | "dispatched";
  alertCount: number;
  setSidebarOpen: (open: boolean) => void;
  setActivePage: (page: string) => void;
  setPortal: (portal: PortalType) => void;
  toggleTheme: () => void;
  setSimulationProgress: (val: number) => void;
  setSimulationPlaying: (playing: boolean) => void;
  setSelectedRoute: (route: "A" | "B" | "C") => void;
  setSosState: (state: "idle" | "countdown" | "dispatched") => void;
  setActiveLocation: (loc: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  activePage: "dashboard",
  portal: "villager",
  theme: "dark",
  activeLocation: "Solan, Himachal Pradesh",
  weatherInfo: {
    temp: "24°C",
    condition: "Partly Cloudy",
    humidity: "65%",
    wind: "12 km/h SSW",
    aqi: "42 Good",
    locationName: "Solan, HP",
  },
  simulationProgress: 0,
  simulationPlaying: false,
  selectedRoute: "A",
  sosState: "idle",
  alertCount: 12,
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setActivePage: (activePage) => set({ activePage }),
  setPortal: (portal) => set({ portal }),
  toggleTheme: () =>
    set((state) => ({ theme: state.theme === "dark" ? "light" : "dark" })),
  setSimulationProgress: (simulationProgress) => set({ simulationProgress }),
  setSimulationPlaying: (simulationPlaying) => set({ simulationPlaying }),
  setSelectedRoute: (selectedRoute) => set({ selectedRoute }),
  setSosState: (sosState) => set({ sosState }),
  setActiveLocation: (activeLocation) => set({ activeLocation }),
}));
