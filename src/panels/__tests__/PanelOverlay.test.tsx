import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PanelOverlay from "../PanelOverlay";
import { usePortfolioStore } from "../../store/usePortfolioStore";

describe("PanelOverlay", () => {
  beforeEach(() => {
    usePortfolioStore.setState({
      currentScene: "real",
      activeSection: null,
      isTransitioning: false,
    });
  });

  it("activeSection が null の場合は非表示クラスになること", () => {
    const { container } = render(<PanelOverlay />);
    expect(container.querySelector(".panel-overlay")).not.toHaveClass("panel-overlay--visible");
  });

  it("real シーンで activeSection='profile' の場合 ProfilePanel を表示すること", () => {
    usePortfolioStore.setState({ activeSection: "profile" });
    render(<PanelOverlay />);
    expect(screen.getByRole("heading", { name: "Profile" })).toBeInTheDocument();
  });

  it("virtual シーンで activeSection='guidelines' の場合 VtuberGuidelinesPanel を表示すること", () => {
    usePortfolioStore.setState({ currentScene: "virtual", activeSection: "guidelines" });
    render(<PanelOverlay />);
    expect(screen.getByRole("heading", { name: "📜 Guidelines" })).toBeInTheDocument();
  });

  it("閉じるボタンで activeSection が null になること", () => {
    usePortfolioStore.setState({ activeSection: "works" });
    render(<PanelOverlay />);
    fireEvent.click(screen.getByRole("button", { name: "パネルを閉じる" }));
    expect(usePortfolioStore.getState().activeSection).toBeNull();
  });

  it("Escape キーで activeSection が null になること", () => {
    usePortfolioStore.setState({ activeSection: "works" });
    render(<PanelOverlay />);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(usePortfolioStore.getState().activeSection).toBeNull();
  });

  it("トランジション中は Escape キーで閉じないこと", () => {
    usePortfolioStore.setState({ activeSection: "works", isTransitioning: true });
    render(<PanelOverlay />);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(usePortfolioStore.getState().activeSection).toBe("works");
  });
});
