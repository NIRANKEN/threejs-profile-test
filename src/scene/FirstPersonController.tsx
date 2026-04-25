import { useRef, useEffect } from 'react'
import { Vector3 } from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { usePortfolioStore } from '../store/usePortfolioStore'
import { INITIAL_ORIENTATION, SECTION_ORIENTATIONS } from '../types/sections'
import { useFirstPersonInput } from '../hooks/useFirstPersonInput'
import { useMouseLook } from '../hooks/useMouseLook'

// ─── 定数 ──────────────────────────────────────────────────────────────────
const MOVE_SPEED = 3.0   // units/秒
const LERP_SPEED = 8.0   // exponential lerp 係数（遷移アニメーション）
const SNAP_THRESHOLD = 0.01 // この距離以下でスナップ確定

const ROOM_BOUNDS = {
  xMin: -2.8, xMax: 2.8,
  yFixed: 1.6, // 目線高さ固定（飛行・落下なし）
  zMin: -2.0, zMax: 2.0,
} as const

// ─── GC 対策: モジュールスコープで事前確保（useFrame 内で new しない）──────
const _fwd      = new Vector3()
const _right    = new Vector3()
const _up       = new Vector3(0, 1, 0)
const _move     = new Vector3()
const _targetPos = new Vector3(...INITIAL_ORIENTATION.position)

/**
 * 一人称視点カメラコントローラー。
 * - WASD で部屋の中を自由移動
 * - 左ドラッグで視点（yaw/pitch）を操作
 * - セクション選択時に固定カメラアングルへ exponential lerp で遷移
 * - 部屋の境界ボックスで壁抜けを防止
 */
export default function FirstPersonController() {
  const { camera, gl } = useThree()

  const activeSection  = usePortfolioStore((s) => s.activeSection)
  const isTransitioning = usePortfolioStore((s) => s.isTransitioning)
  const setTransitioning = usePortfolioStore((s) => s.setTransitioning)
  const resetSignal    = usePortfolioStore((s) => s.resetSignal)

  const keysRef = useFirstPersonInput()
  const { yawRef, pitchRef } = useMouseLook(
    gl.domElement,
    !isTransitioning,
  )

  // 遷移先の目標値（ref で保持: 再レンダリング不要）
  const targetYawRef   = useRef(INITIAL_ORIENTATION.yaw)
  const targetPitchRef = useRef(INITIAL_ORIENTATION.pitch)
  const isFirstMount   = useRef(true)

  // カメラ初期化: rotation.order = 'YXZ'（FPS標準）
  useEffect(() => {
    camera.rotation.order = 'YXZ'
    camera.position.set(...INITIAL_ORIENTATION.position)
    camera.rotation.y = INITIAL_ORIENTATION.yaw
    camera.rotation.x = INITIAL_ORIENTATION.pitch
    _targetPos.set(...INITIAL_ORIENTATION.position)
  }, [camera])

  // activeSection 変化 → 遷移先をセット
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false
      return
    }
    const orient = activeSection
      ? SECTION_ORIENTATIONS[activeSection]
      : INITIAL_ORIENTATION
    _targetPos.set(...orient.position)
    targetYawRef.current = orient.yaw
    targetPitchRef.current = orient.pitch
    setTransitioning(true)
  }, [activeSection, setTransitioning])

  // resetSignal 変化 → 初期位置へリセット遷移
  useEffect(() => {
    if (resetSignal === 0) return
    _targetPos.set(...INITIAL_ORIENTATION.position)
    targetYawRef.current = INITIAL_ORIENTATION.yaw
    targetPitchRef.current = INITIAL_ORIENTATION.pitch
    setTransitioning(true)
  }, [resetSignal, setTransitioning])

  useFrame((_, delta) => {
    // NaN ガード（外部起因の破損を検出したら即時フォールバック）
    const p = camera.position
    if (isNaN(p.x) || isNaN(p.y) || isNaN(p.z)) {
      camera.position.set(...INITIAL_ORIENTATION.position)
      yawRef.current = 0
      pitchRef.current = 0
    }

    // delta を最大 0.1 秒でクランプ（タブ復帰時の大ジャンプ防止）
    const dt = Math.min(delta, 0.1)

    if (isTransitioning) {
      // ─── セクション遷移アニメーション ────────────────────────────────────
      const alpha = 1 - Math.exp(-LERP_SPEED * dt)
      camera.position.lerp(_targetPos, alpha)

      // 角度の線形補間（単純差分 lerp で十分な範囲内）
      yawRef.current   += (targetYawRef.current   - yawRef.current)   * alpha
      pitchRef.current += (targetPitchRef.current - pitchRef.current) * alpha

      // スナップ判定
      const distPos   = camera.position.distanceTo(_targetPos)
      const distYaw   = Math.abs(yawRef.current   - targetYawRef.current)
      const distPitch = Math.abs(pitchRef.current - targetPitchRef.current)
      if (distPos < SNAP_THRESHOLD && distYaw < SNAP_THRESHOLD && distPitch < SNAP_THRESHOLD) {
        camera.position.copy(_targetPos)
        yawRef.current   = targetYawRef.current
        pitchRef.current = targetPitchRef.current
        setTransitioning(false)
      }
    } else {
      // ─── 自由移動: WASD ──────────────────────────────────────────────────
      const keys = keysRef.current
      const moving =
        keys.has('KeyW') || keys.has('KeyS') ||
        keys.has('KeyA') || keys.has('KeyD')

      if (moving) {
        const speed = MOVE_SPEED * dt

        // カメラの前進方向を XZ 平面に投影
        camera.getWorldDirection(_fwd)
        _fwd.y = 0
        if (_fwd.lengthSq() > 1e-6) {
          _fwd.normalize()
          _right.crossVectors(_fwd, _up).normalize()

          _move.set(0, 0, 0)
          if (keys.has('KeyW')) _move.addScaledVector(_fwd,   speed)
          if (keys.has('KeyS')) _move.addScaledVector(_fwd,  -speed)
          if (keys.has('KeyD')) _move.addScaledVector(_right,  speed)
          if (keys.has('KeyA')) _move.addScaledVector(_right, -speed)

          camera.position.add(_move)
        }
      }

      // 境界クランプ（毎フレーム適用: NaN 積算誤差も吸収）
      camera.position.x = Math.max(ROOM_BOUNDS.xMin, Math.min(ROOM_BOUNDS.xMax, camera.position.x))
      camera.position.y = ROOM_BOUNDS.yFixed
      camera.position.z = Math.max(ROOM_BOUNDS.zMin, Math.min(ROOM_BOUNDS.zMax, camera.position.z))
    }

    // rotation を適用（遷移中・自由移動中、どちらでも毎フレーム反映）
    camera.rotation.y = yawRef.current
    camera.rotation.x = pitchRef.current
  })

  return null
}
