import { test, expect } from "@playwright/test";
import { waitForScene } from "./helpers";

// ─── ナビゲーションメニュー・パネル・シーン切り替えUIのラフなE2E ────────────
// first-person.spec.ts が一人称視点操作を担当するのに対し、
// このファイルは画面上のオーバーレイUI（ナビゲーション/パネル/ダイアログ）の
// 導線を広く（ざっくり）カバーする。

test.describe("REAL シーン: ナビゲーションメニュー", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForScene(page);
  });

  test("メニューを開くと Profile/Skills/Works/Contact が表示されること", async ({ page }) => {
    await page.getByRole("button", { name: "Toggle navigation menu" }).click();

    await expect(page.getByRole("button", { name: /Profile/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Skills/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Works/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Contact/ })).toBeVisible();
  });

  test("Works をクリックすると Works パネルが開くこと", async ({ page }) => {
    await page.getByRole("button", { name: "Toggle navigation menu" }).click();
    await page.getByRole("button", { name: /Works/ }).click();

    await expect(page.getByRole("heading", { name: "Works" })).toBeVisible();
  });

  test("パネルを閉じるボタンでパネルが閉じること", async ({ page }) => {
    await page.getByRole("button", { name: "Toggle navigation menu" }).click();
    await page.getByRole("button", { name: /Skills/ }).click();
    await expect(page.getByRole("heading", { name: "Skills" })).toBeVisible();

    await page.getByRole("button", { name: "パネルを閉じる" }).click();
    await expect(page.getByRole("heading", { name: "Skills" })).not.toBeVisible();
  });

  test("VIRTUAL タブは REAL シーンから無効化されていること", async ({ page }) => {
    const virtualTab = page.getByRole("tab", { name: /VIRTUAL/ });
    await expect(virtualTab).toBeDisabled();
    await expect(page.getByRole("tab", { name: /REAL/ })).toHaveAttribute("aria-selected", "true");
  });
});

test.describe("クレジットダイアログ", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForScene(page);
  });

  // HelpButton のダイアログにも同名の見出し・閉じるボタンが常時DOM上に存在するため、
  // 開いた状態を示す `.credit-dialog--open` でスコープして曖昧な一致を避ける。
  test("開いて閉じるボタンで閉じられること", async ({ page }) => {
    await page.getByRole("button", { name: "3Dモデルのクレジット情報を表示" }).click();
    const dialog = page.locator(".credit-dialog--open");
    await expect(dialog.getByRole("heading", { name: "素材クレジット" })).toBeVisible();

    await dialog.getByRole("button", { name: "閉じる" }).click();
    await expect(page.locator(".credit-dialog--open")).toHaveCount(0);
  });

  test("Escape キーで閉じられること", async ({ page }) => {
    await page.getByRole("button", { name: "3Dモデルのクレジット情報を表示" }).click();
    await expect(page.locator(".credit-dialog--open")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.locator(".credit-dialog--open")).toHaveCount(0);
  });
});

test.describe("VIRTUAL シーン: URL直接アクセス", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/?scene=virtual");
    await waitForScene(page);
  });

  test("VtuberのNav項目（Activities & Works / Guidelines / Links）が表示されること", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Toggle navigation menu" }).click();

    await expect(page.getByRole("button", { name: /Activities & Works/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Guidelines/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Links/ })).toBeVisible();
  });

  test("Guidelines をクリックすると Guidelines パネルが開くこと", async ({ page }) => {
    await page.getByRole("button", { name: "Toggle navigation menu" }).click();
    await page.getByRole("button", { name: /Guidelines/ }).click();

    await expect(page.getByRole("heading", { name: "📜 Guidelines" })).toBeVisible();
  });

  test("Switch to REAL ボタンで REAL シーンに戻れること", async ({ page }) => {
    await page.getByRole("button", { name: "Toggle navigation menu" }).click();
    await page.getByRole("button", { name: /Switch to REAL/ }).click();

    await expect(page.getByRole("tab", { name: /REAL/ })).toHaveAttribute("aria-selected", "true");
  });
});
