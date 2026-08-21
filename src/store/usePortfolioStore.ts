import { create } from "zustand";
import type { SectionId, SceneMode } from "../types/sections";

export function getInitialScene(): SceneMode {
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const sceneParam = params.get("scene");
    if (sceneParam === "virtual") return "virtual";
    if (sceneParam === "real") return "real";
  }
  return "real";
}

export function updateSceneUrl(scene: SceneMode, replace = false) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (scene === "real") {
    url.searchParams.delete("scene");
  } else {
    url.searchParams.set("scene", scene);
  }
  const search = url.searchParams.toString();
  const newUrl = url.pathname + (search ? `?${search}` : "") + url.hash;
  if (replace) {
    window.history.replaceState({ scene }, "", newUrl);
  } else {
    window.history.pushState({ scene }, "", newUrl);
  }
}

interface PortfolioState {
  currentScene: SceneMode;
  activeSection: SectionId | null;
  isTransitioning: boolean;
  isSceneTransitioning: boolean;
  /** ResetButton → FirstPersonController へのシグナル。インクリメントで useEffect をトリガー */
  resetSignal: number;

  setActiveSection: (section: SectionId | null) => void;
  setTransitioning: (v: boolean) => void;
  setSceneTransitioning: (v: boolean) => void;
  triggerReset: () => void;
  setSceneMode: (scene: SceneMode, options?: { replace?: boolean; skipHistory?: boolean }) => void;
}

export const usePortfolioStore = create<PortfolioState>((set, get) => {
  // ブラウザ環境での popstate イベントリスナー登録
  if (typeof window !== "undefined") {
    window.addEventListener("popstate", () => {
      const sceneFromUrl = getInitialScene();
      if (sceneFromUrl !== get().currentScene) {
        get().setSceneMode(sceneFromUrl, { skipHistory: true });
      }
    });
  }

  return {
    currentScene: getInitialScene(),
    activeSection: null,
    isTransitioning: false,
    isSceneTransitioning: false,
    resetSignal: 0,

    setActiveSection: (section) => set({ activeSection: section }),
    setTransitioning: (v) => set({ isTransitioning: v }),
    setSceneTransitioning: (v) => set({ isSceneTransitioning: v }),
    triggerReset: () => set((s) => ({ resetSignal: s.resetSignal + 1 })),

    setSceneMode: (scene, options) => {
      const { currentScene } = get();
      if (currentScene === scene) return;

      // REAL -> VIRTUAL への遷移はURL直接入力（初期ロード）のみ許可し、
      // ボタン操作や履歴操作（popstate）による動的な遷移は禁止する
      if (currentScene === "real" && scene === "virtual") return;

      if (!options?.skipHistory) {
        updateSceneUrl(scene, options?.replace ?? false);
      }

      // シーン切り替え時はアクティブセクションをリセットし、トランジションフラグを立てる
      set({
        currentScene: scene,
        activeSection: null,
        isTransitioning: false,
        isSceneTransitioning: true,
      });

      // 短時間のフェード演出後にシーン遷移完了
      setTimeout(() => {
        set({ isSceneTransitioning: false });
      }, 500);
    },
  };
});
