import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import HelpButton from "../HelpButton";

describe("HelpButton", () => {
  it("初期状態ではダイアログが閉じていること", () => {
    render(<HelpButton />);
    expect(screen.getByRole("dialog", { hidden: true })).not.toHaveClass("help-dialog--open");
  });

  it("ボタンクリックでダイアログが開くこと", () => {
    render(<HelpButton />);
    fireEvent.click(screen.getByRole("button", { name: "操作ヘルプを開く" }));
    expect(screen.getByRole("dialog", { hidden: true })).toHaveClass("help-dialog--open");
  });

  it("閉じるボタンでダイアログが閉じること", () => {
    render(<HelpButton />);
    fireEvent.click(screen.getByRole("button", { name: "操作ヘルプを開く" }));
    fireEvent.click(screen.getByRole("button", { name: "閉じる" }));
    expect(screen.getByRole("dialog", { hidden: true })).not.toHaveClass("help-dialog--open");
  });

  it("Escape キーでダイアログが閉じること", () => {
    render(<HelpButton />);
    fireEvent.click(screen.getByRole("button", { name: "操作ヘルプを開く" }));
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.getByRole("dialog", { hidden: true })).not.toHaveClass("help-dialog--open");
  });
});
