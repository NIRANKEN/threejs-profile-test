---
name: spec-driven-development
description: >-
  Guide and workflows for Spec-Driven Development (SDD), specifying specs, plans, and task breakdowns before implementation.
  Use when designing new features or planning multi-step implementations.
---

# Spec-Driven Development (SDD) Guide

AIコーディングエージェントとの協調開発において、仕様書を唯一の信頼源（Single Source of Truth）として品質を担保するワークフローです。

## 1. ワークフロー概要

```text
[要件（アイデア）]
       │
      要件定義
       ▼
 [spec.md（仕様書）]
       │
      設計・計画
       ▼
 [implementation_plan.md（実装計画）]
       │
      タスク分解
       ▼
 [tasks.md（タスクリスト）]
       │
    順次実装 & 検証
```

## 2. 実践方針

### 設計図と仕様の明確化

コード変更を直接開始する前に、必ず仕様書や実装計画を作成して整合性を確認します。
広範なコンテキストよりも、厳密に定義された Markdown 仕様書の方が正確に機能します。

### プログレッシブ・ディスクロージャ（段階的開示）

プロジェクト全域に関わる最小限の共通ルールのみを `AGENTS.md` に置き、ドメイン固有・機能固有の制約は個別ルールファイルや仕様書に分離して管理します。
