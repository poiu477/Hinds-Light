import { create } from "zustand";

type AppState = {
  selectedSource: string | null;
  setSelectedSource: (source: string | null) => void;
};

export const useAppStore = create<AppState>((set) => ({
  selectedSource: null,
  setSelectedSource: (source) => set({ selectedSource: source }),
}));


