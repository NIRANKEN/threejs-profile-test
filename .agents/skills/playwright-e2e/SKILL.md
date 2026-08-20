---
name: playwright-e2e
description: >-
  Implement robust E2E tests using Playwright for 3D web applications and UI overlays.
  Use when creating or updating end-to-end tests or verifying user interactions.
---

# Playwright E2E Skill & Best Practices

Playwright を用いた堅牢なE2Eテストの実装ガイドラインです。

## 1. セマンティックなロケータの利用

CSSクラスやXPathによる指定は避け、ユーザー視点のロケータ（`getByRole()`, `getByText()`, `getByLabel()`）を使用します。

```typescript
// ❌ 悪い例（実装依存による脆いテスト）
await page.locator(".btn-primary.r3f-overlay-btn").click();

// ✅ 良い例（アクセシブルな検索）
await page.getByRole("button", { name: "プロジェクトを削除" }).click();
```

## 2. 適切なWait（待機）戦略

- 固定時間の `page.waitForTimeout()` は使用せず、Playwrightの自動待機（Auto-waiting）と暗黙アサーションを活用します。

```typescript
// ✅ 良い例: 要素が表示され操作可能になるまで自動待機
await expect(page.getByRole("heading", { name: "完了" })).toBeVisible();
```

- APIレスポンス等の非同期状態を待つ場合は、ネットワークのインターセプトを用いて待機します。

```typescript
const responsePromise = page.waitForResponse("**/api/v1/data");
await page.getByRole("button", { name: "データ取得" }).click();
await responsePromise;
```

## 3. テストの作成単位

各テストケースは独立・並列実行可能な単位に分割し、初期状態の準備は `test.beforeEach` を利用します。
