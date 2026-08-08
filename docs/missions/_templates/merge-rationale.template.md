---
mission_id: <YYYYMMDD-short-slug>
pack_version: 1
generated_by: <担当者またはエージェント>
generated_at: <ISO-8601-UTC-datetime>
source_commit: <SHA>
reviewer: <人間の担当者>
decision: pending # pending | approved | changes-requested | rejected
non_merge_root_cause: null # property-gap | evidence-missing | tool-gap | scope-drift | other | null
related:
  brief: ./mission-brief.md
  handoff: ./handoff.md
---

<!-- 記入方法は ../_guides/how-to-merge-rationale.md を参照してください． -->

# Merge-Readiness Pack: <ミッションタイトル>

## サマリー

- **行ったこと**: <変更の要点>
- **行わなかったこと**: <非目標または見送ったこと>
- **線引きの理由**: <Brief と判断根拠>
- **レビュー推奨箇所**: <重要な差分へのポインタ>

## Property Coverage

| ID  | Brief のプロパティ | 検証                     | 証拠                         | 状態              |
| --- | ------------------ | ------------------------ | ---------------------------- | ----------------- |
| P1  | <Brief の P1>      | <コマンドまたは確認方法> | <結果または成果物へのリンク> | pass / fail / n-a |
| P2  | <Brief の P2>      | <検証>                   | <証拠>                       | pass / fail / n-a |

## 変更の全体像

- **主要な変更**: <ファイルまたは機能ごとの要約>
- **影響範囲**: <ユーザー，API，状態，互換性への影響>
- **差分**: <commit またはファイルへのポインタ>

## Evidence and Provenance

| 検証       | 結果                  | 実行コマンド                                     | 証拠                         |
| ---------- | --------------------- | ------------------------------------------------ | ---------------------------- |
| lint       | pass / fail / not-run | `npm run lint`                                   | <要約またはログへのポインタ> |
| type check | pass / fail / not-run | `npm run type-check`                             | <要約またはログへのポインタ> |
| build      | pass / fail / not-run | `npm run build`                                  | <要約またはログへのポインタ> |
| tests      | pass / fail / not-run | `npm exec -- vitest run --coverage.enabled=true` | <要約またはログへのポインタ> |

- **対象 commit**: `<SHA>`
- **実行環境**: Node `<version>` / npm `<version>` / `<OS または CI>`
- **生成日時**: `<ISO-8601-UTC-datetime>`
- **not-run の理由**: <なければ none>

## 判断と探索の要約

- <採用した判断，理由，探索記録へのポインタ>

## 承認と逸脱

- **Conceptual Plan 承認**: <承認者 / 日時 / Brief の version>
- **受け入れプロパティ承認**: <承認者 / 日時 / Brief の version>
- **テスト設計承認**: <承認者 / 日時 / Brief の version>
- **CRPack と結果**: <なければ none>
- **Brief からの逸脱**: <なければ none．あれば承認と Brief 反映先>
- **外部操作**: <実行していなければ none．実行した場合は対象，承認，結果>

## 未解決事項とリスク

- <残課題，既知の限界，失敗したプロパティ．なければ none>

## Reviewer Decision

- **decision**: pending
- **コメント**: <構造化された該当項目に紐付けて記録>
