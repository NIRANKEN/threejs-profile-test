import { describe, it, expect, beforeEach } from "vitest";
import { usePortfolioStore, getInitialScene, updateSceneUrl } from "../usePortfolioStore";

describe("usePortfolioStore", () => {
  beforeEach(() => {
    // Reset window.location and history mock
    window.history.pushState({}, "", "/");
    usePortfolioStore.setState({
      currentScene: "real",
      activeSection: null,
      isTransitioning: false,
      isSceneTransitioning: false,
      resetSignal: 0,
    });
  });

  describe("getInitialScene", () => {
    it("クエリパラメータがない場合は 'real' を返す", () => {
      window.history.pushState({}, "", "/");
      expect(getInitialScene()).toBe("real");
    });

    it("?scene=virtual の場合は 'virtual' を返す", () => {
      window.history.pushState({}, "", "/?scene=virtual");
      expect(getInitialScene()).toBe("virtual");
    });

    it("?scene=real の場合は 'real' を返す", () => {
      window.history.pushState({}, "", "/?scene=real");
      expect(getInitialScene()).toBe("real");
    });
  });

  describe("updateSceneUrl", () => {
    it("virtual を指定した時、URLに ?scene=virtual が追加される", () => {
      updateSceneUrl("virtual");
      expect(window.location.search).toBe("?scene=virtual");
    });

    it("real を指定した時、URLの scene パラメータが削除される", () => {
      window.history.pushState({}, "", "/?scene=virtual");
      updateSceneUrl("real");
      expect(window.location.search).toBe("");
    });
  });

  describe("setSceneMode", () => {
    it("シーン切り替え時に currentScene が更新され、activeSection がリセットされる", () => {
      usePortfolioStore.setState({ activeSection: "works" });
      const store = usePortfolioStore.getState();

      store.setSceneMode("virtual");

      const state = usePortfolioStore.getState();
      expect(state.currentScene).toBe("virtual");
      expect(state.activeSection).toBeNull();
      expect(state.isSceneTransitioning).toBe(true);
    });

    it("同じシーンを指定した場合は何もしない", () => {
      const store = usePortfolioStore.getState();
      store.setSceneMode("real");
      expect(usePortfolioStore.getState().isSceneTransitioning).toBe(false);
    });
  });

  describe("triggerReset", () => {
    it("resetSignal をインクリメントする", () => {
      const store = usePortfolioStore.getState();
      expect(store.resetSignal).toBe(0);
      store.triggerReset();
      expect(usePortfolioStore.getState().resetSignal).toBe(1);
    });
  });
});
