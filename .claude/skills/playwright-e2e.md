# Playwright E2E Skill & Best Practices

Playwright を用いた堅牢なE2Eテストの実装ガイドラインです。最新のAIエージェントによる自己修復や構造化されたテストの生成に対応するため、以下の原則を守ります。

## 1. 脆いロケータ（CSS/XPath）の禁止
CSSクラスやXPathを用いた要素の特定は、UIの微細な変更でテストが壊れる原因になります。

- **必須**: ユーザー視点でのセマンティックなロケータ（`getByRole()`, `getByText()`, `getByLabel()`, `getByPlaceholder()`）を使用してください。
- 3D（Canvas）のテストの場合は、Canvasを覆うオーバーレイ要素やDOMとしてバインディングされた領域（`@react-three/a11y`を利用した `<button>` など）に対してアプローチします。

```typescript
// ❌ 悪い例（実装依存による脆いテスト）
await page.locator('.btn-primary.r3f-overlay-btn').click();

// ✅ 良い例（ユーザー視点でのアクセシブルな検索）
await page.getByRole('button', { name: 'プロジェクトを削除' }).click();
```

## 2. 適切なWait（待機）戦略
- 固定時間による `page.waitForTimeout(3000)` などは絶対に使用してはなりません。テストの実行遅延と不安定（Flaky）さを引き起こします。
- Playwrightの暗黙のアサーション・自動待機機能（Auto-waiting）を活用します。

```typescript
// ✅ 良い例: 要素が表示され操作可能になるまで自動待機する
await expect(page.getByRole('heading', { name: '完了' })).toBeVisible();
```

- APIレスポンス等の非同期状態を待つ場合は、ネットワークのインターセプトを用いて、確実に通信が完了したことを条件とします。

```typescript
// APIのレスポンスを待機する
const responsePromise = page.waitForResponse('**/api/v1/data');
await page.getByRole('button', { name: 'データ取得' }).click();
await responsePromise;
```

## 3. テストの作成単位
1つの `test()` ブロックに複数の検証シナリオを詰め込まず、独立・並列実行可能な単位でテストケースを分割してください。状態の準備が必要な場合は `test.beforeEach` を利用して初期化状態を明記します。
