import { useState, useEffect, useRef, useMemo } from 'react'
import type { ReactNode } from 'react'
import * as THREE from 'three'
import type { ThreeEvent } from '@react-three/fiber'
import { usePortfolioStore } from '../../store/usePortfolioStore'
import type { SectionId } from '../../types/sections'

interface Props {
  sectionId: SectionId
  children: ReactNode
}

export default function InteractiveObject({ sectionId, children }: Props) {
  const [hovered, setHovered] = useState(false)
  const groupRef = useRef<THREE.Group>(null)
  const highlightGroupRef = useRef<THREE.Group>(null)
  const activeSection = usePortfolioStore((s) => s.activeSection)
  const isTransitioning = usePortfolioStore((s) => s.isTransitioning)
  const setActiveSection = usePortfolioStore((s) => s.setActiveSection)

  // アンマウント時にカーソルを必ずリセット
  useEffect(() => {
    return () => {
      document.body.style.cursor = 'auto'
    }
  }, [])

  // ホバー状態でカーソルを変更
  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto'
  }, [hovered])

  // ハイライト用マテリアル
  const highlightMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: 0x0088ff,
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
  }, [])

  // ホバー状態に応じてハイライトメッシュを生成・破棄
  useEffect(() => {
    if (!groupRef.current || !highlightGroupRef.current) return

    if (hovered) {
      // グループ全体をクローンして階層構造を保つ
      const clonedGroup = groupRef.current.clone()

      clonedGroup.traverse((node) => {
        if (node instanceof THREE.Mesh) {
          node.material = highlightMaterial
          node.scale.multiplyScalar(1.02)
        }
      })
      highlightGroupRef.current.add(clonedGroup)
      return () => {
        // クリーンアップ: ハイライトメッシュを削除
        if (highlightGroupRef.current) {
          highlightGroupRef.current.clear()
        }
      }
    }
  }, [hovered, highlightMaterial])

  function handleClick(e: ThreeEvent<MouseEvent>) {
    e.stopPropagation()
    if (isTransitioning) return
    // 同じセクションをクリックするとオーバービューに戻る（トグル）
    setActiveSection(activeSection === sectionId ? null : sectionId)
  }

  function handlePointerOver(e: ThreeEvent<PointerEvent>) {
    e.stopPropagation()
    setHovered(true)
  }

  function handlePointerOut() {
    setHovered(false)
  }

  return (
    <group
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <group ref={groupRef}>
        {children}
      </group>
      <group ref={highlightGroupRef} />
    </group>
  )
}
