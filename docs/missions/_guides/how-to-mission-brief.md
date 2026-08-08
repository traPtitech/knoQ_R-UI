# Mission Brief の書き方

テンプレートは [mission-brief.template.md](../_templates/mission-brief.template.md) です．共通運用は [Missions README](../README.md) を参照してください．

Mission Briefは，目的，終了条件，エージェントが判断できる範囲を合意する契約です．細かな実装手順を固定するためには使いません．ミッション中の決定はチャットだけに残さず，Briefへ集約します．

## 作成順序

1. `YYYYMMDD-short-slug` の mission ID と `mission/<mission-id>` ブランチを決めます．
2. Intent に動機，テスト可能な目的，スコープ，非目標，制約を書きます．
3. Conceptual Plan には比較した方針，大まかな道筋，確認点，停止条件だけを書きます．
4. 受け入れ条件をプロパティまたは不変量で書きます．
5. Conceptual Plan と受け入れプロパティを 1 つ目の CRPack で承認し，承認者，日時，根拠を記録します．承認前に実装を始めません．
6. 承認済みの各プロパティを，焦点を絞ったテスト方法，失敗経路と回帰境界，期待する機械可読な証拠へ対応付けます．
7. test design を別の CRPack で承認し，両ゲートの承認を Brief へ記録して `status: active` としてから本実装を始めます．承認前に許されるのは，読み取り専用調査と破棄可能なプローブだけです．
8. Autonomy Envelope で `may_decide`，`must_consult`，`prohibited` を具体化します．両ゲートの変更を `must_consult` に含めます．

## セクションの判断基準

### Intent

目的は完了判定できる文にします．「適切に表示する」のような曖昧な表現を避け，対象となる状態と守る性質を記述してください．非目標も必ず定めます．制約は`must`と`should`を分け，後から要約しても強度が残るようにします．

### Conceptual Plan

Conceptual Planでは，実装ステップよりもアプローチの選択を承認対象にします．新しい共有抽象，API契約変更，大きな依存追加など，戻すコストが高い地点をチェックポイントまたはスローモート・トリガーにします．

### Property-controlled Acceptance

各プロパティは「入力や状態が変わっても守る性質」として読み取れるようにします．正常例だけでなく，空状態，失敗時，境界値，既存挙動の不変条件を検討します．Conceptual Plan とプロパティを先に承認し，この時点ではテスト方法を確定しません．

承認後に Test Design Consultation で各 ID を検証方法と証拠へ結び付けます．検証には `npm run lint`，`npm run type-check`，`npm run build`，`npm exec -- vitest run --coverage.enabled=true`，必要な画面確認などを選びます．対応表を 2 つ目の CRPack として明示的に承認し，承認情報を Brief に反映してから本実装へ進みます．

プロパティの追加や意味変更は完了条件の変更です．実装中でも Conceptual Plan / プロパティと test design の影響するゲートを再承認し，Brief の version と Changelog を更新します．

### Autonomy Envelope

「必要なら相談」のような曖昧な境界を避け，止まる条件と上申先を特定します．外部に影響する操作は常に`must_consult`です．GitHub Issueが有用でも，本文案を先に示して承認を得るまでは作成しません．Issueがなくてもローカルミッションは進行できます．

### Context Pointers

情報を貼り付けず，`AGENTS.md`，`CLAUDE.md`，`docs/conventions.md`，必要に応じて `docs/context-cards/` 内のカードを指します．読み込む条件，強度，元ソース，最終確認日を保ちます．

## 更新時

合意が変わったら `last_updated` と `brief_version` を更新し，Changelog に理由と承認を残します．Current State の詳細は [handoff.md のガイド](./how-to-handoff.md) に委ね，二重管理を避けます．終了時は [Merge-Readiness Pack](./how-to-merge-rationale.md) の各プロパティへ同じ ID を引き継ぎます．

## 避けること

- Issue や依頼文を貼るだけで，意図と検証方法を定義しないこと
- 詳細な実装手順でエージェントの判断を縛ること
- 曖昧な品質語を受け入れ条件にすること
- 合意をチャットだけに残し，Brief を古くすること
