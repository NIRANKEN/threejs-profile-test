# TypeScript Strict ルール

AIエージェントの理解力・コーディング成功率を最大化（約60%から100%付近へ底上げ）するため、本プロジェクトではTypeScriptの極めて厳密な型定義を徹底します。

## 1. `any`の完全排除

`any` 型は、TypeScriptの恩恵だけでなくAIエージェントの推論コンテキストをも破壊します。

- **禁止**: いかなる理由があろうとも明示的な `any` の使用、および暗黙的な `any` となるコードを記述してはなりません。
- 代替: APIレスポンスや外部からの一時的な不明データには `unknown` を使用してください。

## 2. `unknown` と型ガードの徹底

`unknown` 型の変数を操作する場合、必ず事前に「型ガード（Type Guards）」または Zod などのスキーマ検証を用いて、安全に型を絞り込んでください。

```typescript
// ❌ 悪い例（any使用による型の放棄）
const processData = (data: any) => {
  console.log(data.id);
};

// ✅ 良い例（unknown + 型ガード）
const processData = (data: unknown) => {
  if (typeof data === "object" && data !== null && "id" in data) {
    console.log((data as { id: string }).id);
  }
};
```

## 3. 明示的な型宣言と Generics の活用

- 関数の引数と戻り値には、必ず明示的な型を定義してください（推論に任せきりにしない）。
- 複雑なデータ構造や再利用性の高いコンポーネント（特にR3Fの `useFrame` の `state` 型パラメータや イベントハンドラ）においては、Genericsを積極的に活用してください。

## 4. インターフェースの統一

`type` または `interface` のいずれかに統一し、プロジェクトの規約に沿った定義を行ってください。また、他エージェントが参照しやすいよう、共有の型定義は `packages/types/` や `src/types/` 配下の独立ファイルに集約・Exportします。
