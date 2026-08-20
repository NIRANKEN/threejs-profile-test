import { usePortfolioStore } from "../store/usePortfolioStore";
import type { SceneMode } from "../types/sections";

export default function SceneToggle() {
  const currentScene = usePortfolioStore((s) => s.currentScene);
  const isSceneTransitioning = usePortfolioStore((s) => s.isSceneTransitioning);
  const setSceneMode = usePortfolioStore((s) => s.setSceneMode);

  const handleToggle = (scene: SceneMode) => {
    if (currentScene !== scene && !isSceneTransitioning) {
      setSceneMode(scene);
    }
  };

  return (
    <div className="scene-toggle-container" role="tablist" aria-label="Scene Mode Selection">
      <button
        type="button"
        role="tab"
        aria-selected={currentScene === "real"}
        className={`scene-toggle-btn ${currentScene === "real" ? "scene-toggle-btn--active" : ""}`}
        onClick={() => handleToggle("real")}
        disabled={isSceneTransitioning}
      >
        <span className="scene-toggle-btn__icon">🏢</span>
        <span className="scene-toggle-btn__label">REAL</span>
      </button>

      <button
        type="button"
        role="tab"
        aria-selected={currentScene === "virtual"}
        className={`scene-toggle-btn ${currentScene === "virtual" ? "scene-toggle-btn--active" : ""}`}
        onClick={() => handleToggle("virtual")}
        disabled={isSceneTransitioning}
      >
        <span className="scene-toggle-btn__icon">🏔️</span>
        <span className="scene-toggle-btn__label">VIRTUAL</span>
      </button>
    </div>
  );
}
