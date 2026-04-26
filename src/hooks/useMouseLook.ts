import { useRef, useEffect } from "react";

const MOUSE_SENSITIVITY = 0.002; // rad/px
const PITCH_MAX = (70 * Math.PI) / 180; // 70° in radians
const MAX_DELTA_PER_EVENT = (30 * Math.PI) / 180; // 30° クランプ（1イベントあたりの最大回転量）

export interface MouseLookResult {
  yawRef: React.RefObject<number>;
  pitchRef: React.RefObject<number>;
}

/**
 * 左ドラッグによるマウス視点操作フック。
 * yaw/pitch を useRef で保持し useFrame 内から直接ミューテーションできる（再レンダリングなし）。
 *
 * @param canvas   イベントを attach する canvas 要素（gl.domElement）
 * @param enabled  false の間は入力を無視（遷移中など）
 */
export function useMouseLook(canvas: HTMLCanvasElement | null, enabled: boolean): MouseLookResult {
  const yawRef = useRef(0);
  const pitchRef = useRef(0);
  const isDraggingRef = useRef(false);
  const lastXRef = useRef(0);
  const lastYRef = useRef(0);

  useEffect(() => {
    if (!canvas) return;

    const onPointerDown = (e: PointerEvent): void => {
      if (e.button !== 0 || !enabled) return;
      isDraggingRef.current = true;
      lastXRef.current = e.clientX;
      lastYRef.current = e.clientY;
      canvas.style.cursor = "grabbing";
      canvas.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent): void => {
      if (!isDraggingRef.current || !enabled) return;
      const dx = e.clientX - lastXRef.current;
      const dy = e.clientY - lastYRef.current;
      lastXRef.current = e.clientX;
      lastYRef.current = e.clientY;

      // 1イベントあたりの最大回転量をクランプ（視点ぶれ防止）
      const rawDYaw = -dx * MOUSE_SENSITIVITY;
      const rawDPitch = -dy * MOUSE_SENSITIVITY;
      const dYaw = Math.max(-MAX_DELTA_PER_EVENT, Math.min(MAX_DELTA_PER_EVENT, rawDYaw));
      const dPitch = Math.max(-MAX_DELTA_PER_EVENT, Math.min(MAX_DELTA_PER_EVENT, rawDPitch));

      yawRef.current += dYaw;
      pitchRef.current = Math.max(-PITCH_MAX, Math.min(PITCH_MAX, pitchRef.current + dPitch));
    };

    const onPointerUp = (): void => {
      isDraggingRef.current = false;
      canvas.style.cursor = "grab";
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    canvas.style.cursor = "grab";

    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      canvas.style.cursor = "";
    };
  }, [canvas, enabled]);

  return { yawRef, pitchRef };
}
