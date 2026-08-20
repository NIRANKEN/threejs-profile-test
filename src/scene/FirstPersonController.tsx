import { useRef, useEffect } from "react";
import { Vector3 } from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { usePortfolioStore } from "../store/usePortfolioStore";
import {
  SCENE_INITIAL_ORIENTATION,
  SCENE_ROOM_BOUNDS,
  SCENE_SECTION_ORIENTATIONS,
} from "../types/sections";
import { useFirstPersonInput } from "../hooks/useFirstPersonInput";
import { useMouseLook } from "../hooks/useMouseLook";

// ─── 定数 ──────────────────────────────────────────────────────────────────
const MOVE_SPEED = 3.0; // units/秒
const LERP_SPEED = 8.0; // exponential lerp 係数（遷移アニメーション）
const SNAP_THRESHOLD = 0.01; // この距離以下でスナップ確定

// ─── GC 対策: モジュールスコープで事前確保（useFrame 内で new しない）──────
const _fwd = new Vector3();
const _right = new Vector3();
const _up = new Vector3(0, 1, 0);
const _move = new Vector3();
const _targetPos = new Vector3(...SCENE_INITIAL_ORIENTATION.real.position);

/**
 * 一人称視点カメラコントローラー。
 * - WASD で部屋の中を自由移動
 * - 左ドラッグで視点（yaw/pitch）を操作
 * - セクション選択時に固定カメラアングルへ exponential lerp で遷移
 * - 部屋（REAL / VIRTUAL）に応じた境界ボックスで壁抜けを防止
 */
export default function FirstPersonController() {
  const { camera, gl } = useThree();

  const currentScene = usePortfolioStore((s) => s.currentScene);
  const activeSection = usePortfolioStore((s) => s.activeSection);
  const isTransitioning = usePortfolioStore((s) => s.isTransitioning);
  const setTransitioning = usePortfolioStore((s) => s.setTransitioning);
  const resetSignal = usePortfolioStore((s) => s.resetSignal);

  const keysRef = useFirstPersonInput();
  const { yawRef, pitchRef } = useMouseLook(gl.domElement, !isTransitioning);

  const initialOrientation = SCENE_INITIAL_ORIENTATION[currentScene];
  const sectionOrientations = SCENE_SECTION_ORIENTATIONS[currentScene];
  const roomBounds = SCENE_ROOM_BOUNDS[currentScene];

  // 遷移先の目標値（ref で保持: 再レンダリング不要）
  const targetYawRef = useRef(initialOrientation.yaw);
  const targetPitchRef = useRef(initialOrientation.pitch);
  const isFirstMount = useRef(true);
  const prevSceneRef = useRef(currentScene);

  // カメラ初期化 & シーン切り替え時の姿勢同期
  useEffect(() => {
    camera.rotation.order = "YXZ";
    const orient = SCENE_INITIAL_ORIENTATION[currentScene];

    // 初回マウントまたはシーン変更時
    if (isFirstMount.current || prevSceneRef.current !== currentScene) {
      camera.position.set(...orient.position);
      camera.rotation.y = orient.yaw;
      camera.rotation.x = orient.pitch;
      yawRef.current = orient.yaw;
      pitchRef.current = orient.pitch;
      targetYawRef.current = orient.yaw;
      targetPitchRef.current = orient.pitch;
      _targetPos.set(...orient.position);
      prevSceneRef.current = currentScene;
      setTransitioning(false);
    }
  }, [camera, currentScene, setTransitioning, yawRef, pitchRef]);

  // activeSection 変化 → 遷移先をセット
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    const orient =
      activeSection && sectionOrientations[activeSection]
        ? sectionOrientations[activeSection]
        : initialOrientation;

    _targetPos.set(...orient.position);
    targetYawRef.current = orient.yaw;
    targetPitchRef.current = orient.pitch;
    setTransitioning(true);
  }, [activeSection, currentScene, initialOrientation, sectionOrientations, setTransitioning]);

  // resetSignal 変化 → 初期位置へリセット遷移
  useEffect(() => {
    if (resetSignal === 0) return;
    _targetPos.set(...initialOrientation.position);
    targetYawRef.current = initialOrientation.yaw;
    targetPitchRef.current = initialOrientation.pitch;
    setTransitioning(true);
  }, [resetSignal, initialOrientation, setTransitioning]);

  useFrame((_, delta) => {
    // NaN ガード（外部起因の破損を検出したら即時フォールバック）
    const p = camera.position;
    if (isNaN(p.x) || isNaN(p.y) || isNaN(p.z)) {
      camera.position.set(...initialOrientation.position);
      yawRef.current = initialOrientation.yaw;
      pitchRef.current = initialOrientation.pitch;
    }

    // delta を最大 0.1 秒でクランプ（タブ復帰時の大ジャンプ防止）
    const dt = Math.min(delta, 0.1);

    if (isTransitioning) {
      // ─── セクション遷移アニメーション ────────────────────────────────────
      const alpha = 1 - Math.exp(-LERP_SPEED * dt);
      camera.position.lerp(_targetPos, alpha);

      // 角度の線形補間（単純差分 lerp で十分な範囲内）
      yawRef.current += (targetYawRef.current - yawRef.current) * alpha;
      pitchRef.current += (targetPitchRef.current - pitchRef.current) * alpha;

      // スナップ判定
      const distPos = camera.position.distanceTo(_targetPos);
      const distYaw = Math.abs(yawRef.current - targetYawRef.current);
      const distPitch = Math.abs(pitchRef.current - targetPitchRef.current);
      if (distPos < SNAP_THRESHOLD && distYaw < SNAP_THRESHOLD && distPitch < SNAP_THRESHOLD) {
        camera.position.copy(_targetPos);
        yawRef.current = targetYawRef.current;
        pitchRef.current = targetPitchRef.current;
        setTransitioning(false);
      }
    } else {
      // ─── 自由移動: WASD ──────────────────────────────────────────────────
      const keys = keysRef.current;
      const moving = keys.has("KeyW") || keys.has("KeyS") || keys.has("KeyA") || keys.has("KeyD");

      if (moving) {
        const speed = MOVE_SPEED * dt;

        // カメラの前進方向を XZ 平面に投影
        camera.getWorldDirection(_fwd);
        _fwd.y = 0;
        if (_fwd.lengthSq() > 1e-6) {
          _fwd.normalize();
          _right.crossVectors(_fwd, _up).normalize();

          _move.set(0, 0, 0);
          if (keys.has("KeyW")) _move.addScaledVector(_fwd, speed);
          if (keys.has("KeyS")) _move.addScaledVector(_fwd, -speed);
          if (keys.has("KeyD")) _move.addScaledVector(_right, speed);
          if (keys.has("KeyA")) _move.addScaledVector(_right, -speed);

          camera.position.add(_move);
        }
      }

      // 境界クランプ（毎フレーム適用: NaN 積算誤差も吸収）
      camera.position.x = Math.max(roomBounds.xMin, Math.min(roomBounds.xMax, camera.position.x));
      camera.position.y = roomBounds.yFixed;
      camera.position.z = Math.max(roomBounds.zMin, Math.min(roomBounds.zMax, camera.position.z));
    }

    // rotation を適用（遷移中・自由移動中、どちらでも毎フレーム反映）
    camera.rotation.y = yawRef.current;
    camera.rotation.x = pitchRef.current;
  });

  return null;
}
