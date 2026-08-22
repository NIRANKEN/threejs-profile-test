import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CreditButton from "../CreditButton";

describe("CreditButton", () => {
  it("初期状態ではダイアログが閉じていること", () => {
    render(<CreditButton />);
    expect(screen.getByRole("dialog", { hidden: true })).not.toHaveClass("credit-dialog--open");
  });

  it("ボタンクリックでダイアログが開くこと", () => {
    render(<CreditButton />);
    fireEvent.click(screen.getByRole("button", { name: "3Dモデルのクレジット情報を表示" }));
    expect(screen.getByRole("dialog", { hidden: true })).toHaveClass("credit-dialog--open");
  });

  it("閉じるボタンでダイアログが閉じること", () => {
    render(<CreditButton />);
    fireEvent.click(screen.getByRole("button", { name: "3Dモデルのクレジット情報を表示" }));
    fireEvent.click(screen.getByRole("button", { name: "閉じる" }));
    expect(screen.getByRole("dialog", { hidden: true })).not.toHaveClass("credit-dialog--open");
  });

  it("Escape キーでダイアログが閉じること", () => {
    render(<CreditButton />);
    fireEvent.click(screen.getByRole("button", { name: "3Dモデルのクレジット情報を表示" }));
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.getByRole("dialog", { hidden: true })).not.toHaveClass("credit-dialog--open");
  });

  it("バックドロップクリックでダイアログが閉じること", () => {
    const { container } = render(<CreditButton />);
    fireEvent.click(screen.getByRole("button", { name: "3Dモデルのクレジット情報を表示" }));
    const backdrop = container.querySelector(".credit-backdrop");
    expect(backdrop).not.toBeNull();
    fireEvent.click(backdrop as Element);
    expect(screen.getByRole("dialog", { hidden: true })).not.toHaveClass("credit-dialog--open");
  });
});
