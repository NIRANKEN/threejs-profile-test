import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import { usePortfolioStore } from "../../store/usePortfolioStore";
import type { SectionId } from "../../types/sections";

interface Props {
  sectionId: SectionId;
  children: ReactNode;
}

export default function InteractiveObject({ sectionId, children }: Props) {
  const [hovered, setHovered] = useState(false);
  const activeSection = usePortfolioStore((s) => s.activeSection);
  const isTransitioning = usePortfolioStore((s) => s.isTransitioning);
  const setActiveSection = usePortfolioStore((s) => s.setActiveSection);

  // アンマウント時にカーソルを必ずリセット
  useEffect(() => {
    return () => {
      document.body.style.cursor = "auto";
    };
  }, []);

  // ホバー状態でカーソルを変更
  useEffect(() => {
    document.body.style.cursor = hovered ? "pointer" : "auto";
  }, [hovered]);

  function handleClick(e: ThreeEvent<MouseEvent>) {
    e.stopPropagation();
    if (isTransitioning) return;
    // 同じセクションをクリックするとオーバービューに戻る（トグル）
    setActiveSection(activeSection === sectionId ? null : sectionId);
  }

  function handlePointerOver(e: ThreeEvent<PointerEvent>) {
    e.stopPropagation();
    setHovered(true);
  }

  function handlePointerOut() {
    setHovered(false);
  }

  return (
    <group onClick={handleClick} onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
      {children}
    </group>
  );
}
