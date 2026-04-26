# Code Style Rule

## 命名規則

| 対象           | 規則         | 例                             |
| -------------- | ------------ | ------------------------------ |
| 変数・関数     | `camelCase`  | `activeSection`, `handleClick` |
| コンポーネント | `PascalCase` | `ProfilePanel`, `RoomModel`    |

## TypeScript

- **`any` 型の使用は禁止。** 厳密な型定義を行うこと。
- 型定義ファイルは `src/types/` に配置すること。

## ディレクトリ構成

| 種別             | 配置先                           |
| ---------------- | -------------------------------- |
| 3D オブジェクト  | `src/scene/objects/`             |
| 実験的機能       | `src/scene/objects/experiments/` |
| カスタムフック   | `src/hooks/`                     |
| 状態管理         | `src/store/`                     |
| 型定義           | `src/types/`                     |
| 3D モデル (.glb) | `public/models/`                 |
