---
mission_id: <YYYYMMDD-short-slug>
handoff_version: 1
from: <引き継ぐ担当>
to: <次の担当または next>
created_at: <ISO-8601-UTC-datetime>
brief_ref: ./mission-brief.md
brief_version: <Brief の brief_version>
source_commit: <SHA>
---

<!-- 記入方法は ../_guides/how-to-handoff.md を参照してください． -->

# Handoff / Continuity Pack: <ミッションタイトル>

## Current State

- **完了**: <終了したこと>
- **進行中**: <途中のことと作業ツリーの状態>
- **次の一手**: <再開後に最初に行う具体的な操作>

## 有効な決定と根拠

| 決定           | 根拠             | Brief 反映    |
| -------------- | ---------------- | ------------- |
| <確定した決定> | <なぜ採用したか> | yes / pending |

## 最小再開コンテキスト

| 強度   | ポインタ                       | 必要な理由     | 出所 / 最終確認日               |
| ------ | ------------------------------ | -------------- | ------------------------------- |
| must   | `mission-brief.md`             | 契約と承認状態 | Brief v<version> / <YYYY-MM-DD> |
| should | `docs/context-cards/<card>.md` | <用途>         | <元ソース> / <YYYY-MM-DD>       |

## 未解決事項と上申

- **blocker**: <なければ none>
- **承認待ち CRPack**: <なければ none．あれば決定事項と提示場所>
- **未回答の問い**: <なければ none>

## 検証状態

| コマンド / 確認  | 結果                  | 実行日時                | 証拠                         |
| ---------------- | --------------------- | ----------------------- | ---------------------------- |
| <実行済みの確認> | pass / fail / not-run | <ISO-8601-UTC-datetime> | <ログまたは要約へのポインタ> |

## 探索へのポインタ

- <隔離した探索の場所，結論，Brief への反映有無．なければ none>

## 再開手順

1. `mission-brief.md` でスコープ，プロパティ，承認状態を確認します．
2. この Pack の Current State と有効な決定を確認します．
3. 指定されたコンテキストだけを読み，次の一手から再開します．
