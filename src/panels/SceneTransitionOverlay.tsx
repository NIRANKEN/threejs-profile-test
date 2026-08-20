import { usePortfolioStore } from "../store/usePortfolioStore";

export default function SceneTransitionOverlay() {
  const currentScene = usePortfolioStore((s) => s.currentScene);
  const isSceneTransitioning = usePortfolioStore((s) => s.isSceneTransitioning);

  return (
    <div
      className={`scene-transition-overlay ${
        isSceneTransitioning ? "scene-transition-overlay--active" : ""
      }`}
      aria-hidden={!isSceneTransitioning}
    >
      <div className="scene-transition-content">
        <div className="scene-transition-spinner" />
        <p className="scene-transition-text">
          {currentScene === "virtual"
            ? "Entering Virtual Mountain Lounge..."
            : "Connecting to Engineer Room..."}
        </p>
      </div>
    </div>
  );
}
