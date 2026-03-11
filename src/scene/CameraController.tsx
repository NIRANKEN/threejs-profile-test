import { useRef, useEffect } from 'react'
import { Vector3 } from 'three'
import { CameraControls } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import type CameraControlsImpl from 'camera-controls'
import { usePortfolioStore } from '../store/usePortfolioStore'
import { OVERVIEW_CAMERA, SECTION_CAMERAS } from '../types/sections'

// ─── カメラ制約定数 ────────────────────────────────────────────────────────────
const EYE_HEIGHT = 1.6

// フレーム毎に再利用するワーキングベクトル（アロケーション削減）
const POS_VEC = new Vector3()
const TGT_VEC = new Vector3()
const FORWARD_H = new Vector3() // 水平方向の前進ベクトル
const RIGHT_H = new Vector3()   // 水平方向の右ベクトル
const WORLD_UP = new Vector3(0, 1, 0)

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

// 歩行エリア外に出た場合に押し戻す
const clampToWalkingArea = (pos: Vector3) => {
  pos.x = Math.max(-2.1, Math.min(2.1, pos.x))
  pos.z = Math.max(-1.9, Math.min(1.7, pos.z))

  if (pos.x > 0.4 && pos.z > 0.0) {
    if (pos.x - 0.4 < pos.z - 0.0) pos.x = 0.4
    else pos.z = 0.0
  }
  if (pos.x < -0.4 && pos.z < -0.4) {
    if (-0.4 - pos.x < -0.4 - pos.z) pos.x = -0.4
    else pos.z = -0.4
  }
}

export default function CameraController() {
  const ref = useRef<CameraControlsImpl>(null)
  const activeSection = usePortfolioStore((s) => s.activeSection)
  const setCameraControlsRef = usePortfolioStore((s) => s.setCameraControlsRef)
  const setTransitioning = usePortfolioStore((s) => s.setTransitioning)
  const isTransitioning = usePortfolioStore((s) => s.isTransitioning)
  const isFirstMount = useRef(true)

  // 真上/真下を向いたときのために最後の水平前進方向を記憶する
  const lastForwardH = useRef(new Vector3(0, 0, -1))

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

  // CameraControlsのrefをstoreに登録
  useEffect(() => {
    setCameraControlsRef(ref)
  }, [setCameraControlsRef])

  // WASD移動制御
  useFrame((_, delta) => {
    const controls = ref.current
    if (!controls || activeSection || isTransitioning) return

    const isW = keys.current['KeyW']
    const isS = keys.current['KeyS']
    const isA = keys.current['KeyA']
    const isD = keys.current['KeyD']

    if (!isW && !isS && !isA && !isD) return

    controls.getPosition(POS_VEC)
    controls.getTarget(TGT_VEC)

    // ── 水平移動ベクトルを計算 ────────────────────────────────────────────────
    // controls.forward() は3Dの視線方向に移動するため、上を向いたとき水平成分が
    // ゼロに近づき NaN が発生する。代わりに視線方向を XZ 平面に投影して正規化する。
    FORWARD_H.subVectors(TGT_VEC, POS_VEC)
    FORWARD_H.y = 0
    const forwardLen = FORWARD_H.length()
    if (forwardLen > 0.001) {
      FORWARD_H.divideScalar(forwardLen)
      lastForwardH.current.copy(FORWARD_H)
    } else {
      // ほぼ真上/真下を向いている場合は最後に記録した水平方向を使用
      FORWARD_H.copy(lastForwardH.current)
    }

    // 右ベクトル = 前進 × 上 (正規化済み FORWARD_H を使用)
    RIGHT_H.crossVectors(FORWARD_H, WORLD_UP).normalize()

    // ── 水平方向への移動量を算出 ─────────────────────────────────────────────
    const moveSpeed = 3.0 * delta
    let dx = 0
    let dz = 0
    if (isW) { dx += FORWARD_H.x * moveSpeed; dz += FORWARD_H.z * moveSpeed }
    if (isS) { dx -= FORWARD_H.x * moveSpeed; dz -= FORWARD_H.z * moveSpeed }
    if (isA) { dx -= RIGHT_H.x * moveSpeed; dz -= RIGHT_H.z * moveSpeed }
    if (isD) { dx += RIGHT_H.x * moveSpeed; dz += RIGHT_H.z * moveSpeed }

    // ── 衝突判定と押し戻し ───────────────────────────────────────────────────
    const oldPosX = POS_VEC.x
    const oldPosZ = POS_VEC.z
    let newPosX = oldPosX + dx
    let newPosZ = oldPosZ + dz

    if (!isPositionInWalkingArea(newPosX, newPosZ)) {
      POS_VEC.set(newPosX, EYE_HEIGHT, newPosZ)
      clampToWalkingArea(POS_VEC)
      newPosX = POS_VEC.x
      newPosZ = POS_VEC.z
    }

    // ── ターゲットを実際の移動量だけオフセット ───────────────────────────────
    // 衝突で位置がクランプされた場合、ターゲットも同じ量だけ動かすことで
    // カメラの向きが急変しない（カメラブレ防止）。
    // 位置の Y は常に EYE_HEIGHT に固定し、ターゲットの Y はそのまま維持する
    // ことで上下の視線角度も保持される。
    const actualDx = newPosX - oldPosX
    const actualDz = newPosZ - oldPosZ

    controls.setLookAt(
      newPosX, EYE_HEIGHT, newPosZ,
      TGT_VEC.x + actualDx, TGT_VEC.y, TGT_VEC.z + actualDz,
      false,
    )
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
      minDistance={0.1}
      maxDistance={3.0}
      // ── 縦方向の角度制限 ────────────────────────────────────────────────────
      // 天頂方向: 30° (0.52 rad)
      minPolarAngle={0.52}
      // 天底方向: 120° (2.09 rad)
      maxPolarAngle={2.09}
      // ── ズームをカーソル位置に向かうようにする ───────────────────────────
      dollyToCursor
      // ── 操作制限 ──────────────────────────────────────────────────────────
      mouseButtons={{
        left: 1,  // ACTION.ROTATE
        middle: 0, // ACTION.NONE
        right: 0,  // ACTION.NONE
        wheel: 8,  // ACTION.DOLLY
      }}
      touches={{
        one: 32,   // ACTION.TOUCH_ROTATE
        two: 512,  // ACTION.TOUCH_DOLLY_TRUCK
        three: 0,  // ACTION.NONE
      }}
    />
  )
}
