# プロジェクト概要

React Three Fiber (R3F)、React 19、Vite 6、WebGPU を用いた次世代空間UI/UXアプリケーション・実験場（Playground）。

## 技術スタック

- **フレームワーク & ランタイム**: TypeScript, React 19, Vite 6
- **3D & グラフィックス**: Three.js, React Three Fiber (v9), @react-three/drei, @react-three/a11y
- **シェーダー & 次世代レンダリング**: WebGPU / Three Shading Language (TSL)
- **状態管理**: Zustand (`src/store/usePortfolioStore.ts`)
- **テスト & 品質**: Vitest (単体・結合), Playwright (E2E), ESLint, Prettier, oxlint

## 開発コマンド

- `pnpm dev` - 開発サーバー起動
- `pnpm build` - 本番ビルド作成
- `pnpm test` - Vitestテストスイートの実行
- `pnpm lint` - リンティング実行
- `pnpm format` - フォーマッター実行

## コアコーディング規約

### 1. パフォーマンスと描画ループ (`useFrame`)
- **状態更新の禁止**: `useFrame` 内部でのReactの `setState` 呼び出しは厳禁。直接 `ref` を介してオブジェクトを操作（ミューテーション）すること。
- **オブジェクト生成の禁止**: ループ内での `new THREE.Vector3()` などのインスタンス生成を避け、オブジェクトプーリングやループ外での定義を徹底すること。
- **フレームレート非依存**: アニメーションの計算には必ず `delta` を使用すること。

### 2. リソース管理と最適化
- **ドローコール削減**: 同一形状には `InstancedMesh`、多様な形状には `BatchedMesh` を活用する。
- **キャッシュ**: アセットは `useLoader`（`useGLTF`, `useTexture`）を活用してキャッシュ・再利用する。
- **メモリ解放**: 動的に作成したジオメトリ・マテリアル・テクスチャは、アンマウント時に明示的に `.dispose()` すること。

### 3. 安全な実験（Safe Experimentation）
- 実験的な機能や新しいライブラリを試す際は、既存シーンを直接編集せず `src/scene/objects/experiments/` 配下に作成する。
- `src/scene/DevTools.tsx` に機能のON/OFF切り替えスイッチを追加する。

### 4. 状態管理（Zustand）
- 3DシーンとUI（Panel）を跨ぐ状態共有・通信は、必ず `src/store/usePortfolioStore.ts` を経由する。

### 5. TypeScript Strict
- `any` の使用は厳禁。不明な型には `unknown` と型ガードを用いること。
- 型定義は `src/types/` に集約すること。

## ディレクトリ構成

| 種別 | 配置先 |
| --- | --- |
| 3D オブジェクト | `src/scene/objects/` |
| 実験的機能 | `src/scene/objects/experiments/` |
| カスタムフック | `src/hooks/` |
| 状態管理 | `src/store/` |
| 型定義 | `src/types/` |
| 3D モデル (.glb) | `public/models/` |

## 関連ルール・スキル

より詳細なルールや手順は `.agents/` を参照してください：
- ルール: `.agents/rules/` (`r3f-performance.md`, `r3f-security.md`, `typescript-strict.md` など)
- スキル: `.agents/skills/` (`r3f-a11y`, `playwright-e2e`, `spec-driven-development`)
