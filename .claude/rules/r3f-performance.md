# R3F Performance Rule

React Three Fiber のパフォーマンス低下を防ぐため、以下のルールを厳守すること。

## 禁止事項

1. **`useFrame` 内での `useState` 更新は禁止。**
   - `useFrame` は毎フレーム呼ばれるため、state 更新はレンダリングの連鎖を引き起こし深刻なパフォーマンス低下を招く。
   - 代わりに `ref` を使って値を直接変更すること。

2. **毎フレームの `Vector3` / `Euler` 等の Math オブジェクト生成は禁止。**
   - `new Vector3()` などをフレームごとに呼ぶのは GC の原因になる。
   - コンポーネントのトップレベルや `useMemo` で生成し、Object Pooling を使って再利用すること。

3. **`delta` を使用してFPSに依存しないアニメーションを実装すること。**
   - `useFrame((state, delta) => { ... })` の `delta` を使い、フレームレートに関わらず一定速度で動くアニメーションにすること。

## 推奨パターン

```tsx
// NG: 毎フレーム生成
useFrame((_, delta) => {
  meshRef.current.position.add(new Vector3(1, 0, 0)); // NG
  setPosition(pos + delta); // NG: useState 更新
});

// OK: Object Pooling + ref 使用
const velocity = useMemo(() => new Vector3(), []);
useFrame((_, delta) => {
  velocity.set(delta, 0, 0);
  meshRef.current.position.add(velocity); // OK
});
```
