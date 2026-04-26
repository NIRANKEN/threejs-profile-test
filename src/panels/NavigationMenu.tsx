import { useState, useRef, useEffect } from "react";
import { usePortfolioStore } from "../store/usePortfolioStore";
import type { SectionId } from "../types/sections";

const NAV_ITEMS: { id: SectionId; label: string; icon: string }[] = [
  { id: "profile", label: "Profile", icon: "👤" },
  { id: "skills", label: "Skills", icon: "💻" },
  { id: "works", label: "Works", icon: "📁" },
  { id: "contact", label: "Contact", icon: "✉️" },
];

export default function NavigationMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const setActiveSection = usePortfolioStore((s) => s.setActiveSection);
  const isTransitioning = usePortfolioStore((s) => s.isTransitioning);
  const menuRef = useRef<HTMLDivElement>(null);

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
    if (!isTransitioning) {
      setActiveSection(sectionId);
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
          <h3 className="nav-dropdown__title">Menu</h3>
        </div>
        <ul className="nav-list">
          {NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <button
                className="nav-list__item"
                onClick={() => handleItemClick(item.id)}
                disabled={isTransitioning}
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
