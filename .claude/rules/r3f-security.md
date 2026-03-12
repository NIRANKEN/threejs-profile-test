# R3F Security & Safety Rules

React Three Fiber と Vite 6、React 19 に基づく3Dアプリケーションにおけるセキュリティと安全性の確保について。

## 1. アセットとリソースの保護（ホスト検証）
### `vite.config.ts` での `allowedHosts: true` は厳禁
ローカル環境から外部への意図しない公開や、DNSリバインディング攻撃を防ぐため、以下の設定を維持してください。
```typescript
{
  server: {
    // ❌ allowedHosts: true // 절대금지
    allowedHosts: ['localhost', '.internal.example.com'],
  }
}
```
また、環境変数においても `.env` 内の機密情報は `VITE_` プレフィックスを付けることでクライアントに露出します。APIキーなどの本番用シークレットは `VITE_` 接頭辞を用いずにバックエンドや別のセキュアなパイプラインで処理してください。

## 2. メモリとGCリークの防止
Reactの強みはアンマウント処理ですが、Three.js のリソースはReactが直接ガベージコレクションできません。
```typescript
// ✅ 破棄（dispose）は必須
useEffect(() => {
  return () => {
    meshRef.current?.geometry.dispose();
    meshRef.current?.material.dispose();
  };
}, []);
```
**注意**: R3Fは自動で `.dispose()` を呼び出す機能（基本コンポーネントのみ）を備えていますが、カスタムマテリアルやテクスチャ・バッファジオメトリを動的に作成する場合は、安全のために明示的な破棄ロジックを担保してください。

## 3. シェーダーインジェクションの防止
`ShaderMaterial` や `RawShaderMaterial` 、およびカスタム `gl_FragColor` 実装において、JavaScript経由でユーザー入力や変数を直接文字列結合してはいけません。
```typescript
// ❌ 脆弱なシェーダー記述
const shader = `void main() { gl_FragColor = vec4(${userInputColor}, 1.0); }`;

// ✅ Uniformsを介したセキュアな値渡し
const uniforms = {
  uColor: { value: new THREE.Color(userInputColor) }
};
const shader = `
uniform vec3 uColor;
void main() {
  gl_FragColor = vec4(uColor, 1.0);
}
`;
```

## 4. なぜ数学的バリデーションが必要か？
`NaN` や `Infinity` を `mesh.position` などの行列計算に渡すと、WebKitやV8エンジンレベルでのクラッシュ（レンダリングループ崩壊）が発生します。外部データを3D数学（`THREE.Vector3` など）に入力する際は、必ず `!isNaN()` などで事前チェックを行ってください。
