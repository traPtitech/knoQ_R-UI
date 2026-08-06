# Mission Brief の書き方

テンプレートは [mission-brief.template.md](../_templates/mission-brief.template.md) です．共通運用は [Missions README](../README.md) を参照してください．

Mission Brief は，エージェントに細かな手順を与える文書ではなく，目的，終了条件，判断の境界を合意する **自律性の契約** です．ミッション中の決定はチャットだけに残さず，Brief に集約します．

## 作成順序

1. `YYYYMMDD-short-slug` の mission ID と `mission/<mission-id>` ブランチを決めます．
2. Intent に動機，テスト可能な目的，スコープ，非目標，制約を書きます．
3. Conceptual Plan には比較した方針，大まかな道筋，確認点，停止条件だけを書きます．
4. 受け入れ条件をプロパティまたは不変量で書き，各項目を検証方法と証拠に結び付けます．
5. Autonomy Envelope で `may_decide`，`must_consult`，`prohibited` を具体化します．
6. 人間が Conceptual Plan と受け入れプロパティを承認し，承認者，日時，根拠を記録した後に `status: active` として実装を始めます．

## セクションの判断基準

### Intent

目的は完了判定できる文にします．「適切に表示する」ではなく，対象となる状態と守る性質を記述します．非目標は必須です．制約は `must` と `should` を分け，後から圧縮しても強度が残るようにします．

### Conceptual Plan

実装ステップではなく，アプローチの選択を承認対象にします．新しい共有抽象，API 契約変更，大きな依存追加など，戻すコストが高い地点をチェックポイントまたはスローモート・トリガーにします．

### Property-controlled Acceptance

各行は「入力や状態が変わっても守る性質」として読み取れるようにします．正常例だけでなく，空状態，失敗時，境界値，既存挙動の不変条件を検討します．検証には `npm run lint`，`npm run type-check`，`npm run build`，`npx vitest run --coverage.enabled=true`，必要な画面確認などを選びます．

プロパティの追加や意味変更は完了条件の変更です．実装中でも CRPack で再承認し，Brief の version と Changelog を更新します．

### Autonomy Envelope

曖昧な「必要なら相談」ではなく，止まる条件と上申先を特定します．外部に影響する操作は常に `must_consult` です．GitHub Issue が有用でも，本文案を先に示して承認を得るまでは作成しません．Issue なしでもローカルミッションは進行できます．

### Context Pointers

情報を貼り付けず，`AGENTS.md`，`CLAUDE.md`，`docs/conventions.md`，必要に応じて `docs/context-cards/` 内のカードを指します．読み込む条件，強度，元ソース，最終確認日を保ちます．

## 更新時

合意が変わったら `last_updated` と `brief_version` を更新し，Changelog に理由と承認を残します．Current State の詳細は [handoff.md のガイド](./how-to-handoff.md) に委ね，二重管理を避けます．終了時は [Merge-Readiness Pack](./how-to-merge-rationale.md) の各プロパティへ同じ ID を引き継ぎます．

## 避けること

- Issue や依頼文を貼るだけで，意図と検証方法を定義しないこと
- 詳細な実装手順でエージェントの判断を縛ること
- 曖昧な品質語を受け入れ条件にすること
- 合意をチャットだけに残し，Brief を古くすること
