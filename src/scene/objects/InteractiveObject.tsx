import { useEffect, useRef } from "react";
import type { ReactNode, FocusEvent, MouseEvent as ReactMouseEvent } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { usePortfolioStore } from "../../store/usePortfolioStore";
import type { SectionId } from "../../types/sections";

// ─── 3D Optimization: Shared Material ───────────────────────────────────────
const SHARED_HIGHLIGHT_MATERIAL = new THREE.MeshBasicMaterial({
  color: 0x00aaff,
  transparent: true,
  opacity: 0.3,
  depthWrite: false,
  side: THREE.DoubleSide,
  // 薄い平面オブジェクトと同一平面上に重なるとz-fightingでジャギーになるため、
  // カメラ側にわずかに押し出して competing depth を回避する
  polygonOffset: true,
  polygonOffsetFactor: -4,
  polygonOffsetUnits: -4,
});

interface Props {
  sectionId?: SectionId;
  onClick?: () => void;
  highlightColor?: number;
  children: ReactNode;
}

export default function InteractiveObject({ sectionId, onClick, highlightColor, children }: Props) {
  const hoveredRef = useRef(false);
  const groupRef = useRef<THREE.Group>(null);
  const highlightGroupRef = useRef<THREE.Group>(null);
  const activeSection = usePortfolioStore((s) => s.activeSection);
  const isTransitioning = usePortfolioStore((s) => s.isTransitioning);
  const isSceneTransitioning = usePortfolioStore((s) => s.isSceneTransitioning);
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

    const mat = highlightColor
      ? new THREE.MeshBasicMaterial({
          color: highlightColor,
          transparent: true,
          opacity: 0.3,
          depthWrite: false,
          side: THREE.DoubleSide,
          polygonOffset: true,
          polygonOffsetFactor: -4,
          polygonOffsetUnits: -4,
        })
      : SHARED_HIGHLIGHT_MATERIAL;

    cloned.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        node.material = mat;
        node.scale.multiplyScalar(1.02);
        // ハイライトメッシュ自身がポインターイベントを受けないようにする
        node.raycast = () => {};
      }
    });
    highlightGroup.add(cloned);
    highlightGroup.visible = false;
    return () => {
      highlightGroup.clear();
      if (highlightColor) {
        mat.dispose();
      }
    };
  }, [highlightColor]);

  // Reactの再レンダリングを避け、useFrameでvisibilityを直接制御
  useFrame(() => {
    if (highlightGroupRef.current) {
      highlightGroupRef.current.visible = hoveredRef.current && !isSceneTransitioning;
    }
  });

  function handleAction() {
    if (isTransitioning || isSceneTransitioning) return;
    if (onClick) {
      onClick();
      return;
    }
    if (sectionId) {
      // 同じセクションをクリックするとオーバービューに戻る（トグル）
      setActiveSection(activeSection === sectionId ? null : sectionId);
    }
  }

  function handleClick(e: ThreeEvent<MouseEvent>) {
    e.stopPropagation();
    handleAction();
  }

  function handlePointerOver(e: ThreeEvent<PointerEvent>) {
    e.stopPropagation();
    if (!hoveredRef.current && !isSceneTransitioning) {
      hoveredRef.current = true;
      document.body.style.cursor = "pointer";
    }
  }

  function handlePointerOut() {
    hoveredRef.current = false;
    document.body.style.cursor = "auto";
  }

  function handleHtmlClick(e: ReactMouseEvent) {
    e.stopPropagation();
    handleAction();
  }

  function handleHtmlFocus(e: FocusEvent) {
    e.stopPropagation();
    if (!hoveredRef.current && !isSceneTransitioning) {
      hoveredRef.current = true;
    }
  }

  function handleHtmlBlur() {
    hoveredRef.current = false;
  }

  return (
    <group onClick={handleClick} onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
      <group ref={groupRef}>{children}</group>
      <group ref={highlightGroupRef} />
      <Html distanceFactor={10} style={{ opacity: 0 }}>
        <button
          aria-label={sectionId ? `View ${sectionId}` : "Interactive Object"}
          onClick={handleHtmlClick}
          onFocus={handleHtmlFocus}
          onBlur={handleHtmlBlur}
        />
      </Html>
    </group>
  );
}
