# State Management Rule

このプロジェクトでは Zustand を状態管理ライブラリとして使用する。

## ルール

**3D シーンと UI（Panel）を跨ぐ状態は、必ず `src/store/usePortfolioStore.ts` で管理すること。**

- Three.js オブジェクト内からパネルの表示状態を変更する場合
- UI 操作によってカメラ位置やシーン状態を変更する場合

上記のようなシーン ↔ UI 間の通信はすべて `usePortfolioStore` を経由すること。

## ファイル構成

| 用途 | ファイル |
|---|---|
| シーン ↔ UI 共有状態 | `src/store/usePortfolioStore.ts` |

## NG パターン

```tsx
// NG: コンポーネントローカルの state でシーンと UI を繋ごうとする
const [isOpen, setIsOpen] = useState(false); // 3D コンポーネント内
```

## OK パターン

```tsx
// OK: Zustand ストアを使ってシーンと UI で状態を共有する
const { activeSection, setActiveSection } = usePortfolioStore();
```
