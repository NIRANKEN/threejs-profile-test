import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  // CI (GitHub Actions ubuntu-latest) はソフトウェアレンダリングでローカルより低速なため、
  // マウスドラッグ操作を伴うテストがタイムアウトすることがある。CIのみ余裕を持たせる
  timeout: process.env.CI ? 90_000 : 60_000, // Three.js + GLB ロード時間を考慮
  expect: { timeout: 10_000 },
  fullyParallel: false, // Three.js の初期化を安定させるため逐次実行
  retries: process.env.CI ? 1 : 0, // CI環境のレンダリング速度のばらつきを吸収する
  reporter: "line",

  use: {
    baseURL: "http://localhost:5173",
    // headless Chromium で WebGL/Three.js を動作させるためのフラグ
    launchOptions: {
      args: [
        "--use-angle=gl", // macOS: ANGLE GL バックエンドを使用
        "--enable-webgl",
        "--ignore-gpu-blocklist", // GPU ブロックリストを無視してハードウェア描画を強制
        "--disable-gpu-sandbox",
      ],
    },
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // pnpm dev を自動起動（dev モードで DevHud / window.__portfolioStore が有効）
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
