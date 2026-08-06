# Missions

`docs/missions/` は，人間と AI エージェントが一定範囲を自律的に進めるためのタスク定義とレビュー資料を置く場所です．Codex と Claude Code のどちらでも，同じ Markdown ファイルを作業契約として使います．

## 3 つの文書

| 文書                 | 役割                                                                        | 更新時期                       |
| -------------------- | --------------------------------------------------------------------------- | ------------------------------ |
| `mission-brief.md`   | **Mission Brief**．意図，性質ベースの受け入れ条件，自律性の境界を定める契約 | 着手前に作成し，決定ごとに更新 |
| `handoff.md`         | **Handoff / Continuity Pack**．別セッションが再開できる最小状態             | 担当やセッションの切り替え時   |
| `merge-rationale.md` | **Merge-Readiness Pack**．受け入れ条件と証拠を対応付けた終了判断資料        | レビュー依頼前                 |

Brief がミッションの唯一の信頼できるソースです．チャットで合意した計画，スコープ，受け入れ条件，承認は Brief に反映します．Handoff と Merge-Readiness Pack は Brief を上書きしません．

## 配置と命名

```text
docs/missions/
├── README.md
├── _templates/
├── _guides/
└── <YYYYMMDD-short-slug>/
    ├── mission-brief.md
    ├── handoff.md
    └── merge-rationale.md
```

- mission ID は `YYYYMMDD-short-slug` 形式です．例は `20260806-room-filter` です．
- ブランチは `mission/<mission-id>` とし，1 ミッションを 1 ブランチで扱います．
- 関連 Issue の有無は mission ID に含めません．
- GitHub Issue は任意です．まず本文案をローカルで作り，作成前に人間へ明示的な承認を求めます．Issue を使わない場合は `github_issue: null` と `issue_status: not-applicable` のままミッションを進められます．

## 開始から終了まで

1. `mission/<mission-id>` ブランチを作ります．
2. リポジトリルートで次の initializer を実行します．

   ```bash
   node skills/start-mission/scripts/init-mission.mjs --id <id> --title '<title>'
   ```

   initializer は [\_templates](./_templates/) の 3 ファイルを `docs/missions/<mission-id>/` へコピーし，`.template` をファイル名から外します．mission ID，タイトル，ブランチ，Brief の日付だけを埋め，Handoff と Merge-Readiness Pack の日時や証拠は実際に作成するまでプレースホルダーとして残します．ブランチ，Issue，commit，外部操作は作成しません．手動で初期化する場合も同じコピーと置換の意味を保ちます．

3. [Mission Brief ガイド](./_guides/how-to-mission-brief.md) に沿って Brief を作ります．
4. Conceptual Plan と受け入れプロパティについて人間の承認を得て，Brief に記録します．承認前に実装を始めません．
5. 各プロパティをテスト方法，失敗境界，期待する証拠へ対応付け，別の test-design CRPack で承認を得ます．両方の承認を Brief に記録して `status: active` としてから本実装を始めます．
6. セッションを跨ぐ場合は [Handoff ガイド](./_guides/how-to-handoff.md) に沿って最小再開状態を残します．
7. 完了時は [Merge-Readiness Pack ガイド](./_guides/how-to-merge-rationale.md) に沿って証拠を整理し，レビューを依頼します．

## 受け入れと証拠

受け入れ条件は具体例だけでなく，常に成り立つプロパティまたは不変量として記述します．各プロパティを検証方法と期待する証拠に結び付け，Merge-Readiness Pack で実測結果へ 1 対 1 に対応させます．

knoQ_R-UI では変更範囲に応じて，次のコマンドから必要なものを選びます．コマンドを実行しなかった場合も理由を残します．

- `npm run lint`
- `npm run type-check`
- `npm run build`
- `npm exec -- vitest run --coverage.enabled=true`
- 文書のみの変更では `npm exec -- prettier --check docs/missions` と `git diff --check`

証拠にはコマンド，結果，実行日時，実行環境，対象 commit SHA，ログや成果物へのポインタを含めます．主張と異なる commit の証拠を流用せず，生成元が追跡できる状態を保ちます．

## 承認とエスカレーション

Brief の **Autonomy Envelope** は，操作を次の 3 区分にします．

- `may_decide`: 合意済みの範囲でエージェントが自分で決定できます．
- `must_consult`: 実行前に人間の承認が必要です．Conceptual Plan と受け入れプロパティの確定，test design の確定，Brief のスコープ変更は必ず含めます．
- `prohibited`: 承認の有無にかかわらず，このミッションでは実行しません．

上申には **Consultation Request Pack（CRPack）** を使い，次を簡潔に提示します．

1. 求める決定と，今相談する理由
2. 制約と確認済みの事実
3. 選択肢とトレードオフ
4. 推奨案
5. 承認後に行う操作

Issue 作成，コメント投稿，push，PR 作成，デプロイ，外部サービスのデータ変更など，リポジトリ外へ影響する操作は `must_consult` です．対象と操作を示して明示的な承認を得るまで実行しません．ローカルでの調査，編集，検証，commit は Brief の境界内で進められます．

Conceptual Plan と受け入れプロパティの承認後も，test design が未承認なら，本実装を先取りするプロダクト変更は行いません．テスト設計のための読み取り専用調査と破棄可能なプローブだけを進められます．

## コンテキスト

Brief と Handoff には情報そのものを詰め込まず，必要なソースへのポインタを置きます．プロジェクト共通規約は `AGENTS.md`，`CLAUDE.md`，`docs/conventions.md` を参照し，分野別コンテキストカードがある場合は `docs/context-cards/` 配下を指します．元ソース，重要度，最終確認日を失わないようにします．

探索の生ログは本流のコンテキストに混ぜず，採用した結論，理由，検証可能なポインタだけを Brief または Handoff に戻します．

## テンプレートとガイド

- [Mission Brief テンプレート](./_templates/mission-brief.template.md) / [書き方](./_guides/how-to-mission-brief.md)
- [Handoff テンプレート](./_templates/handoff.template.md) / [書き方](./_guides/how-to-handoff.md)
- [Merge-Readiness Pack テンプレート](./_templates/merge-rationale.template.md) / [書き方](./_guides/how-to-merge-rationale.md)
