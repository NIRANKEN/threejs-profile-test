# R3F Accessibility (a11y) Implementation Guide

空間コンピューティング時代のUI/UXにおけるアクセシビリティ（a11y）は、「あると良い機能」ではなく「必須要件」です。React Three Fiber (R3F) における3DオブジェクトのDOM連携方法を定義します。

## 対象となるライブラリ

必ず `@react-three/a11y` を用いて、Canvas内のオブジェクト群を支援技術（スクリーンリーダー、キーボードナビゲーション）向けに公開します。

## 1. キャンバスのラップ

R3Fの `<Canvas>` 内にあるコンポーネントに対してタブ遷移やフォーカスを提供する場合は、以下のようにメインを `<A11yAnnouncer>` と併用して構成します。

```tsx
import { A11y, A11yAnnouncer } from "@react-three/a11y";

export const Scene = () => {
  return (
    <>
      <Canvas>{/* コンテンツ */}</Canvas>
      <A11yAnnouncer />
    </>
  );
};
```

## 2. インタラクティブ要素へのロールの付与

3Dオブジェクトに直接 `onClick` や `onPointerOver` を持たせるのはやめてください。それはマウスでのみ操作可能で、キーボードやスクリーンリーダーの対象から外れます。

### ❌ 避けるべき記述

```tsx
<mesh onClick={() => openModal()} />
```

### ✅ 推奨される記述（A11yでラップする）

```tsx
<A11y
  role="button"
  description="詳細モーダルを開く"
  actionCall={() => openModal()} // クリック・Enterキーでのアクション
  focusCall={() => setFocus(true)} // フォーカスの獲得
>
  <mesh
    onClick={(e) => e.stopPropagation()} // A11yにイベント処理を委譲
    onPointerOver={() => setHover(true)}
    onPointerOut={() => setHover(false)}
  >
    <boxGeometry args={[1, 1, 1]} />
    <meshStandardMaterial color={hover ? "blue" : "gray"} />
  </mesh>
</A11y>
```

## 3. ロールの種類

`@react-three/a11y` で主に利用する役割（Role）について:

- **`role="content"`**: クリックなどの操作が不要な、ただの装飾や情報を提供するオブジェクト用。`alt` 属性に近い働きを持たせる際に `description` と一緒に使用します。
- **`role="button"` / `role="link"`**: ナビゲーションやアクションを引き起こす対象用。必ず `actionCall` と `description` を持たせます。

## 4. フォーカスの視覚的フィードバック

キーボードナビゲーション（Tabキー）を利用するユーザーのために、フォーカスされた際にオブジェクトを拡大する、あるいはアウトラインを描画するといった視覚的な変化を `useA11y` フックなどで取得して付与してください。
