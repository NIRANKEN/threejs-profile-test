import { useRef, useEffect } from 'react'
import { Box3, Vector3 } from 'three'
import { CameraControls } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import type CameraControlsImpl from 'camera-controls'
import { usePortfolioStore } from '../store/usePortfolioStore'
import { OVERVIEW_CAMERA, SECTION_CAMERAS } from '../types/sections'

// ─── カメラ制約定数 ────────────────────────────────────────────────────────────
const POS_VEC = new Vector3()
const TGT_VEC = new Vector3()

/**
 * カメラターゲットの境界ボックス
 */
const ROOM_BOUNDARY = new Box3(
  new Vector3(-2.3, 0.0, -2.1),
  new Vector3( 2.3, 3.2,  2.1),
)

// 移動可能な床エリアの判定 (カメラ位置の制限)
const isPositionInWalkingArea = (x: number, z: number) => {
  // 部屋全体の床範囲
  if (x < -2.1 || x > 2.1 || z < -1.9 || z > 1.7) return false

  // オブジェクトのある場所を避ける
  // ベッドエリア (右側奥)
  if (x > 0.4 && z > 0.0) return false
  // デスク・PCエリア (左側奥)
  if (x < -0.4 && z < -0.4) return false

  return true
}

export default function CameraController() {
  const ref = useRef<CameraControlsImpl>(null)
  const activeSection = usePortfolioStore((s) => s.activeSection)
  const setCameraControlsRef = usePortfolioStore((s) => s.setCameraControlsRef)
  const setTransitioning = usePortfolioStore((s) => s.setTransitioning)
  const isTransitioning = usePortfolioStore((s) => s.isTransitioning)
  const isFirstMount = useRef(true)

  // キー入力状態を管理
  const keys = useRef<{ [key: string]: boolean }>({})

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { keys.current[e.code] = true }
    const handleKeyUp = (e: KeyboardEvent) => { keys.current[e.code] = false }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  // CameraControlsのrefをstoreに登録 + 境界ボックスを設定
  useEffect(() => {
    setCameraControlsRef(ref)
    const controls = ref.current
    if (!controls) return
    controls.setBoundary(ROOM_BOUNDARY)
  }, [setCameraControlsRef])

  // WASD移動制御
  useFrame((_, delta) => {
    const controls = ref.current
    if (!controls || activeSection || isTransitioning) return

    const moveSpeed = 3.0 * delta
    let hasMoved = false

    if (keys.current['KeyW']) {
      controls.forward(moveSpeed, false)
      hasMoved = true
    }
    if (keys.current['KeyS']) {
      controls.forward(-moveSpeed, false)
      hasMoved = true
    }
    if (keys.current['KeyA']) {
      controls.truck(-moveSpeed, 0, false)
      hasMoved = true
    }
    if (keys.current['KeyD']) {
      controls.truck(moveSpeed, 0, false)
      hasMoved = true
    }

    if (hasMoved) {
      controls.getPosition(POS_VEC)
      controls.getTarget(TGT_VEC)

      // 高さ(Y)を一定に固定 (1.6m 程度の目線)
      const yDiff = 1.6 - POS_VEC.y
      POS_VEC.y = 1.6
      TGT_VEC.y += yDiff

      // 移動制限エリア外に出ようとした場合は押し戻す
      if (!isPositionInWalkingArea(POS_VEC.x, POS_VEC.z)) {
        POS_VEC.x = Math.max(-2.1, Math.min(2.1, POS_VEC.x))
        POS_VEC.z = Math.max(-1.9, Math.min(1.7, POS_VEC.z))

        if (POS_VEC.x > 0.4 && POS_VEC.z > 0.0) {
          if (POS_VEC.x - 0.4 < POS_VEC.z - 0.0) POS_VEC.x = 0.4
          else POS_VEC.z = 0.0
        }
        if (POS_VEC.x < -0.4 && POS_VEC.z < -0.4) {
          if (-0.4 - POS_VEC.x < -0.4 - POS_VEC.z) POS_VEC.x = -0.4
          else POS_VEC.z = -0.4
        }
      }

      controls.setLookAt(POS_VEC.x, POS_VEC.y, POS_VEC.z, TGT_VEC.x, TGT_VEC.y, TGT_VEC.z, false)
    }
  })

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
      // ターゲットからの最小距離
      minDistance={0.1}
      // ターゲットからの最大距離
      maxDistance={3.0}
      // ── 縦方向の角度制限 ────────────────────────────────────────────────────
      // 天頂方向: 30° (0.52 rad)
      minPolarAngle={0.52}
      // 天底方向: 120° (2.09 rad)
      maxPolarAngle={2.09}
      // ── 境界の反発係数 ──────────────────────────────────────────────────────
      boundaryFriction={0.15}
      // ── ズームをカーソル位置に向かうようにする ───────────────────────────
      dollyToCursor
      // ── 操作制限 ──────────────────────────────────────────────────────────
      // 右クリックパンを無効化し、左クリック回転のみにする
      mouseButtons={{
        left: 1, // ACTION.ROTATE
        middle: 0, // ACTION.NONE
        right: 0, // ACTION.NONE
        wheel: 8, // ACTION.DOLLY
      }}
      touches={{
        one: 32, // ACTION.TOUCH_ROTATE
        two: 512, // ACTION.TOUCH_DOLLY_TRUCK
        three: 0, // ACTION.NONE
      }}
    />
  )
}
