import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SceneToggle from "../SceneToggle";
import { usePortfolioStore } from "../../store/usePortfolioStore";

describe("SceneToggle", () => {
  beforeEach(() => {
    window.history.pushState({}, "", "/");
    usePortfolioStore.setState({ currentScene: "real", isSceneTransitioning: false });
  });

  it("real シーンでは REAL タブが選択状態、VIRTUAL タブは無効であること", () => {
    render(<SceneToggle />);
    expect(screen.getByRole("tab", { name: /REAL/ })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: /VIRTUAL/ })).toBeDisabled();
  });

  it("VIRTUAL タブをクリックしても real → virtual には遷移しないこと", () => {
    render(<SceneToggle />);
    fireEvent.click(screen.getByRole("tab", { name: /VIRTUAL/ }));
    expect(usePortfolioStore.getState().currentScene).toBe("real");
  });

  it("virtual シーンでは REAL タブをクリックして real に戻せること", () => {
    usePortfolioStore.setState({ currentScene: "virtual" });
    render(<SceneToggle />);

    expect(screen.getByRole("tab", { name: /VIRTUAL/ })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: /REAL/ })).not.toBeDisabled();

    fireEvent.click(screen.getByRole("tab", { name: /REAL/ }));
    expect(usePortfolioStore.getState().currentScene).toBe("real");
  });

  it("トランジション中は両タブとも無効化されること", () => {
    usePortfolioStore.setState({ isSceneTransitioning: true });
    render(<SceneToggle />);
    expect(screen.getByRole("tab", { name: /REAL/ })).toBeDisabled();
    expect(screen.getByRole("tab", { name: /VIRTUAL/ })).toBeDisabled();
  });
});
