---
mission_id: 20260915-msw-faker-mocks
pack_version: 5
generated_by: Codex
generated_at: 2026-09-18T06:10:19Z
source_commit: 0a1ee9acdcf093d722ef8f23fbb09053fbc1421d
reviewer: user
decision: pending
non_merge_root_cause: null
related:
  brief: ./mission-brief.md
  handoff: ./handoff.md
---

# MSWとFakerでモックを共有し，HTTP経由で操作する

日程調整が直接呼んでいた`mockApi`を撤去し，HTTPクライアントをMSWで受ける構成へ移した．日程調整に必要な通常APIも同じ状態を使うため，開発モックだけで回答からイベント作成まで操作できる．実装commitの自動検証はすべて成功した．実ブラウザの確認はuserが担当する．

## 変更した境界

- `src/mocks/`へ起動，シナリオ，状態の再生成を集約し，ドメインごとの`mocks/`へデータ生成とHTTP応答を分けた．MSW 2.15.0，Faker 10.6.0を開発用依存として固定した．
- `main.ts`は開発モックの準備完了を待ってからアプリをimportする．通常起動・本番ではモックを起動しない．
- draft-eventはfeature内の暫定HTTP契約を使い，生成スキーマは変更しない．作成時のIDは応答側で発行する．
- HTTP失敗，現在ユーザーの後着，空回答，イベント作成後の確定失敗を画面へ反映した．イベント作成が失敗した場合はdraftを確定しない．確定だけが失敗した場合は作成済みイベントのリンクを示し，重複作成を防ぐ．

全APIの再現，認証，永続化，既存テストの一括移行は対象外である．ルートの[利用ガイド](../../../MOCKS.md)に対象APIと追加方法を記載した．

## Property Coverage

以下は実装commit `39b4b74b6dc56f72ce3331bcdb7cd6d9bf014575`の結果である．P1とP4の実ブラウザ確認はuser担当として未実施であり，自動検証の成功と区別する．

| ID  | 検証                                                            | 証拠                                                                             | 状態 |
| --- | --------------------------------------------------------------- | -------------------------------------------------------------------------------- | ---- |
| P1  | 起動条件・順序，worker失敗，本番bundle非混入                    | `mockBootstrap.spec.ts`，bundle検査．実ブラウザはuser担当                        | pass |
| P2  | 同一入力の再生成，別シード・翌月でIDと日時の整合性              | `mockContext.spec.ts`，`mockData.spec.ts`                                        | pass |
| P3  | 作成・回答上書き・集計・確定・削除，400・404の原子性            | `draftMockApi.spec.ts`                                                           | pass |
| P4  | 一覧・詳細・回答の各状態，管理→作成の引き継ぎ，作成・確定の失敗 | `draftMockUi.spec.ts`，`draftEventCreation.spec.ts`．実ブラウザはuser担当        | pass |
| P5  | 共有定義，状態・応答・キャッシュの分離，未定義APIの診断と拒否   | `mockLifecycle.spec.ts`，`mockUiSupport.ts`，依存参照検索                        | pass |
| P6  | 8種類の通常API，既存13テスト，型・lint・build，利用ガイド       | `relatedMockApi.spec.ts`，`roomManagement.spec.ts`，`sample.spec.ts`，各コマンド | pass |

## 統合時の検証記録

以下の対象commitは`39b4b74b6dc56f72ce3331bcdb7cd6d9bf014575`，検証完了の記録日時は`2026-09-15T11:28:54Z`．後続の`0a1ee9a`は結果と引き継ぎ文書だけを更新した．表内の詳細成果物は当時のintegration worktreeに保存されている．今回のルートでの結果は末尾に記録する．

| 検証          | コマンド                                                                                            | 結果 / 証拠                                                                                                                                |
| ------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| clean install | `npm ci --offline --no-audit --no-fund`                                                             | 終了0．lockfileを変更せず483 packageを取得．[ログ](../../../.agent-worktrees/20260915-105926/integration/coverage/msw-mission/install.log) |
| lint          | `npm run lint`                                                                                      | 終了0，エラー0・既存警告10．[ログ](../../../.agent-worktrees/20260915-105926/integration/coverage/msw-mission/lint.log)                    |
| 型検査        | `npm run type-check`                                                                                | 終了0．[ログ](../../../.agent-worktrees/20260915-105926/integration/coverage/msw-mission/type-check.log)                                   |
| tests         | 下記Vitestコマンド                                                                                  | 終了0，10ファイル84件成功．[JSON](../../../.agent-worktrees/20260915-105926/integration/coverage/msw-mission/vitest.json)                  |
| coverage      | Vitest V8 coverage                                                                                  | 行70.2%，分岐56.14%．[JSON](../../../.agent-worktrees/20260915-105926/integration/coverage/msw-mission/coverage/coverage-summary.json)     |
| build         | `VITE_ENABLE_MOCKS=true npm run build -- --sourcemap`                                               | 終了0．[ログ](../../../.agent-worktrees/20260915-105926/integration/coverage/msw-mission/build.log)                                        |
| bundle        | 全JS sourcemapの`sources`を列挙し，`/mocks/`・`/msw/`・`/@faker-js/`・旧`draft-event/mock.ts`を検査 | 13 map，150 module，該当0．[モジュール一覧](../../../.agent-worktrees/20260915-105926/integration/coverage/msw-mission/bundle.json)        |
| 文書          | 変更文書のPrettier検査，`git diff --check`，Context source pointer検査                              | 成功．日本語の静的検査と通読も実施                                                                                                         |

