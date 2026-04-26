import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000, // Three.js + GLB ロード時間を考慮
  expect: { timeout: 10_000 },
  fullyParallel: false, // Three.js の初期化を安定させるため逐次実行
  retries: 0,
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
