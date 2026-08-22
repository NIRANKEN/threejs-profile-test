import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ResetButton from "../ResetButton";
import { usePortfolioStore } from "../../store/usePortfolioStore";

describe("ResetButton", () => {
  beforeEach(() => {
    usePortfolioStore.setState({ activeSection: "profile", resetSignal: 0 });
  });

  it("クリックでアクティブセクションを閉じ、resetSignal をインクリメントする", () => {
    render(<ResetButton />);

    fireEvent.click(screen.getByRole("button", { name: "カメラを初期位置にリセット" }));

    expect(usePortfolioStore.getState().activeSection).toBeNull();
    expect(usePortfolioStore.getState().resetSignal).toBe(1);
  });
});