```bash
npm exec -- vitest run --coverage.enabled=true \
  --coverage.reportsDirectory=coverage/msw-mission/coverage \
  --coverage.reporter=text --coverage.reporter=json-summary --coverage.reporter=html \
  --reporter=default --reporter=json \
  --outputFile.json=coverage/msw-mission/vitest.json
```

機械可読な要約は[verification.json](./verification.json)．詳細成果物はintegration worktreeのignoredな`coverage/msw-mission/`に保存している．coverageの割合はこのテスト実行で計測した範囲の値であり，未対応APIの検証を意味しない．旧`mockApi`と`draft-event/mock`の直接参照が本体に残っていないことも検索で確認した．

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
- 統合版のmissionブランチへの取り込みと利用ガイドのルート配置: user / 2026-09-18 / Brief v5．今回の依頼に基づき実施した．

日程調整の暫定HTTP契約は正式バックエンド仕様ではない．本番でも旧固定モックの代わりにHTTPへ接続するため，対応APIがなければ疑似動作は継続しない．この互換性への影響は承認済みである．「曜日で指定」の候補日未生成と，共通GETのHTTPエラー伝播は既存の制約として残る．

ブラウザ操作の成功証拠は取得していない．確認項目は[Handoff](./handoff.md#手動確認はuserが担当する)へ引き継いだ．公開workerファイルは本番へコピーされるが，登録・実行コードはbundleへ含まれない．

- 現在のmissionブランチのpushと`feat/pages`向けのPR作成: user / 2026-09-18 / Brief v6．「よし，pushしてPR作って」に基づく．

## Reviewer Decision

- **decision**: pending．userによるブラウザ確認とレビューを待つ．
- **Git操作**: 2026-09-18の依頼に基づき，`mission/20260915-msw-faker-mocks`へ統合版をfast-forwardで取り込んだ．push，PR，worktree削除は未実施．

## リポジトリルートで起動と自動検証を確認した

2026-09-18の依頼に基づき，統合版`0a1ee9acdcf093d722ef8f23fbb09053fbc1421d`を現在のmissionブランチへ取り込んだ．起動コマンドはルートの`npm run dev:mock`，利用ガイドは`MOCKS.md`とした．検証時点の未commit差分は，文書の移動と参照・作業記録の更新だけである．アプリ・依存・テストは対象commitと同じであり，以下の検証をルートで実行した．

| 検証                                                            | 結果 / 証拠                                                                                                                                             |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm ci --offline --no-audit --no-fund`                         | 終了0，481 packageを取得．lockfile変更なし．                                                                                                            |
| `npm run lint`                                                  | 終了0，エラー0，既存警告10．[ログ](../../../coverage/msw-root-20260918/lint.log)                                                                        |
| VitestとV8 coverage                                             | 10ファイル84件成功．[JSON](../../../coverage/msw-root-20260918/vitest.json)．行70.2%，分岐56.14%．                                                      |
| `VITE_ENABLE_MOCKS=true npm run build -- --sourcemap`           | 型検査とbuildが終了0．[ログ](../../../coverage/msw-root-20260918/build.log)                                                                             |
| 本番bundle                                                      | 13 map，150 module，モック実装の混入0．[モジュール一覧](../../../coverage/msw-root-20260918/bundle.json)                                                |
| `npm run dev:mock -- --host 127.0.0.1 --port 8084 --strictPort` | ルートで起動成功．画面，モック有効設定，workerの配信をHTTP 200で確認し，サーバーを停止した．[JSON](../../../coverage/msw-root-20260918/dev-server.json) |
| 文書                                                            | Prettierと`git diff --check`が成功．ローカルリンク30件を確認し，旧ガイドへの参照は0件．日本語の静的検査と通読も実施した．                               |

記録日時は`2026-09-18T05:48:15Z`．機械可読な要約と実行コマンドは[verification.json](./verification.json)の`rootVerification`にある．Nodeとnpmは統合時と同じversionを使用した．

検証時の環境制約として，Huskyによる`.git/config`の再設定はsandboxで拒否されたが，既存の`core.hooksPath`が`.husky/_`であることを確認した．開発サーバーの起動とローカル接続には実行権限を追加して確認した．型検査・buildは成功し，既存のVite設定警告とGoogle Fontsの取得警告が残る．実ブラウザの操作確認は引き続きuserが担当する．
