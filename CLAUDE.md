## プロジェクト概要
React Three Fiber (R3F) と React 19, Vite 6, WebGPU を用いた次世代空間UI/UXアプリケーション。

## 技術スタック
- TypeScript, React 19, Vite 6
- Three.js, React Three Fiber (v9)
- @react-three/drei, @react-three/a11y
- Vitest (単体・統合テスト)
- ESLint + Prettier (@react-three/eslint-plugin)
- WebGPU / Three Shading Language (TSL)

## コマンド
- `pnpm dev` - 開発サーバー起動
- `pnpm build` - 本番ビルド作成
- `pnpm test` - Vitestスイートの実行
- `pnpm lint` - ESLintによる静的解析とリンティング
- `pnpm format` - Prettierによるコードフォーマット

## コーディング規約
- **パフォーマンスと描画ループ**:
  - `useFrame` 内部でのReactの `setState` 呼び出しは厳禁。直接 `ref` を介してオブジェクトを操作し（ミューテーション）、再レンダリングを防ぐこと。
  - レンダリングループ内での新規オブジェクト生成（`new THREE.Vector3()`など）を避け、ガベージコレクションによるカクツキを防ぐ。
- **リソース最適化**:
  - ドローコールを抑えるため、同一形状には `InstancedMesh`、多様な形状には `BatchedMesh` を活用する。
  - アセットは `useLoader`（`useGLTF`, `useTexture`）を活用してキャッシュ・再利用する。
- **アクセシビリティ (a11y)**:
  - `@react-three/a11y` を用いて、空間内のインタラクティブなオブジェクトに適切な役割（`role`）と説明（`description`）を付与すること。

## セキュリティ
- Vite 6環境において、DNSリバインディング攻撃を防ぐために開発サーバーの `server.allowedHosts` 設定に注意すること。
- 不要になった Three.js リソース（Geometry, Material 等）のクリーンアップ（`.dispose()`）を確実に行うこと。
- シェーダー記述に動的な文字列を含めず、必ず `Uniforms` を使うこと。

## ワークフロー (Spec-Driven Development)
プロジェクトの開発は、AI駆動の仕様先導型開発（SDD）に則って進行します。以下のコマンドを起点に機能開発を進めてください：
- `/specify`: 要件のヒアリングから `spec.md` を生成します。
- `/plan`: `spec.md` に基づき、実装計画 `plan.md` またはアーキテクチャ設計を策定します。
- `/tasks`: 計画から実行可能なチケット（`tasks.md`）へ分解します。
※ 詳細は `.claude/skills/spec-driven-development.md` を参照してください。

## エージェントアーキテクチャ
特定ドメインの改善や問題解決については、`.claude/agents/` 内の各エージェントを参照してタスクを依頼できます。
### 汎用・プロセス管理
- `Architect` (`.claude/agents/architect.md`): 全体アーキテクチャ設計・マルチエージェント指揮を担当。
- `Testing` (`.claude/agents/testing.md`): Vitest/Playwrightを用いた自動化テストのTDD担保を担当。
### 専門領域特化
- `Palette` (`.claude/agents/palette.md`): 空間UI/UXのマイクロインタラクション改善、a11y向上
- `Sentinel` (`.claude/agents/sentinel.md`): 脆弱性検出、メモリリーク防御、パフォーマンスセーフティ担保
- `Bolt` (`.claude/agents/bolt.md`): FPS向上、ドローコール削減、メモリ最適化などの極限パフォーマンス改善

## 共通ルールとスキル（Rules & Skills）
開発・実装タスクを実行する際は、`.claude/rules/` および `.claude/skills/` を読み込みコンテキストを補完してください。
- **TypeScript**: `typescript-strict.md`（型の超厳格化とanyの禁止）
- **テスト駆動**: `tdd-workflow.md`, `playwright-e2e.md`
- **R3F固有**: `r3f-performance.md`（FPSと描画最適化）, `r3f-security.md`（リークと攻撃防止）, `r3f-a11y-guide.md`（空間アクセシビリティ）
