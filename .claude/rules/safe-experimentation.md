# Safe Experimentation Rule

新しいライブラリや機能を試す際は、**既存のシーンを直接編集しない**。必ず実験用ディレクトリを使用すること。

## 実験的機能の追加手順

1. `src/scene/objects/experiments/[FeatureName].tsx` に新しいコンポーネントとして作成する。
2. `src/scene/DevTools.tsx` にその機能の ON/OFF を切り替えるスイッチを追加する。
3. `npm run type-check` を実行してエラーがないことを確認する。

## 対象パターン

`src/scene/objects/experiments/**`
