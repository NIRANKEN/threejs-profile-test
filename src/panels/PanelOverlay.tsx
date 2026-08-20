import { useEffect } from "react";
import { usePortfolioStore } from "../store/usePortfolioStore";
import type { SectionId, SceneMode } from "../types/sections";
import ProfilePanel from "./ProfilePanel";
import SkillsPanel from "./SkillsPanel";
import WorksPanel from "./WorksPanel";
import ContactPanel from "./ContactPanel";
import VtuberProfilePanel from "./vtuber/VtuberProfilePanel";
import VtuberActivitiesPanel from "./vtuber/VtuberActivitiesPanel";
import VtuberGuidelinesPanel from "./vtuber/VtuberGuidelinesPanel";
import VtuberLinksPanel from "./vtuber/VtuberLinksPanel";
import type { ComponentType } from "react";

const REAL_PANEL_MAP: Record<string, ComponentType> = {
  profile: ProfilePanel,
  skills: SkillsPanel,
  works: WorksPanel,
  contact: ContactPanel,
};

const VTUBER_PANEL_MAP: Record<string, ComponentType> = {
  profile: VtuberProfilePanel,
  works: VtuberActivitiesPanel,
  guidelines: VtuberGuidelinesPanel,
  links: VtuberLinksPanel,
  contact: ContactPanel,
  skills: SkillsPanel,
};

const SCENE_PANELS: Record<SceneMode, Record<string, ComponentType>> = {
  real: REAL_PANEL_MAP,
  virtual: VTUBER_PANEL_MAP,
};

export default function PanelOverlay() {
  const currentScene = usePortfolioStore((s) => s.currentScene);
  const activeSection = usePortfolioStore((s) => s.activeSection);
  const isTransitioning = usePortfolioStore((s) => s.isTransitioning);
  const setActiveSection = usePortfolioStore((s) => s.setActiveSection);

  // ESCキーでパネルを閉じる
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && activeSection !== null && !isTransitioning) {
        setActiveSection(null);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeSection, isTransitioning, setActiveSection]);

  const isVisible = activeSection !== null;
  const panelMap = SCENE_PANELS[currentScene] || REAL_PANEL_MAP;
  const ActivePanel = activeSection ? panelMap[activeSection] : null;

  return (
    <div className={`panel-overlay${isVisible ? " panel-overlay--visible" : ""}`}>
      <div className="panel-container">
        <button
          className="panel-close-btn"
          onClick={() => !isTransitioning && setActiveSection(null)}
          aria-label="パネルを閉じる"
          disabled={isTransitioning}
        >
          ×
        </button>
        {ActivePanel && <ActivePanel />}
      </div>
    </div>
  );
}

