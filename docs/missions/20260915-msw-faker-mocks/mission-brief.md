---
mission_id: 20260915-msw-faker-mocks
branch: mission/20260915-msw-faker-mocks
integration_branch: agent/20260915-105926/integration
status: active # draft | active | blocked | closed
owner: user
assignee: Codex
created: 2026-09-15
last_updated: 2026-09-15
brief_version: 4
github_issue: null
issue_status: not-applicable # not-applicable | draft | approved-created
approvals:
  conceptual_plan: approved # pending | approved | changes-requested
  acceptance_properties: approved # pending | approved | changes-requested
  test_design: approved # pending | approved | changes-requested
related:
  handoff: ./handoff.md
  merge_rationale: ./merge-rationale.md
---

# Mission Brief: MSWとFakerでモックAPIとデータを構造化する

日程調整と関連APIをMSWへ移し，Fakerによるデータ生成と画面確認用のシナリオを分けるA案，およびP1からP6は承認済みである．T-A，暫定HTTP契約，2担当の分担も承認済みである．実装と文書を統合し，自動検証はすべて成功した．実ブラウザでの動作確認は，2026-09-15のuserの指示によりuserが担当する．

## Intent

- **動機**: `src/features/draft-event/mock.ts`の795行に，固定データ，メモリ上の状態，疑似通信，集計が同居している．3つのcomposableが`mockApi`を直接呼び，ユーザーやグループは通常APIから取得するため，日程調整をバックエンドなしで一通り操作できない．
- **目的**: 開発者が明示的にモック環境を起動し，日程調整の作成，回答，集計，確定から通常イベントの表示まで操作できるようにする．同じ定義をブラウザとVitestで使い，データや表示状態を追加する場所が分かる構成にする．
- **スコープ内**:
  - `msw`と`@faker-js/faker`の開発用依存，ブラウザとNodeの起動処理，モック用の起動コマンド．
  - draft-eventの一覧，詳細，作成，削除，確定，回答取得・保存，集計のHTTP化と既存`mockApi`の撤去．
  - 上記の操作に必要な通常APIのモック．対象は`GET /users`，`GET /users/me`，`GET /groups`，`GET /groups/{groupID}`，`GET /rooms`，`GET /events`，`GET /events/{eventID}`，`POST /events`とする．ユーザーアイコンもモック時にはローカルで表示できるようにする．
  - データ生成関数，関連IDを管理するメモリ上の状態，名前付きシナリオ，初期状態へのリセット．
  - 対応テスト，`docs/development/`の利用ガイド，READMEの入口，変更に関係する規約とContext Card．
- **非目標**: 全OpenAPIエンドポイントの再現，認証サーバーの再現，部屋のCSV登録・削除やiCalなどの日程調整に関係しない操作，バックエンド実装，UI全体の改修，Storybook導入，データ永続化，既存テストの一括MSW移行．共有デモの公開と本番でのモック利用も対象外とする．
- **制約**:
  - must: 通常APIは既存の`apiClient`とOpenAPI生成型を使い，`src/lib/api/schema.d.ts`を手編集しない．モック状態をアプリの新しいストアとして公開しない．
  - must: draft-eventは生成スキーマに定義されていない．ローカル型に基づく暫定HTTP契約を明記し，正式なバックエンド契約として扱わない．実サーバーでの提供状況は未確認である．
  - must: モックは明示的に有効化した開発環境とテストだけで動かす．無効時には固定データへフォールバックしない．本番で従来の日程調整モックが動いていた場合，その疑似動作は移行後に終了する．
  - must: 同じ依存version，シナリオ，乱数シード，基準日時から同じ初期データを生成する．関係IDと時刻の前後関係を保つ．
  - should: 日本語のイベント名・説明，長い名前，複数の参加者など，既存画面の表示を判断しやすいデータを用意する．ランダム生成だけで状態の網羅を狙わず，必要な条件はシナリオで指定する．

開始ブランチは`feat/pages`，開始commitは`11bd0143b692f6885bae514d0eed53e477428fc7`．作業ツリーがcleanであることを確認して分岐した．GitHub Issueはローカルでの開始に不要なため，`not-applicable`とする．

## Conceptual Plan

### 既存モックと操作に必要なAPIをまとめて移す

