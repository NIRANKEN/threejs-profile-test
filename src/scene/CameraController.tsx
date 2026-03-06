import { useRef, useEffect } from 'react'
import { Box3, Vector3 } from 'three'
import { CameraControls } from '@react-three/drei'
import type CameraControlsImpl from 'camera-controls'
import { usePortfolioStore } from '../store/usePortfolioStore'
import { OVERVIEW_CAMERA, SECTION_CAMERAS } from '../types/sections'

// ─── カメラ制約定数 ────────────────────────────────────────────────────────────
/**
 * カメラ位置の境界ボックス (sections.ts の座標メモに合わせて設定)
 *   Room 実寸: X:-2.5〜+2.5, Y:0〜3.1, Z:-2.2〜+2.0
 *   各方向に 0.5〜0.8 の余白を追加し、室内探索を許容しつつ壁抜けを防ぐ
 *
 *   X: -3.0 ~ 3.0
 *   Y:  0.3 ~ 3.8  (床より少し上 ～ 天井より少し上)
 *   Z: -3.0 ~ 2.5  (奥壁 + 余白 ～ 手前 + 余白)
 */
const ROOM_BOUNDARY = new Box3(
  new Vector3(-3.0, 0.3, -3.0),
  new Vector3( 3.0, 3.8,  2.5),
)

export default function CameraController() {
  const ref = useRef<CameraControlsImpl>(null)
  const activeSection = usePortfolioStore((s) => s.activeSection)
  const setCameraControlsRef = usePortfolioStore((s) => s.setCameraControlsRef)
  const setTransitioning = usePortfolioStore((s) => s.setTransitioning)
  const isFirstMount = useRef(true)

  // CameraControlsのrefをstoreに登録 + 境界ボックスを設定
  useEffect(() => {
    setCameraControlsRef(ref)
    const controls = ref.current
    if (!controls) return
    controls.setBoundary(ROOM_BOUNDARY)
  }, [setCameraControlsRef])

  // アクティブセクション変更時にカメラをスムーズに移動
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false
      return
    }

    const controls = ref.current
    if (!controls) return

    let cancelled = false
    const cam = activeSection ? SECTION_CAMERAS[activeSection] : OVERVIEW_CAMERA

    setTransitioning(true)
    controls
      .setLookAt(
        cam.position[0],
        cam.position[1],
        cam.position[2],
        cam.target[0],
        cam.target[1],
        cam.target[2],
        true,
      )
      .then(() => {
        if (!cancelled) setTransitioning(false)
      })

    return () => {
      cancelled = true
    }
  }, [activeSection, setTransitioning])

  return (
    <CameraControls
      ref={ref}
      makeDefault
      smoothTime={0.6}
      // ── ズーム制限 (室内スケール基準) ────────────────────────────────────────
      // ターゲットからの最小距離: オブジェクトに潜り込まない
      minDistance={0.3}
      // ターゲットからの最大距離: 部屋が画角に収まる上限 (部屋は約 5 units 幅)
      maxDistance={2.0}
      // ── 縦方向の角度制限 ────────────────────────────────────────────────────
      // 天頂方向: 30° (0.52 rad) — 真上を向きすぎない
      minPolarAngle={0.52}
      // 天底方向: 120° (2.09 rad) — 床を突き抜けて見下ろしすぎない
      maxPolarAngle={2.09}
      // ── 境界の反発係数 ──────────────────────────────────────────────────────
      // 0 = 硬い壁, 1 = 完全に弾む。0.15 で柔らかく止まる感触
      boundaryFriction={0.15}
      // ── ズームをカーソル位置に向かうようにする ───────────────────────────
      dollyToCursor
    />
  )
}
