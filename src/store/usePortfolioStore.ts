import { create } from "zustand";
import type { SectionId } from "../types/sections";

interface PortfolioState {
  activeSection: SectionId | null;
  isTransitioning: boolean;
  /** ResetButton → FirstPersonController へのシグナル。インクリメントで useEffect をトリガー */
  resetSignal: number;

  setActiveSection: (section: SectionId | null) => void;
  setTransitioning: (v: boolean) => void;
  triggerReset: () => void;
}

export const usePortfolioStore = create<PortfolioState>((set) => ({
  activeSection: null,
  isTransitioning: false,
  resetSignal: 0,

  setActiveSection: (section) => set({ activeSection: section }),
  setTransitioning: (v) => set({ isTransitioning: v }),
  triggerReset: () => set((s) => ({ resetSignal: s.resetSignal + 1 })),
}));
