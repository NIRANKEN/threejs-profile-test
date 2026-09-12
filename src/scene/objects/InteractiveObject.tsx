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
  children: ReactNode;
  ariaLabel?: string;
}

export default function InteractiveObject({
  sectionId,
  onClick,
  highlightColor,
  children,
  ariaLabel,
}: Props) {
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
  useFrame((_, delta) => {
    if (highlightGroupRef.current) {
      highlightGroupRef.current.visible = hoveredRef.current && !isSceneTransitioning;
    }

    if (groupRef.current) {
      const targetScale = hoveredRef.current && !isSceneTransitioning ? 1.02 : 1.0;
      // `THREE.MathUtils.lerp` を使用してスカラー値でスケールを補間する
      const currentScale = groupRef.current.scale.x;
      const nextScale = THREE.MathUtils.lerp(currentScale, targetScale, 10 * delta);
      groupRef.current.scale.setScalar(nextScale);
    }
  });

  function handleClick(e?: ThreeEvent<MouseEvent> | React.MouseEvent<HTMLButtonElement>) {
    if (e && "stopPropagation" in e) {
      e.stopPropagation();
    }
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

  return (
    <group
      onClick={handleClick as unknown as (e: ThreeEvent<MouseEvent>) => void}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <group ref={groupRef}>{children}</group>
      <group ref={highlightGroupRef} />
      {ariaLabel && (
        <Html distanceFactor={10} style={{ opacity: 0, pointerEvents: "none" }}>
          <button
            aria-label={ariaLabel}
            onClick={(e) => handleClick(e)}
            onFocus={() => {
              if (!isSceneTransitioning) hoveredRef.current = true;
            }}
            onBlur={() => {
              hoveredRef.current = false;
            }}
            style={{ pointerEvents: "auto", cursor: "pointer", width: "44px", height: "44px" }}
          />
        </Html>
      )}
    </group>
  );
}
