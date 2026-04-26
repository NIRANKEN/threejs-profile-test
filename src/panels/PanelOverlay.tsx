import { useEffect } from "react";
import { usePortfolioStore } from "../store/usePortfolioStore";
import type { SectionId } from "../types/sections";
import ProfilePanel from "./ProfilePanel";
import SkillsPanel from "./SkillsPanel";
import WorksPanel from "./WorksPanel";
import ContactPanel from "./ContactPanel";
import type { ComponentType } from "react";

const PANEL_MAP: Record<SectionId, ComponentType> = {
  profile: ProfilePanel,
  skills: SkillsPanel,
  works: WorksPanel,
  contact: ContactPanel,
};

export default function PanelOverlay() {
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
  const ActivePanel = activeSection ? PANEL_MAP[activeSection] : null;

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
