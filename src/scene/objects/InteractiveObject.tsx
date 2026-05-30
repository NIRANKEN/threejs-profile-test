import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { usePortfolioStore } from "../../store/usePortfolioStore";
import type { SectionId } from "../../types/sections";

// ─── 3D Optimization: Shared Material ───────────────────────────────────────
// Move highlightMaterial to module scope instead of instantiating via useMemo
// per component instance. This avoids unnecessary garbage collection,
// memory leaks from forgetting .dispose(), and reduces VRAM footprint
// by reusing the identical MeshBasicMaterial for every InteractiveObject.
const SHARED_HIGHLIGHT_MATERIAL = new THREE.MeshBasicMaterial({
  color: 0x0088ff,
  transparent: true,
  opacity: 0.3,
  depthWrite: false,
  side: THREE.DoubleSide,
});

interface Props {
  sectionId: SectionId;
  children: ReactNode;
}

const SECTION_LABELS: Record<SectionId, string> = {
  profile: "ベッド",
  skills: "PCケース",
  works: "モニター",
  contact: "本",
};

export default function InteractiveObject({ sectionId, children }: Props) {
  const hoveredRef = useRef(false);
  const groupRef = useRef<THREE.Group>(null);
  const highlightGroupRef = useRef<THREE.Group>(null);
  const activeSection = usePortfolioStore((s) => s.activeSection);
  const isTransitioning = usePortfolioStore((s) => s.isTransitioning);
  const setActiveSection = usePortfolioStore((s) => s.setActiveSection);

  // アンマウント時にカーソルを必ずリセット
  useEffect(() => {
    return () => {
      document.body.style.cursor = "auto";
    };
  }, []);

  // マウント時に一度だけクローンを生成（ホバーのたびに生成しない）
  useEffect(() => {
    if (!groupRef.current || !highlightGroupRef.current) return;
    const highlightGroup = highlightGroupRef.current;
    const cloned = groupRef.current.clone();
    cloned.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        node.material = SHARED_HIGHLIGHT_MATERIAL;
        node.scale.multiplyScalar(1.02);
        // ハイライトメッシュ自身がポインターイベントを受けないようにする
        node.raycast = () => {};
      }
    });
    highlightGroup.add(cloned);
    highlightGroup.visible = false;
    return () => {
      highlightGroup.clear();
    };
  }, []);

  // Reactの再レンダリングを避け、useFrameでvisibilityを直接制御
  useFrame(() => {
    if (highlightGroupRef.current) {
      highlightGroupRef.current.visible = hoveredRef.current;
    }
  });

  function handleClick(e: ThreeEvent<MouseEvent>) {
    e.stopPropagation();
    if (isTransitioning) return;
    // 同じセクションをクリックするとオーバービューに戻る（トグル）
    setActiveSection(activeSection === sectionId ? null : sectionId);
  }

  function handlePointerOver(e: ThreeEvent<PointerEvent>) {
    e.stopPropagation();
    if (!hoveredRef.current) {
      hoveredRef.current = true;
      document.body.style.cursor = "pointer";
    }
  }

  function handlePointerOut() {
    hoveredRef.current = false;
    document.body.style.cursor = "auto";
  }

  return (
    <group onClick={handleClick} onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
      <group ref={groupRef}>{children}</group>
      <group ref={highlightGroupRef} />
      <Html distanceFactor={10} style={{ opacity: 0, pointerEvents: "none" }}>
        <button
          className="sr-only"
          tabIndex={0}
          aria-label={`${SECTION_LABELS[sectionId]}の詳細を表示`}
          onClick={(e) => {
            e.stopPropagation();
            if (!isTransitioning) {
              setActiveSection(activeSection === sectionId ? null : sectionId);
            }
          }}
          style={{ pointerEvents: "auto" }}
        />
      </Html>
    </group>
  );
}
