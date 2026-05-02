import { useEffect, useRef, useMemo } from "react";
import type { ReactNode } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { usePortfolioStore } from "../../store/usePortfolioStore";
import type { SectionId } from "../../types/sections";

interface Props {
  sectionId: SectionId;
  children: ReactNode;
}

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

  // ハイライト用マテリアル
  const highlightMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: 0x0088ff,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
  }, []);

  useEffect(() => {
    return () => {
      highlightMaterial.dispose();
    };
  }, [highlightMaterial]);

  // マウント時に一度だけクローンを生成（ホバーのたびに生成しない）
  useEffect(() => {
    if (!groupRef.current || !highlightGroupRef.current) return;
    const highlightGroup = highlightGroupRef.current;
    const cloned = groupRef.current.clone();
    cloned.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        node.material = highlightMaterial;
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
  }, [highlightMaterial]);

  // Reactの再レンダリングを避け、useFrameでopacityを直接制御
  useFrame((_, delta) => {
    if (highlightGroupRef.current) {
      const targetOpacity = hoveredRef.current ? 0.3 : 0;
      highlightMaterial.opacity = THREE.MathUtils.lerp(
        highlightMaterial.opacity,
        targetOpacity,
        10 * delta
      );
      highlightGroupRef.current.visible = highlightMaterial.opacity > 0.01;
    }
  });

  function handleClick(e?: ThreeEvent<MouseEvent> | React.MouseEvent) {
    e?.stopPropagation();
    if (isTransitioning) return;
    // 同じセクションをクリックするとオーバービューに戻る（トグル）
    setActiveSection(activeSection === sectionId ? null : sectionId);
  }

  function handlePointerOver(e?: ThreeEvent<PointerEvent> | React.FocusEvent) {
    e?.stopPropagation();
    if (!hoveredRef.current) {
      hoveredRef.current = true;
      document.body.style.cursor = "pointer";
    }
  }

  function handlePointerOut(_e?: ThreeEvent<PointerEvent> | React.FocusEvent) {
    hoveredRef.current = false;
    document.body.style.cursor = "auto";
  }

  return (
    <group onClick={handleClick} onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
      <group ref={groupRef}>{children}</group>
      <group ref={highlightGroupRef} />

      {/* アクセシビリティ用: フォーカス可能な隠しボタン */}
      <Html style={{ opacity: 0, pointerEvents: "none" }}>
        <button
          aria-label={`${sectionId}の詳細を表示`}
          onClick={handleClick}
          onFocus={handlePointerOver}
          onBlur={handlePointerOut}
          style={{ pointerEvents: "auto", width: "1px", height: "1px", border: "none", padding: 0 }}
        />
      </Html>
    </group>
  );
}
