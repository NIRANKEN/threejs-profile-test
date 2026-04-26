import { describe, it, expect, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useMouseLook } from "../useMouseLook";

const PITCH_MAX = (70 * Math.PI) / 180;

/** テスト用の最小限 canvas スタブを作成する */
function createMockCanvas(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  // setPointerCapture は jsdom で未実装のためスタブ化
  canvas.setPointerCapture = () => undefined;
  canvas.releasePointerCapture = () => undefined;
  document.body.appendChild(canvas);
  return canvas;
}

/** canvas に pointerdown → pointermove → pointerup のシーケンスを発火する */
function drag(canvas: HTMLCanvasElement, dx: number, dy: number): void {
  canvas.dispatchEvent(
    new PointerEvent("pointerdown", { button: 0, clientX: 100, clientY: 100, bubbles: true }),
  );
  canvas.dispatchEvent(
    new PointerEvent("pointermove", {
      clientX: 100 + dx,
      clientY: 100 + dy,
      bubbles: true,
    }),
  );
  canvas.dispatchEvent(new PointerEvent("pointerup", { bubbles: true }));
}

describe("useMouseLook", () => {
  let canvas: HTMLCanvasElement;

  beforeEach(() => {
    canvas = createMockCanvas();
  });

  it("左ドラッグ右方向で yaw が減少すること", () => {
    const { result } = renderHook(() => useMouseLook(canvas, true));
    drag(canvas, 100, 0); // 右へ 100px
    expect(result.current.yawRef.current).toBeLessThan(0);
  });

  it("左ドラッグ下方向で pitch が減少すること", () => {
    const { result } = renderHook(() => useMouseLook(canvas, true));
    drag(canvas, 0, 100); // 下へ 100px
    expect(result.current.pitchRef.current).toBeLessThan(0);
  });

  it("pitch が +PITCH_MAX を超えてクランプされること", () => {
    const { result } = renderHook(() => useMouseLook(canvas, true));
    // 上方向に極端にドラッグ（-10000px: 大量の upward = pitch 増加方向）
    drag(canvas, 0, -10000);
    expect(result.current.pitchRef.current).toBeLessThanOrEqual(PITCH_MAX);
  });

  it("pitch が -PITCH_MAX を下回らずクランプされること", () => {
    const { result } = renderHook(() => useMouseLook(canvas, true));
    // 下方向に極端にドラッグ
    drag(canvas, 0, 10000);
    expect(result.current.pitchRef.current).toBeGreaterThanOrEqual(-PITCH_MAX);
  });

  it("enabled=false の間はドラッグが無視されること", () => {
    const { result } = renderHook(() => useMouseLook(canvas, false));
    drag(canvas, 200, 200);
    expect(result.current.yawRef.current).toBe(0);
    expect(result.current.pitchRef.current).toBe(0);
  });

  it("アンマウント後にイベントが無視されること", () => {
    const { result, unmount } = renderHook(() => useMouseLook(canvas, true));
    unmount();
    drag(canvas, 100, 100);
    expect(result.current.yawRef.current).toBe(0);
    expect(result.current.pitchRef.current).toBe(0);
  });
});
