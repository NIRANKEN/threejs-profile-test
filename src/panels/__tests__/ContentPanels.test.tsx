import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ProfilePanel from "../ProfilePanel";
import SkillsPanel from "../SkillsPanel";
import WorksPanel from "../WorksPanel";
import ContactPanel from "../ContactPanel";
import VtuberProfilePanel from "../vtuber/VtuberProfilePanel";
import VtuberActivitiesPanel from "../vtuber/VtuberActivitiesPanel";
import VtuberGuidelinesPanel from "../vtuber/VtuberGuidelinesPanel";
import VtuberLinksPanel from "../vtuber/VtuberLinksPanel";

describe("コンテンツパネルのスモークテスト", () => {
  it("ProfilePanel が見出しとリンクをレンダリングすること", () => {
    render(<ProfilePanel />);
    expect(screen.getByRole("heading", { name: "Profile" })).toBeInTheDocument();
    expect(screen.getAllByRole("link").length).toBeGreaterThan(0);
  });

  it("SkillsPanel が見出しとスキルタグをレンダリングすること", () => {
    render(<SkillsPanel />);
    expect(screen.getByRole("heading", { name: "Skills" })).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
  });

  it("WorksPanel が見出しと外部リンク付きの実績カードをレンダリングすること", () => {
    render(<WorksPanel />);
    expect(screen.getByRole("heading", { name: "Works" })).toBeInTheDocument();
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noreferrer");
    }
  });

  it("ContactPanel が見出しと連絡先リンクをレンダリングすること", () => {
    render(<ContactPanel />);
    expect(screen.getByRole("heading", { name: "Contact" })).toBeInTheDocument();
    expect(screen.getByText("GitHub")).toBeInTheDocument();
  });

  it("VtuberProfilePanel が見出しをレンダリングすること", () => {
    render(<VtuberProfilePanel />);
    expect(screen.getByRole("heading", { name: "🏔️ Profile" })).toBeInTheDocument();
  });

  it("VtuberActivitiesPanel が見出しと項目をレンダリングすること", () => {
    render(<VtuberActivitiesPanel />);
    expect(screen.getByRole("heading", { name: "🎬 Activities & Works" })).toBeInTheDocument();
    expect(screen.getAllByRole("link").length).toBeGreaterThan(0);
  });

  it("VtuberGuidelinesPanel が見出しをレンダリングすること", () => {
    render(<VtuberGuidelinesPanel />);
    expect(screen.getByRole("heading", { name: "📜 Guidelines" })).toBeInTheDocument();
  });

  it("VtuberLinksPanel が見出しと外部リンクをレンダリングすること", () => {
    render(<VtuberLinksPanel />);
    expect(screen.getByRole("heading", { name: "🔗 Links & Channels" })).toBeInTheDocument();
    expect(screen.getAllByRole("link").length).toBeGreaterThan(0);
  });
});
