import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useFirstPersonInput } from "../useFirstPersonInput";

describe("useFirstPersonInput", () => {
  it("keydown で Set にキーが追加されること", () => {
    const { result } = renderHook(() => useFirstPersonInput());

    window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyW" }));
    expect(result.current.current.has("KeyW")).toBe(true);
  });

  it("keyup で Set からキーが削除されること", () => {
    const { result } = renderHook(() => useFirstPersonInput());

    window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyW" }));
    window.dispatchEvent(new KeyboardEvent("keyup", { code: "KeyW" }));
    expect(result.current.current.has("KeyW")).toBe(false);
  });

  it("複数キーの同時押しが Set に格納されること", () => {
    const { result } = renderHook(() => useFirstPersonInput());

    window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyW" }));
    window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyA" }));
    expect(result.current.current.has("KeyW")).toBe(true);
    expect(result.current.current.has("KeyA")).toBe(true);
  });

  it("blur イベントで Set が空になること", () => {
    const { result } = renderHook(() => useFirstPersonInput());

    window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyW" }));
    window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyS" }));
    expect(result.current.current.size).toBe(2);

    window.dispatchEvent(new Event("blur"));
    expect(result.current.current.size).toBe(0);
  });

  it("アンマウント後にイベントが無視されること", () => {
    const { result, unmount } = renderHook(() => useFirstPersonInput());

    unmount();
    window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyW" }));
    expect(result.current.current.has("KeyW")).toBe(false);
  });
});
