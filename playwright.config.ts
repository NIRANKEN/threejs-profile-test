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
    // CIはPlaywrightが毎回ダウンロードする最新のChrome for Testingビルドではなく、
    // Ubuntuランナーに公式リポジトリからインストールされる安定版Chromeを使う。
    // 特定のChrome for Testingビルドで、下方向ドラッグ中にSwiftShaderの描画が
    // ハングする再現性のある問題が確認されたため（ローカルの旧Chromiumでは非再現）
    ...(process.env.CI ? { channel: "chrome" as const } : {}),
    // headless Chromium で WebGL/Three.js を動作させるためのフラグ。
    // "--use-angle=gl" は実GPUが無いLinux CIだとMesaの低速なソフトウェアGL
    // (llvmpipe) にフォールバックし、連続したポインタ移動を伴うテストが
    // ハングしたためSwiftShaderを明示指定する（全環境で高速・安定動作）
    launchOptions: {
      args: [
        "--use-gl=angle",
        "--use-angle=swiftshader-webgl",
        "--enable-unsafe-swiftshader",
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
