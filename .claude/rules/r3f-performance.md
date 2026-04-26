# R3F Performance Core Rules

React Three Fiber (R3F) と React 19 において、アプリケーションのパフォーマンスを最適化し、GPU/CPUの無駄な消費を防ぐための基本原則です。

## 1. フレームループ内の禁止事項

毎秒60回以上実行される `useFrame` や `useEffect` (連続発火するもの) 内で、以下の操作を絶対に行わないでください。

```typescript
// ❌ 状態の更新（Reconciliationの原因）
useFrame(() => {
  setRotation((prev) => prev + 0.01);
});

// ❌ 参照型の再生成（GCのスパイク・DoSの原因）
useFrame(() => {
  const target = new THREE.Vector3(); // 毎フレーム作成してはいけない
  mesh.position.lerp(target, 0.1);
});
```

### ✅ 正しいアプローチ（ミューテーション）

```typescript
const target = new THREE.Vector3(); // ループ外でインスタンスを作成

useFrame((state, delta) => {
  // refを介して直接ミューテーションを行う
  if (mesh.current) {
    mesh.current.rotation.y += delta;
  }
});
```

## 2. オブジェクトとマテリアルのキャッシング

不要なGPUへのアップロードやメモリの圧迫を防ぐため、Geometry と Material は可能な限り再利用します。
特にインラインでの定義はReactによって毎回破棄・再生成されるため避けてください。

```typescript
// ❌ リレンダリングごとに破棄・構築される
<mesh>
  <boxGeometry />
  <meshStandardMaterial color="blue" />
</mesh>

// ✅ useMemoによるキャッシング、またはファイル上部での使い回し
const boxGeo = useMemo(() => new THREE.BoxGeometry(), []);
const blueMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "blue" }), []);
//
<mesh geometry={boxGeo} material={blueMat} />
```

## 3. ドローコールの削減

同じオブジェクト（木、岩、敵など）を複数描画する場合は、常に `InstancedMesh` または `BatchedMesh` の使用を検討してください。`mesh`を`map`関数で大量にループさせることは深刻なパフォーマンス低下を招きます。

## 4. イベント駆動のレンダリング

シーン内のアニメーションが必要ない場合は、`<Canvas frameloop="demand">` を設定し、`invalidate()` でのみ再描画を行うようにして電力とリソース消費を徹底的に削減します。
