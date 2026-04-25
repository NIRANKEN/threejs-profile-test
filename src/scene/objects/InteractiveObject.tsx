import { useState, useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { MathUtils, Group } from 'three'
import { usePortfolioStore } from '../../store/usePortfolioStore'
import type { SectionId } from '../../types/sections'

interface Props {
  sectionId: SectionId
  children: ReactNode
  tooltipPosition?: [number, number, number]
  label?: string
}

export default function InteractiveObject({ sectionId, children, tooltipPosition = [0, 0, 0], label }: Props) {
  const [hovered, setHovered] = useState(false)
  const groupRef = useRef<Group>(null)
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

  useFrame(() => {
    if (groupRef.current) {
      const targetScale = hovered ? 1.05 : 1.0
      groupRef.current.scale.setScalar(
        MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.1)
      )
    }
  })

  return (
    <group
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <group ref={groupRef}>
        {children}
      </group>

      {/* ツールチップとスクリーンリーダー用ラベル */}
      {label && (
        <Html position={tooltipPosition} center distanceFactor={10} zIndexRange={[100, 0]}>
          <div className={`tooltip-container ${hovered ? 'tooltip-container--visible' : ''}`}>
            <span className="tooltip-label">{label}</span>
            <button
              className="tooltip-hidden-btn"
              aria-label={`${label}の詳細を表示`}
              onClick={() => {
                if (!isTransitioning) {
                  setActiveSection(activeSection === sectionId ? null : sectionId)
                }
              }}
              onFocus={() => setHovered(true)}
              onBlur={() => setHovered(false)}
            />
          </div>
        </Html>
      )}
    </group>
  )
}
