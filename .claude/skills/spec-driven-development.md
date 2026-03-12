# SDD (Spec-Driven Development) ガイド・実行スキル

AIコーディングエージェント時代の開発パラダイムである **Spec-Driven Development (SDD)** のワークフローガイドです。「場当たり的（バイブコーディング）」な開発を防ぎ、仕様書を唯一の信頼源として維持します。

## 1. ワークフロー概要

```
[要件（アイデア）]
       │
      /specifyコマンド
       ▼
 [spec.md（仕様書）]
       │
      /planコマンド
       ▼
 [plan.md（実装計画）]
       │
      /tasksコマンド
       ▼
 [tasks.md（タスクリスト）]
       │
     順次または並列実装
```

## 2. 実践方針

### 常に「設計図と指示書」を明確にする
AIエージェントに機能開発を指示する際、直接コード変更を要求するのではなく、必ず `spec.md` を起点としてください。広範なコンテキスト（ファイル全体のコード）よりも、厳密に定義された Markdown 仕様書の方が、AIエージェントは正確に動作します。

### 「少ないほど良い」の法則とプログレッシブ・ディスクロージャ
`CLAUDE.md` や単一ファイルにすべてを詰め込むと、一貫性（Instruction Following Quality）が均一に低下します。
- プロジェクト全域に関わるルールのみをベースに置き、モジュール固有の技術制約・仕様情報などは `spec.md` へ分離させて段階的（プログレッシブ）に読み込ませてください。

## 3. 並列マルチエージェントの実践
Git Worktrees を使用して、機能や領域に特化した各AIエージェントに並列でタスクを任せる手順を推奨します：

```bash
# 準備: ブランチごとにワークツリーを切る
git worktree add ../agent-feature-backend -b feature/backend-api
git worktree add ../agent-feature-frontend -b feature/frontend-ui

# 実行: ディレクトリごとに独立したセッションでエージェントを稼働させる
cd ../agent-feature-backend && [AI開発ツール実行]
cd ../agent-feature-frontend && [AI開発ツール実行]
```
このアプローチにより、リアルタイムのファイル干渉を排除しつつクリーンな変更可視化が行えます。
