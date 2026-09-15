---
mission_id: 20260915-msw-faker-mocks
pack_version: 3
generated_by: Codex
generated_at: 2026-09-15T11:20:16Z
source_commit: 9939252569c3e897e149218550610ef06c36e048
reviewer: user
decision: pending
non_merge_root_cause: null
related:
  brief: ./mission-brief.md
  handoff: ./handoff.md
---

# MSWとFakerでモックを共有し，HTTP経由で操作する

日程調整が直接呼んでいた`mockApi`を撤去し，HTTPクライアントをMSWで受ける構成へ移した．日程調整に必要な通常APIも同じ状態を使うため，開発モックだけで回答からイベント作成まで操作できる．最終commitの自動検証を記録中である．実ブラウザの確認はuserが担当する．

## 変更した境界

- `src/mocks/`へ起動，シナリオ，状態の再生成を集約し，ドメインごとの`mocks/`へデータ生成とHTTP応答を分けた．MSW 2.15.0，Faker 10.6.0を開発用依存として固定した．
- `main.ts`は開発モックの準備完了を待ってからアプリをimportする．通常起動・本番ではモックを起動しない．
- draft-eventはfeature内の暫定HTTP契約を使い，生成スキーマは変更しない．作成時のIDは応答側で発行する．
- HTTP失敗，現在ユーザーの後着，空回答，イベント作成後の確定失敗を画面へ反映した．イベント作成が失敗した場合はdraftを確定しない．確定だけが失敗した場合は作成済みイベントのリンクを示し，重複作成を防ぐ．

全APIの再現，認証，永続化，既存テストの一括移行は対象外である．[利用ガイド](../../development/mocks.md)に対象APIと追加方法を記載した．

## Property Coverage

最終証拠の取得後に，この表の状態とポインタを確定する．

| ID  | 検証                                                            | 証拠                                                                             | 状態   |
| --- | --------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------ |
| P1  | 起動条件・順序，worker失敗，本番bundle非混入                    | `mockBootstrap.spec.ts`，bundle検査．実ブラウザはuser担当                        | 記録中 |
| P2  | 同一入力の再生成，別シード・翌月でIDと日時の整合性              | `mockContext.spec.ts`，`mockData.spec.ts`                                        | 記録中 |
| P3  | 作成・回答上書き・集計・確定・削除，400・404の原子性            | `draftMockApi.spec.ts`                                                           | 記録中 |
| P4  | 一覧・詳細・回答の各状態，管理→作成の引き継ぎ，作成・確定の失敗 | `draftMockUi.spec.ts`，`draftEventCreation.spec.ts`．実ブラウザはuser担当        | 記録中 |
| P5  | 共有定義，状態・応答・キャッシュの分離，未定義APIの診断と拒否   | `mockLifecycle.spec.ts`，`mockUiSupport.ts`，依存参照検索                        | 記録中 |
| P6  | 8種類の通常API，既存13テスト，型・lint・build，利用ガイド       | `relatedMockApi.spec.ts`，`roomManagement.spec.ts`，`sample.spec.ts`，各コマンド | 記録中 |

## Evidence and Provenance

予備検証では84テスト，型検査，lint，buildが成功した．最終commitでclean installと同じ検証を実行し，機械可読な結果を残す．

環境はmacOS，Node `v24.12.0`，npm `11.6.2`．lintの10警告は既存ファイルの未使用変数と`v-html`で，エラーは0件．UnoCSSのGoogle Fonts取得警告とViteの将来のconfig loaderに関する警告は，既存設定に由来する．

## 分担と統合

| 担当     | branch                              | 成果commit | 統合commit | 担当検証               |
| -------- | ----------------------------------- | ---------- | ---------- | ---------------------- |
| 通常API  | `agent/20260915-105926/related-api` | `e3527d3`  | `4933bb0`  | HTTP17件，型，lint     |
| 日程調整 | `agent/20260915-105926/draft-api`   | `763cce3`  | `9939252`  | HTTP24件，型，担当lint |

共有baseは`e6414c3`，統合branchは`agent/20260915-105926/integration`．ロック修正`1461845`を先に適用し，通常API→日程調整の順でレビュー済みcommitを取り込んだ．競合はなかった．遅延用の全APIハンドラーが未定義要求も一致扱いにする点は，統合レビューで発見し，末尾の診断付きハンドラーで明示的に拒否するよう修正した．

## 承認と未解決の確認

- 方針とP1からP6: user / 2026-09-15T10:31:13Z / Brief v2．
- T-A，暫定HTTP契約，2担当分担: user / 2026-09-15T10:56:33Z / Brief v3．
- 実ブラウザの確認をuserへ引き継ぎ: user / 2026-09-15T11:20:16Zに記録 / Brief v4．自動検証とbundle検査は継続する．

日程調整の暫定HTTP契約は正式バックエンド仕様ではない．本番でも旧固定モックの代わりにHTTPへ接続するため，対応APIがなければ疑似動作は継続しない．この互換性への影響は承認済みである．「曜日で指定」の候補日未生成と，共通GETのHTTPエラー伝播は既存の制約として残る．

ブラウザ操作の成功証拠は取得していない．確認項目は[Handoff](./handoff.md#手動確認はuserが担当する)へ引き継いだ．公開workerファイルは本番へコピーされるが，登録・実行コードはbundleへ含まれない．

## Reviewer Decision

- **decision**: pending．userによるブラウザ確認とレビューを待つ．
- **外部操作**: 公開パッケージの取得のみ．push，PR，別ブランチへのmerge，worktree削除は未実施．
