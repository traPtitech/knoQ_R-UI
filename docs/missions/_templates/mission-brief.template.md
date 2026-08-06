---
mission_id: <YYYYMMDD-short-slug>
branch: mission/<YYYYMMDD-short-slug>
status: draft # draft | active | blocked | closed
owner: <人間の担当者>
assignee: <エージェントまたは担当者>
created: <YYYY-MM-DD>
last_updated: <YYYY-MM-DD>
brief_version: 1
github_issue: null
issue_status: not-applicable # not-applicable | draft | approved-created
approvals:
  conceptual_plan: pending # pending | approved | changes-requested
  acceptance_properties: pending # pending | approved | changes-requested
  test_design: pending # pending | approved | changes-requested
related:
  handoff: ./handoff.md
  merge_rationale: ./merge-rationale.md
---

<!-- 記入方法は ../_guides/how-to-mission-brief.md を参照してください． -->

# Mission Brief: <ミッションの一文タイトル>

## Intent

- **動機**: <なぜ必要か>
- **目的**: <達成を検証できる形で記述>
- **スコープ内**: <扱う成果と境界>
- **非目標**: <意図的に扱わないこと>
- **制約**:
  - must: <必ず守る条件>
  - should: <可能なら守る条件>

## Conceptual Plan

- **候補と比較**: <検討した方針と主なトレードオフ>
- **合意するアプローチ**: <細かな手順ではなく大まかな道筋>
- **チェックポイント**: <人間が結果を確認する節目>
- **スローモート・トリガー**: <停止して相談する条件>
- **承認**: pending
- **承認者 / 日時 / 根拠**: <承認後に記録>

## Property-controlled Acceptance

| ID  | プロパティまたは不変量 |
| --- | ---------------------- |
| P1  | <常に成り立つべき性質> |
| P2  | <性質>                 |

- **プロパティ承認**: pending
- **承認者 / 日時 / 根拠**: <承認後に記録>

### Test Design Consultation

| ID  | テスト方法             | 失敗経路 / 回帰境界    | 期待する機械可読な証拠     |
| --- | ---------------------- | ---------------------- | -------------------------- |
| P1  | <焦点を絞った検証方法> | <境界値，失敗時，回帰> | <ログ，レポート，差分など> |
| P2  | <テストまたは確認方法> | <境界>                 | <証拠>                     |

- **テスト設計承認**: pending
- **承認者 / 日時 / 根拠**: <Conceptual Plan とプロパティの承認後に，別 CRPack の結果を記録>

## Autonomy Envelope

### may_decide

- <承認済みの計画とスコープ内で自律的に決めてよいこと>

### must_consult

- Conceptual Plan または受け入れプロパティを確定，変更するとき
- プロパティとテスト方法，失敗境界，期待する証拠の対応を確定，変更するとき
- Brief で承認済みの範囲を越えて，スコープ，制約，公開 API，ユーザー向け挙動を変更するとき
- Issue 作成，コメント，push，PR，デプロイなど外部へ影響する操作を行うとき
- <ミッション固有の上申事項と上申先>

### prohibited

- <このミッションでは実行しないこと>

上申は [共通 CRPack 形式](../README.md#承認とエスカレーション) で提示し，明示的な承認を記録してから進めます．

## Context Pointers

| 強度   | ソース                                          | 読む条件 / 用途  | 最終確認日   |
| ------ | ----------------------------------------------- | ---------------- | ------------ |
| must   | `AGENTS.md`，`CLAUDE.md`，`docs/conventions.md` | 着手前           | <YYYY-MM-DD> |
| should | `docs/context-cards/<card>.md`                  | <必要になる条件> | <YYYY-MM-DD> |

- **調査事項**: <着手後に確認する未知>

## Current State

- **完了**: <完了事項>
- **進行中**: <現在の作業>
- **次の一手**: <次に行うこと>
- 詳細は `handoff.md` を参照します．

## Changelog

| version | date         | 変更内容 | 理由 / 承認 |
| ------- | ------------ | -------- | ----------- |
| 1       | <YYYY-MM-DD> | 初版     | <起票理由>  |
