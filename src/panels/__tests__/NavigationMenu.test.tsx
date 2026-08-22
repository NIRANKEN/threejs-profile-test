import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import NavigationMenu from "../NavigationMenu";
import { usePortfolioStore } from "../../store/usePortfolioStore";

describe("NavigationMenu", () => {
  beforeEach(() => {
    window.history.pushState({}, "", "/");
    usePortfolioStore.setState({
      currentScene: "real",
      activeSection: null,
      isTransitioning: false,
      isSceneTransitioning: false,
    });
  });

  it("トグルボタンでメニューの開閉ができること", () => {
    const { container } = render(<NavigationMenu />);
    const toggle = screen.getByRole("button", { name: "Toggle navigation menu" });

    expect(container.querySelector(".nav-dropdown")).not.toHaveClass("nav-dropdown--open");
    fireEvent.click(toggle);
    expect(container.querySelector(".nav-dropdown")).toHaveClass("nav-dropdown--open");
  });

  it("real シーンでは Profile/Skills/Works/Contact が表示されること", () => {
    render(<NavigationMenu />);
    fireEvent.click(screen.getByRole("button", { name: "Toggle navigation menu" }));

    expect(screen.getByRole("button", { name: /Profile/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Skills/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Works/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Contact/ })).toBeInTheDocument();
  });

  it("項目クリックで activeSection が更新されメニューが閉じること", () => {
    const { container } = render(<NavigationMenu />);
    fireEvent.click(screen.getByRole("button", { name: "Toggle navigation menu" }));
    fireEvent.click(screen.getByRole("button", { name: /Skills/ }));

    expect(usePortfolioStore.getState().activeSection).toBe("skills");
    expect(container.querySelector(".nav-dropdown")).not.toHaveClass("nav-dropdown--open");
  });

  it("メニュー外クリックで閉じること", () => {
    const { container } = render(<NavigationMenu />);
    fireEvent.click(screen.getByRole("button", { name: "Toggle navigation menu" }));
    expect(container.querySelector(".nav-dropdown")).toHaveClass("nav-dropdown--open");

    fireEvent.mouseDown(document.body);
    expect(container.querySelector(".nav-dropdown")).not.toHaveClass("nav-dropdown--open");
  });

  it("Escape キーで閉じること", () => {
    const { container } = render(<NavigationMenu />);
    fireEvent.click(screen.getByRole("button", { name: "Toggle navigation menu" }));
    fireEvent.keyDown(window, { key: "Escape" });
    expect(container.querySelector(".nav-dropdown")).not.toHaveClass("nav-dropdown--open");
  });

  it("トランジション中は項目ボタンが無効化されること", () => {
    usePortfolioStore.setState({ isTransitioning: true });
    render(<NavigationMenu />);
    fireEvent.click(screen.getByRole("button", { name: "Toggle navigation menu" }));
    expect(screen.getByRole("button", { name: /Profile/ })).toBeDisabled();
  });

  it("virtual シーンでは VtuberのNav項目と REAL への切り替えボタンが表示されること", () => {
    usePortfolioStore.setState({ currentScene: "virtual" });
    render(<NavigationMenu />);
    fireEvent.click(screen.getByRole("button", { name: "Toggle navigation menu" }));

    expect(screen.getByRole("button", { name: /Activities & Works/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Guidelines/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Links/ })).toBeInTheDocument();

    const switchBtn = screen.getByRole("button", { name: /Switch to REAL/ });
    fireEvent.click(switchBtn);
    expect(usePortfolioStore.getState().currentScene).toBe("real");
  });
});