| 候補                                   | 移行範囲              | 利点                                                                 | 負担・制約                                                               |
| -------------------------------------- | --------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| A．日程調整と関連APIを移行する案を推奨 | Intentに列挙した範囲  | バックエンドなしで主要な操作を確認でき，データの関係もそろえられる． | draft-eventのHTTP化と関連APIの定義が必要になる．                         |
| B．日程調整の既存モックだけを移行する  | `mockApi`と固定データ | 変更範囲が小さい．                                                   | ユーザー，グループ，イベント作成などは引き続きバックエンドが必要になる． |

### 通信，データ生成，表示条件を分ける

共通の起動処理とシナリオの組み立ては`src/mocks/`，ドメイン別のハンドラーとデータ生成関数は`src/features/<feature>/mocks/`へ置く案とする．ハンドラーはHTTP要求を受けて応答し，データ生成関数は型に沿ったレコードを作る．シナリオは，どのレコードと応答条件を組み合わせるかを指定する．配置規約にもこの責務を追記する．

MSWはブラウザでの応答とNode上のテストに共通定義を利用できる．ブラウザではworkerの起動完了を待ってVueを開始する構成にする．[MSWの概要](https://mswjs.io/)と[ブラウザ導入手順](https://mswjs.io/docs/integrations/browser/)に基づく．

Fakerには乱数シードと基準日時を渡す．シードだけでは相対日時を再現できず，version更新でも出力が変わり得るため，再現条件にはlockfileも含める．開発時の基準日時は起動時の日時を既定とし，テストや不具合再現時は固定できるようにする．[Fakerの再現性に関する説明](https://fakerjs.dev/guide/usage.html#reproducible-results)に基づく．

既存モックの状態と集計を移し，作成や回答の結果が後続の取得に反映されるようにする．候補スロットのIDはモック側で払い出し，`CreateDraftEvent.vue`にあるモック都合のID生成を除く．通常APIの型付きクライアントは維持し，draft-eventに限って暫定HTTP契約をfeature内へ分離する．

既定のシナリオには，募集中・締切済み・確定済み，回答済み・未回答，管理者・招待者などの表示条件を含める．空状態，エラー，遅延は名前を指定して再現する．モック有効時に未定義のAPIを呼んだ場合は，診断可能な失敗にし，実APIへ自動転送しない．Viteの配信ファイルなど，API以外の通信は妨げない．

- **チェックポイント**: 方針とP1からP6の承認，暫定HTTP契約とテスト設計の確認，ブラウザでの一連の操作確認，証拠を対応付けた最終レビュー．
- **スローモート・トリガー**: 列挙した範囲を超えるAPIやUI変更，本番モックの継続，正式なdraft-event契約への対応，MSW・Faker以外の主要依存追加，TypeScriptやViteの広範な設定変更が必要になった場合は相談する．
- **承認**: approved
- **承認者 / 記録日時 / 根拠**: user / 2026-09-15T10:31:13Z / A案とP1からP6への承認確認に対し，「はい，承認します．」と回答した．本番での既存日程調整モックを終了する扱いを含む．

## Property-controlled Acceptance

| ID  | プロパティまたは不変量                                                                                                                                                                          |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1  | モック起動時は最初のAPI要求からMSWが応答する．通常起動と本番ではモックが起動せず，MSW・Faker・シードデータの実行コードを本番bundleへ含めない．                                                  |
| P2  | 同じ依存version，シナリオ，シード，基準日時で同じ初期データを生成できる．利用者，グループ，日程調整，候補，回答，イベント，部屋の参照が解決でき，開始は終了より前になる．                       |
| P3  | 日程調整の作成・削除・回答保存・確定の成功が，後続の一覧・詳細・回答・集計へ矛盾なく反映される．集計は回答に基づき，存在しない対象，不正な候補，回答0件も定義した応答となる．                   |
| P4  | バックエンドなしで，日程調整の一覧→作成→回答→集計→確定→通常イベント作成・表示を操作できる．既定データには募集中・締切済み・確定済みと回答済み・未回答を含め，空状態・エラー・遅延も選択できる． |
| P5  | 同じモック定義をブラウザとVitestで使える．データと応答上書きをリセットすると前の操作の影響が消え，未定義APIを検知できる．本体から旧`mockApi`やモックデータを直接参照しない．                    |
| P6  | 通常APIの生成型と既存クライアントの契約，既存の部屋管理テストを保つ．利用ガイドだけで起動，シナリオ選択，再現，リセット，データ・ハンドラー追加の場所を確認できる．                             |

- **プロパティ承認**: approved
- **承認者 / 記録日時 / 根拠**: user / 2026-09-15T10:31:13Z / 第1 CRPackへの「はい，承認します．」によりP1からP6を承認した．

### Test Design Consultation

[第2 CRPack](./test-design.md)に，T-AとT-Bの比較，暫定HTTP契約，具体的な確認手順と分担を記録した．T-Aとして既存のVitest・Vue Test Utils・jsdomを使い，Service Workerと一連の操作は実ブラウザでも確認する案を推奨する．

| ID  | テスト方法                                                                        | 失敗経路 / 回帰境界                                                | 期待する証拠                         |
| --- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------ |
| P1  | 起動順・無効化のテスト，開発・通常・本番のブラウザ確認，buildのモジュール一覧確認 | 初回要求，worker失敗，モード切り替え，本番への混入                 | Vitest JSON，build・ブラウザ記録     |
| P2  | 固定入力の再生成比較，別シード・基準日時での参照・日時検査                        | ID不整合，重複，時刻への暗黙依存，期限切れだけの初期データ         | データ比較と不変条件のassert         |
| P3  | MSWを通して作成・回答上書き・集計・確定・削除と後続取得を実行                     | 400・404，回答0件，空回答，不正更新後の状態保持                    | status・bodyと更新後の状態のassert   |
| P4  | 一覧・詳細・回答フォームとイベント作成の画面テスト，ブラウザでの一連の操作        | 読込順，通常・空・エラー・遅延，作成失敗時の誤確定，部屋あり・なし | DOMとデータのassert，画面・通信記録  |
| P5  | データ・応答上書き・画面キャッシュのリセット，未定義APIと旧mock参照の検査         | 状態混入，実ネットワークへの漏出，モック定義の重複                 | Vitest JSON，診断と参照確認          |
| P6  | 8種類の通常API，既存13テスト，lint，型検査，build，利用ガイドの検証               | 型の崩れ，部屋管理の回帰，手順の不足                               | テストJSON，coverage，各コマンド結果 |

- **テスト設計承認**: approved．T-Aと暫定HTTP契約を含む．
- **承認者 / 記録日時 / 根拠**: user / 2026-09-15T10:56:33Z / 第2 CRPackへの「はい，承認します」による．
- **実装分担の承認**: approved．user / 2026-09-15T10:56:33Z / 第2 CRPackへの承認に基づき，共有基盤の後，`draft-api`と`related-api`を分離したworktreeで実装する．

## Autonomy Envelope

### may_decide

- 承認前の読み取り調査，ミッション文書の整備，破棄可能な検証．
- 両ゲートの承認後の，範囲内のファイル分割，命名，生成データの内容，内部状態管理，ローカル編集・検証．
- モックを増やすための最小限の文書・Context Card更新．

### must_consult

- Conceptual Plan または受け入れプロパティを確定，変更するとき
- プロパティとテスト方法，失敗境界，期待する証拠の対応を確定，変更するとき
- Brief で承認済みの範囲を越えて，スコープ，制約，公開 API，ユーザー向け挙動を変更するとき
- Issue 作成，コメント，push，PR，デプロイなど外部へ影響する操作を行うとき
- 本番でのモック利用，スコープ外のAPI対応，正式API契約の変更，永続化を加えるとき．上申先はuserとする．

### prohibited

- `src/lib/api/schema.d.ts`の手編集と，型検査を逃れるための`any`や広い型assertion．
- モックデータ生成のための実利用者データの取得・複製．
- 既存ユーザー変更の破棄，無承認の外部操作．

上申は[共通CRPack形式](../README.md#実装前に計画とテスト設計を承認する)で提示し，明示的な承認を記録してから進めます．

## Context Pointers

| 強度   | ソース                                                                                                                                                                | 読む条件 / 用途                                             | 最終確認日 |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ---------- |
| must   | `AGENTS.md`，`CLAUDE.md`，`docs/conventions.md`                                                                                                                       | 配置，型，検証規約                                          | 2026-09-15 |
| must   | `docs/missions/README.md`，`skills/start-mission/SKILL.md`                                                                                                            | 承認と再開手順                                              | 2026-09-15 |
| must   | `docs/context-cards/project-overview.md`，`api-data-schema.md`，`event-draft-event-domain.md`                                                                         | 通常APIとdraft-eventの境界                                  | 2026-09-15 |
| must   | `src/features/draft-event/api.ts`，同featureの`mocks/`，`types.ts`と`composables/`                                                                                    | 移行するデータ，状態，操作                                  | 2026-09-15 |
| must   | `src/pages/CreateDraftEvent.vue`，`DraftEventList.vue`，`DraftEventDetail.vue`，`DraftEventManage.vue`，`CreateEvent.vue`                                             | 候補ID，回答状態，確定からイベント作成への接続              | 2026-09-15 |
| must   | `src/lib/api/index.ts`，`schema.d.ts`，`src/composables/useApiFetch.ts`                                                                                               | URL，生成型，SWRVの扱い                                     | 2026-09-15 |
| must   | `src/features/user/composables/`，`src/features/group/composables/useGroups.ts`，`src/features/event/api.ts`，`src/components/UI/UserIcon.vue`                        | 関連APIとアイコンの通信                                     | 2026-09-15 |
| must   | `package.json`，`vite.config.ts`，`tsconfig.json`，`src/main.ts`                                                                                                      | 依存の互換性と起動順序                                      | 2026-09-15 |
| should | `docs/context-cards/frontend-architecture-routing.md`，`quality-tooling.md`                                                                                           | 初期化と検証を変更するとき．パスは`docs/context-cards/`基準 | 2026-09-15 |
| must   | `tests/unit/roomManagement.spec.ts`                                                                                                                                   | 保持する既存のAPIモックテスト                               | 2026-09-15 |
| should | [MSW Browser](https://mswjs.io/docs/integrations/browser/)，[MSW Node](https://mswjs.io/docs/integrations/node/)，[Faker Usage](https://fakerjs.dev/guide/usage.html) | 導入時の公式手順                                            | 2026-09-15 |

- **確認済み**: MSW 2.15.0とFaker 10.6.0を一時環境へ取得し，現在のTypeScript解決設定での型検査，NodeでのHTTP応答，日本語データの再生成が成功した．プロジェクトへの導入は完了し，統合後のHTTP・画面テスト84件が成功した．最終証拠はMRPackへ記録する．
- **承認済みの設計**: 暫定HTTP契約，4シナリオ，テストの対応表，worktree分担は[第2 CRPack](./test-design.md)を参照する．
- **既知の注意点**: `useApiFetch`は応答の`.data`だけを返しており，HTTPエラーをSWRVのerrorへ伝えない．この共通処理の改修は自動的に範囲へ含めず，必要になった場合は影響を示して相談する．
- **カード補正**: `quality-tooling`にはsmoke testしかないと記載されていたが，部屋管理テストも存在する．今回の文書変更で実装に合わせる．

## Current State

- **完了**: 両承認ゲート，依存と共有基盤，2担当の実装・レビュー・統合，HTTP・画面テスト84件．
- **自動検証完了**: clean install，84テスト，型検査，lint，本番build，bundle非混入，利用ガイドとContext Cardの整備．
- **次の一手**: userがintegration branchで実ブラウザの動作確認とレビューを行う．実装SHAと証拠はMRPackを参照する．
- 詳細は `handoff.md` を参照します．

## Changelog

| version | date       | 変更内容                                                                                | 理由 / 承認                                                                                                    |
| ------- | ---------- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| 1       | 2026-09-15 | 初版．導入範囲，代案，P1からP6，テスト候補を記録した．                                  | MSWとFakerを導入するミッションの開始依頼による．具体案は未承認．                                               |
| 2       | 2026-09-15 | A案とP1からP6の承認を記録し，互換性を確認した．第2 CRPackにテスト設計と分担を記録した． | userの「はい，承認します．」による．テスト設計は引き続き未承認．                                               |
| 3       | 2026-09-15 | T-A，暫定HTTP契約，2担当の分担を承認済みとし，activeへ変更した．                        | userの「はい，承認します」による．                                                                             |
| 4       | 2026-09-15 | 実ブラウザ確認をuser担当へ変更した．自動検証とbundle検査はCodexが継続する．             | userの「実際のブラウザでの動作確認は俺がやるから，それ以外やればいいよ」による．記録日時2026-09-15T11:20:16Z． |
