import { test, expect } from "@playwright/test";
import {
  getCameraPos,
  getCameraRot,
  setActiveSection,
  waitForScene,
  waitForPositionStable,
  waitForTransitionDone,
} from "./helpers";

// 部屋の境界定数（FirstPersonController と同一値）
const ROOM_BOUNDS = { xMin: -2.8, xMax: 2.8, zMin: -2.8, zMax: 2.3 };
const PITCH_MAX = (70 * Math.PI) / 180; // ±1.2217 rad
const INITIAL_POS = { x: 0, y: 1.6, z: 1.5 };

// ─── 各テスト前: ページを開いてシーンが起動するまで待機 ───────────────────
test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  (page as typeof page & { _collectedErrors: string[] })._collectedErrors = errors;

  await page.goto("/");
  await waitForScene(page);
});

// ─── AC-09: コンソールエラーなし（ページ読み込み時）───────────────────────
test("AC-09: ページ読み込み時にコンソールエラーが発生しないこと", async ({ page }) => {
  // waitForScene 完了後に少し待機して遅延エラーも捕捉
  await page.waitForTimeout(1000);
  const errors = (page as typeof page & { _collectedErrors: string[] })._collectedErrors;
  expect(errors).toHaveLength(0);
});

// ─── AC-10: HelpButton の操作説明が更新されていること ─────────────────────
test("AC-10: HelpButton にWASD移動・左ドラッグ視点の説明が表示されること", async ({ page }) => {
  await page.click(".help-btn");
  await expect(page.locator(".help-dialog--open")).toBeVisible();

  // WASD の説明が含まれること
  await expect(page.locator(".help-dialog--open").getByText("部屋の中を移動")).toBeVisible();

  // 左ドラッグの説明が含まれること
  await expect(page.locator(".help-dialog--open").getByText("左ドラッグ")).toBeVisible();
});

// ─── AC-01: WASDキーで移動できること ─────────────────────────────────────
test("AC-01: Wキー押下でカメラが前進すること（Z座標が減少）", async ({ page }) => {
  const canvas = page.locator("canvas");
  await canvas.click(); // canvas にフォーカス

  const before = await getCameraPos(page);

  // W を 600ms 押し続ける
  await page.keyboard.down("w");
  await page.waitForTimeout(600);
  await page.keyboard.up("w");
  await page.waitForTimeout(100);

  const after = await getCameraPos(page);

  // 前進 = Z が減少（-Z 方向へ移動）
  expect(after.z).toBeLessThan(before.z);
  // Y は固定
  expect(after.y).toBeCloseTo(1.6, 1);
});

test("AC-01: Sキー押下でカメラが後退すること（Z座標が増加）", async ({ page }) => {
  const canvas = page.locator("canvas");
  await canvas.click();

  const before = await getCameraPos(page);

  await page.keyboard.down("s");
  await page.waitForTimeout(600);
  await page.keyboard.up("s");
  await page.waitForTimeout(100);

  const after = await getCameraPos(page);
  expect(after.z).toBeGreaterThan(before.z);
});

// ─── AC-02: 左ドラッグで視点が変化すること ──────────────────────────────
test("AC-02: 左ドラッグ右方向でYaw（水平回転）が変化すること", async ({ page }) => {
  const canvas = page.locator("canvas");
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Canvas not found");

  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;

  const before = await getCameraRot(page);

  // 左ドラッグ: 右へ 200px
  await page.mouse.move(cx, cy);
  await page.mouse.down({ button: "left" });
  await page.mouse.move(cx + 200, cy, { steps: 20 });
  await page.mouse.up({ button: "left" });
  await page.waitForTimeout(100);

  const after = await getCameraRot(page);
  // 右ドラッグ → yaw が減少方向
  expect(after.yaw).not.toBeCloseTo(before.yaw, 1);
});

test("AC-02: 左ドラッグ下方向でPitch（縦回転）が変化すること", async ({ page }) => {
  const canvas = page.locator("canvas");
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Canvas not found");

  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;

  const before = await getCameraRot(page);

  // 左ドラッグ: 下へ 150px
  await page.mouse.move(cx, cy);
  await page.mouse.down({ button: "left" });
  await page.mouse.move(cx, cy + 150, { steps: 15 });
  await page.mouse.up({ button: "left" });
  await page.waitForTimeout(100);

  const after = await getCameraRot(page);
  expect(after.pitch).not.toBeCloseTo(before.pitch, 1);
});

