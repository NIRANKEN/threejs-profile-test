import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
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
  ariaLabel?: string;
  children: ReactNode;
}

export default function InteractiveObject({ sectionId, onClick, highlightColor, ariaLabel, children }: Props) {
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

  function handleClick(e: ThreeEvent<MouseEvent>) {
    e.stopPropagation();
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

  function handlePointerOver(e?: ThreeEvent<PointerEvent> | React.FocusEvent) {
    if (e && 'stopPropagation' in e) {
      e.stopPropagation();
    }
    if (!hoveredRef.current && !isSceneTransitioning) {
      hoveredRef.current = true;
      document.body.style.cursor = "pointer";
    }
  }

  function handlePointerOut() {
    hoveredRef.current = false;
    document.body.style.cursor = "auto";
  }

  const label = ariaLabel || (sectionId ? `${sectionId} details` : "Interactive object");

  return (
    <group onClick={handleClick} onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
      <group ref={groupRef}>{children}</group>
      <group ref={highlightGroupRef} />
      {/* Htmlコンポーネントによるスクリーンリーダー用ラベルおよびキーボードナビゲーション対応 */}
      <Html distanceFactor={10} style={{ opacity: 0, pointerEvents: 'none' }}>
        <button
          aria-label={label}
          onClick={(e) => {
            e.stopPropagation();
            handleClick(e as unknown as ThreeEvent<MouseEvent>);
          }}
          onFocus={handlePointerOver}
          onBlur={handlePointerOut}
          style={{ pointerEvents: 'auto' }}
        />
      </Html>
    </group>
  );
}
