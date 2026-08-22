import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import SceneTransitionOverlay from "../SceneTransitionOverlay";
import { usePortfolioStore } from "../../store/usePortfolioStore";

describe("SceneTransitionOverlay", () => {
  beforeEach(() => {
    usePortfolioStore.setState({ currentScene: "real", isSceneTransitioning: false });
  });

  it("非トランジション中はアクティブクラスが付与されず aria-hidden であること", () => {
    const { container } = render(<SceneTransitionOverlay />);
    const overlay = container.querySelector(".scene-transition-overlay");
    expect(overlay).not.toHaveClass("scene-transition-overlay--active");
    expect(overlay).toHaveAttribute("aria-hidden", "true");
  });

  it("トランジション中はアクティブクラスが付与され aria-hidden が解除されること", () => {
    usePortfolioStore.setState({ isSceneTransitioning: true });
    const { container } = render(<SceneTransitionOverlay />);
    const overlay = container.querySelector(".scene-transition-overlay");
    expect(overlay).toHaveClass("scene-transition-overlay--active");
    expect(overlay).toHaveAttribute("aria-hidden", "false");
  });

  it("virtual シーンでは Virtual Mountain Lounge のメッセージを表示すること", () => {
    usePortfolioStore.setState({ currentScene: "virtual", isSceneTransitioning: true });
    render(<SceneTransitionOverlay />);
    expect(screen.getByText("Entering Virtual Mountain Lounge...")).toBeInTheDocument();
  });

  it("real シーンでは Engineer Room のメッセージを表示すること", () => {
    usePortfolioStore.setState({ currentScene: "real", isSceneTransitioning: true });
    render(<SceneTransitionOverlay />);
    expect(screen.getByText("Connecting to Engineer Room...")).toBeInTheDocument();
  });
});
