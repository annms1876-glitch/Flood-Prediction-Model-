import { create } from "zustand";

interface UIState {
  sidebarOpen: boolean;
  activePage: string;
  theme: "dark" | "light";
  setSidebarOpen: (open: boolean) => void;
  setActivePage: (page: string) => void;
  toggleTheme: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  activePage: "dashboard",
  theme: "dark",
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setActivePage: (activePage) => set({ activePage }),
  toggleTheme: () => set((state) => ({ theme: state.theme === "dark" ? "light" : "dark" })),
}));
