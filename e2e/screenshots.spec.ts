import { test, expect } from "@playwright/test";
import { waitForScene, setActiveSection, waitForTransitionDone } from "./helpers";
import type { RealSectionId, VtuberSectionId } from "../src/types/sections";

// ─── PRレビュー用の主要画面スクリーンショット撮影 ────────────────────────────
// アサーションではなく、S3アップロード（CI専用ステップ）の入力となる静止画を
// e2e-screenshots/ に書き出すのが目的。ここではアップロードは行わない。

const SCREENSHOT_DIR = "e2e-screenshots";

const REAL_SECTIONS: { id: RealSectionId; heading: string }[] = [
  { id: "profile", heading: "Profile" },
  { id: "skills", heading: "Skills" },
  { id: "works", heading: "Works" },
  { id: "contact", heading: "Contact" },
];

const VIRTUAL_SECTIONS: { id: VtuberSectionId; heading: string }[] = [
  { id: "profile", heading: "🏔️ Profile" },
  { id: "works", heading: "🎬 Activities & Works" },
  { id: "guidelines", heading: "📜 Guidelines" },
  { id: "links", heading: "🔗 Links & Channels" },
  { id: "contact", heading: "Contact" },
];

test("REAL シーンの主要画面をスクリーンショットする", async ({ page }) => {
  await page.goto("/");
  await waitForScene(page);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/real-initial.png` });

  for (const section of REAL_SECTIONS) {
    await setActiveSection(page, section.id);
    await waitForTransitionDone(page);
    await expect(page.getByRole("heading", { name: section.heading })).toBeVisible();
    await page.screenshot({ path: `${SCREENSHOT_DIR}/real-${section.id}.png` });
  }
});

test("VIRTUAL シーンの主要画面をスクリーンショットする", async ({ page }) => {
  await page.goto("/?scene=virtual");
  await waitForScene(page);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/virtual-initial.png` });

  for (const section of VIRTUAL_SECTIONS) {
    await setActiveSection(page, section.id);
    await waitForTransitionDone(page);
    await expect(page.getByRole("heading", { name: section.heading })).toBeVisible();
    await page.screenshot({ path: `${SCREENSHOT_DIR}/virtual-${section.id}.png` });
  }
});