// ─── AC-03: 壁の外に出ないこと ──────────────────────────────────────────
test("AC-03: W を長押ししても Z が部屋の境界 zMin 以下にならないこと", async ({ page }) => {
  const canvas = page.locator("canvas");
  await canvas.click();

  // W を長押しして奥の壁方向へ突進
  await page.keyboard.down("w");
  await page.waitForTimeout(3000);
  await page.keyboard.up("w");
  await page.waitForTimeout(200);

  const pos = await getCameraPos(page);
  expect(pos.z).toBeGreaterThanOrEqual(ROOM_BOUNDS.zMin);
  expect(pos.z).toBeLessThanOrEqual(ROOM_BOUNDS.zMax);
  expect(pos.x).toBeGreaterThanOrEqual(ROOM_BOUNDS.xMin);
  expect(pos.x).toBeLessThanOrEqual(ROOM_BOUNDS.xMax);
});

// ─── AC-04: Pitch が ±70° を超えないこと ──────────────────────────────
test("AC-04: 大きな上方向ドラッグでも Pitch が +70° を超えないこと", async ({ page }) => {
  const canvas = page.locator("canvas");
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Canvas not found");

  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;

  // 大きく上方向ドラッグ (画面高さ分を超える量)
  await page.mouse.move(cx, cy);
  await page.mouse.down({ button: "left" });
  await page.mouse.move(cx, cy - box.height * 2, { steps: 40 });
  await page.mouse.up({ button: "left" });
  await page.waitForTimeout(100);

  const rot = await getCameraRot(page);
  expect(rot.pitch).toBeLessThanOrEqual(PITCH_MAX + 0.01); // 1° 以内の許容誤差
});

test("AC-04: 大きな下方向ドラッグでも Pitch が -70° を下回らないこと", async ({ page }) => {
  const canvas = page.locator("canvas");
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Canvas not found");

  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;

  await page.mouse.move(cx, cy);
  await page.mouse.down({ button: "left" });
  await page.mouse.move(cx, cy + box.height * 2, { steps: 40 });
  await page.mouse.up({ button: "left" });
  await page.waitForTimeout(100);

  const rot = await getCameraRot(page);
  expect(rot.pitch).toBeGreaterThanOrEqual(-PITCH_MAX - 0.01);
});

// ─── AC-07: ESC でパネルを閉じられること ─────────────────────────────────
test("AC-07: ESC キーでパネルが閉じられること", async ({ page }) => {
  // Zustand ストア経由でパネルを開く（Dev モード限定）
  await setActiveSection(page, "profile");

  // パネルが表示されるまで待機
  await expect(page.locator(".panel-overlay--visible")).toBeVisible({ timeout: 5_000 });

  // セクション遷移アニメーション完了を待つ（isTransitioning 中は ESC が無効）
  await waitForTransitionDone(page);

  // ESC を押す
  await page.keyboard.press("Escape");

  // パネルが閉じること
  await expect(page.locator(".panel-overlay--visible")).not.toBeVisible({ timeout: 5_000 });
});

// ─── AC-08: リセットボタンで初期位置に戻ること ───────────────────────────
test("AC-08: リセットボタンで初期位置・向きに戻ること", async ({ page }) => {
  const canvas = page.locator("canvas");
  await canvas.click();

  // W を押して初期位置から離れる
  await page.keyboard.down("w");
  await page.waitForTimeout(800);
  await page.keyboard.up("w");
  await page.waitForTimeout(100);

  const movedPos = await getCameraPos(page);
  expect(movedPos.z).toBeLessThan(INITIAL_POS.z); // 確かに移動したこと

  // リセットボタンをクリック
  await page.click(".reset-btn");

  // アニメーション遷移の完了を待つ
  await waitForPositionStable(page);

  const resetPos = await getCameraPos(page);
  expect(resetPos.x).toBeCloseTo(INITIAL_POS.x, 0);
  expect(resetPos.y).toBeCloseTo(INITIAL_POS.y, 0);
  expect(resetPos.z).toBeCloseTo(INITIAL_POS.z, 0);

  const resetRot = await getCameraRot(page);
  expect(resetRot.yaw).toBeCloseTo(0, 1);
  expect(resetRot.pitch).toBeCloseTo(0, 1);
});
