import { useState, useRef, useEffect } from "react";
import { usePortfolioStore } from "../store/usePortfolioStore";
import type { SectionId } from "../types/sections";

const REAL_NAV_ITEMS: { id: SectionId; label: string; icon: string }[] = [
  { id: "profile", label: "Profile", icon: "👤" },
  { id: "skills", label: "Skills", icon: "💻" },
  { id: "works", label: "Works", icon: "📁" },
  { id: "contact", label: "Contact", icon: "✉️" },
];

const VTUBER_NAV_ITEMS: { id: SectionId; label: string; icon: string }[] = [
  { id: "profile", label: "Profile & Lore", icon: "🏔️" },
  { id: "works", label: "Activities & Works", icon: "🎬" },
  { id: "guidelines", label: "Guidelines", icon: "📜" },
  { id: "links", label: "Links", icon: "🔗" },
];

export default function NavigationMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const currentScene = usePortfolioStore((s) => s.currentScene);
  const setSceneMode = usePortfolioStore((s) => s.setSceneMode);
  const setActiveSection = usePortfolioStore((s) => s.setActiveSection);
  const isTransitioning = usePortfolioStore((s) => s.isTransitioning);
  const isSceneTransitioning = usePortfolioStore((s) => s.isSceneTransitioning);
  const menuRef = useRef<HTMLDivElement>(null);

  const navItems = currentScene === "real" ? REAL_NAV_ITEMS : VTUBER_NAV_ITEMS;

  // Handle clicking outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (isOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Handle Escape key to close menu
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleItemClick = (sectionId: SectionId) => {
    if (!isTransitioning && !isSceneTransitioning) {
      setActiveSection(sectionId);
      setIsOpen(false);
    }
  };

  const handleSwitchScene = () => {
    if (!isSceneTransitioning) {
      setSceneMode(currentScene === "real" ? "virtual" : "real");
      setIsOpen(false);
    }
  };

  return (
    <div className="nav-menu-container" ref={menuRef}>
      <button
        className={`nav-btn ${isOpen ? "nav-btn--open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle navigation menu"
      >
        <div className="hamburger-icon">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>

      <div className={`nav-dropdown ${isOpen ? "nav-dropdown--open" : ""}`}>
        <div className="nav-dropdown__header">
          <h3 className="nav-dropdown__title">
            {currentScene === "real" ? "REAL Mode" : "VIRTUAL Mode"}
          </h3>
          <button
            type="button"
            className="nav-dropdown__switch-btn"
            onClick={handleSwitchScene}
            disabled={isSceneTransitioning}
          >
            {currentScene === "real" ? "Switch to VIRTUAL 🏔️" : "Switch to REAL 🏢"}
          </button>
        </div>
        <ul className="nav-list">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                className="nav-list__item"
                onClick={() => handleItemClick(item.id)}
                disabled={isTransitioning || isSceneTransitioning}
              >
                <span className="nav-list__icon">{item.icon}</span>
                <span className="nav-list__label">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
