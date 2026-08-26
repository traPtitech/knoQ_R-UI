---
mission_id: 20260826-room-management
branch: mission/20260826-room-management
status: closed # draft | active | blocked | closed
owner: user
assignee: Codex
created: 2026-08-26
last_updated: 2026-08-26
brief_version: 9
github_issue: https://github.com/traPtitech/knoQ_R-UI/issues/211
issue_status: approved-created # not-applicable | draft | approved-created
approvals:
  conceptual_plan: approved # pending | approved | changes-requested
  acceptance_properties: approved # pending | approved | changes-requested
  test_design: approved # pending | approved | changes-requested
related:
  handoff: ./handoff.md
  merge_rationale: ./merge-rationale.md
---

<!-- 記入方法は ../_guides/how-to-mission-brief.md を参照してください． -->

# Mission Brief: 進捗部屋管理画面を実装する

## Intent

- **動機**: 進捗部屋のCSV一括登録と削除が管理画面にまとまっておらず，管理者が予約済みの部屋を確認して整理できないため．
- **目的**: 特権ユーザーが`/rooms/manage`でCSV一括登録と，現在以降に予約されている進捗部屋の選択削除を完結できるようにする．
- **スコープ内**: `/rooms/manage`の追加，CSV登録UIの統合，将来・進行中の進捗部屋の日時順表示，複数選択，削除確認，選択した部屋の削除，部分失敗の表示，既存`/rooms/new`からの互換導線，管理画面へのヘッダー導線．
- **非目標**: 進捗部屋の編集，通常フォームによる1件登録，OpenAPI生成型の手編集，バックエンドへの一括削除API追加，進捗部屋カレンダーの表示変更．
- **制約**:
  - must: 既存の`POST /rooms/all`と`DELETE /rooms/{roomID}`を使用し，`src/lib/api/schema.d.ts`を手編集しない．
  - must: 削除は確認操作を経て，特権ユーザーだけが開始できるUIにする．
  - must: 削除が一部失敗した場合，成功分と失敗分を区別し，失敗した部屋を再選択できる状態に保つ．
  - should: 管理画面の情報密度を優先し，既存のUnoCSS tokenとUI部品を再利用する．

## Conceptual Plan

- **候補と比較**: A案は`/rooms/manage`へ登録と削除を統合し，選択したIDごとに既存DELETEを並列実行する．現行APIだけで完結する一方，通信は複数回になる．B案はバックエンドへ一括削除APIが追加されるまでフロント実装を待つ．通信の原子性は得られるが，Issue #211を単独で完結できない．C案は`/rooms/new`を残し，削除専用ページを追加する．差分は小さいが，Issueが求める管理画面への統合に反する．
- **合意するアプローチ**: 推奨するA案で，特権ユーザー向け`/rooms/manage`へCSV登録と削除一覧を統合する．現在進行中または将来の部屋を開始時刻順に表示し，確認ダイアログ後にID単位のDELETEを並列実行する．`/rooms/new`は管理画面へredirectし，既存リンクを壊さない．
- **チェックポイント**: 管理画面の空・読込・取得失敗状態，選択と確認ダイアログ，削除の全成功・部分失敗，CSV登録の成功・失敗，旧URLからの遷移を確認する．
- **スローモート・トリガー**: 現行APIで進行中・将来の部屋を取得できない，DELETEの権限仕様が`privileged`と矛盾する，ID単位DELETEでは許容できない原子性が必要と判明した場合は実装を止めて相談する．
- **承認**: approved
- **承認者 / 日時 / 根拠**: user / 2026-08-26T13:12:25Z / 第1 CRPackに対する「それで良いです」という回答により，A案と受け入れ条件を承認．
- **追加判断**: 全roomを一覧に残し，現在ユーザーの`userId`がroomの`admins`に含まれる場合だけチェックボックスを有効にする．削除権限のない行には理由を表示する．`dateBegin`は当日0時とし，終了済みroomをクライアントで除外する．
- **追加承認者 / 日時 / 根拠**: user / 2026-08-26T13:45:57Z / バックエンドの期間条件と削除権限を示した追加CRPackに対し，「A案で良い」と承認．

## Property-controlled Acceptance

| ID  | プロパティまたは不変量                                                                                                                |
| --- | ------------------------------------------------------------------------------------------------------------------------------------- |
| P1  | 特権ユーザーが管理画面を開くと，現在進行中または将来の進捗部屋が開始時刻の昇順で表示され，読込中・空・取得失敗を判別できる．          |
| P2  | 現在ユーザーが`admins`に含まれるroomだけを選択できる．選択が0件または削除処理中の間は削除を開始できず，確認取消時はDELETEを呼ばない． |
| P3  | 削除を確定すると，選択可能な各`roomID`にDELETEを一度ずつ実行し，成功した部屋は一覧から消え，失敗した部屋とエラー情報は画面に残る．    |
| P4  | CSV登録が成功した場合だけ入力を空にして一覧を再取得し，失敗した場合は入力を保持してエラーを表示する．                                 |
| P5  | 非特権ユーザーには管理操作を表示せず，`/rooms/new`へのアクセスは`/rooms/manage`へ互換的に転送される．                                 |

- **プロパティ承認**: approved
- **承認者 / 日時 / 根拠**: user / 2026-08-26T13:12:25Z / P1からP5を含む第1 CRPackを承認．

### Test Design Consultation

| ID  | テスト方法                                                                      | 失敗経路 / 回帰境界                                          | 期待する機械可読な証拠                                     |
| --- | ------------------------------------------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------- |
| P1  | Vue Test UtilsでGETをmockし，未整列データ，空配列，取得失敗を描画する．         | 進行中・将来・期限切れの境界，開始時刻が同じ部屋，取得失敗． | Vitestのテスト名とpass結果．                               |
| P2  | admins内外のroom，未選択，確認取消，削除処理中のボタンとAPI回数を操作試験する． | 権限外roomの選択，取消時の誤削除，二重送信，0件削除．        | 権限外checkboxのdisabled，DELETE 0回，ボタン状態のassert． |
| P3  | 選択可能な2件をDELETE全成功と1件失敗に分けてmockする．                          | 権限外IDの送信，呼び出し重複，部分失敗時の一覧と選択状態．   | roomIDごとの呼出回数，一覧，選択，エラー表示のassert．     |
| P4  | CSV POSTの成功・失敗をmockし，入力値と再取得を確認する．                        | 失敗時の入力消失，成功後の一覧未更新，送信中の二重送信．     | POST回数，入力値，GET再実行のassert．                      |
| P5  | 特権・非特権ユーザーの描画と，ルーターの`/rooms/new` redirectを試験する．       | 権限のない操作表示，旧URLの404，既存`/rooms`への回帰．       | 表示有無とroute解決結果のassert．                          |

- **回帰検証**: `npm run lint`，`npm run type-check`，`npm run build`，`npm exec -- vitest run --coverage.enabled=true`，`npm exec -- prettier --check docs/missions/20260826-room-management`，`git diff --check`を実行する．
- **テスト依存**: UI操作試験のため，devDependenciesへ`@vue/test-utils`と`jsdom`を追加する案を推奨する．

- **テスト設計承認**: approved
- **承認者 / 日時 / 根拠**: user / 2026-08-26T13:16:47Z / 第2 CRPackに対する「はい進めて良いです」という回答により，Vue Test Utilsとjsdomを用いるB案を承認．

## Autonomy Envelope

### may_decide

- 承認済みプロパティを変えない範囲でのコンポーネント分割，命名，UnoCSS class，表示文言．
- ID単位DELETEの並列実行，成功分の除去，失敗分の再選択を実現する内部実装．
- 既存コードとテスト容易性を踏まえた，進捗部屋管理用の純粋関数の切り出し．

### must_consult

- Conceptual Plan または受け入れプロパティを確定，変更するとき
- プロパティとテスト方法，失敗境界，期待する証拠の対応を確定，変更するとき
- Brief で承認済みの範囲を越えて，スコープ，制約，公開 API，ユーザー向け挙動を変更するとき
- Issue 作成，コメント，push，PR，デプロイなど外部へ影響する操作を行うとき
- OpenAPI契約やバックエンド実装の変更が必要になったとき．
- 特権ユーザー以外にもCSV登録または削除を許可する要件へ変更するとき．
- 削除対象の期間または部分失敗時の挙動を変更するとき．

### prohibited

- `src/lib/api/schema.d.ts`の手編集．
- 進捗部屋，関連イベント，ユーザーデータを実環境で削除する操作．
- 明示的な承認を得ていないpush，PR作成，デプロイ．

上申は[共通CRPack形式](../README.md#実装前に計画とテスト設計を承認する)で提示し，明示的な承認を記録してから進めます．

## Context Pointers

| 強度   | ソース                                                | 読む条件 / 用途                            | 最終確認日 |
| ------ | ----------------------------------------------------- | ------------------------------------------ | ---------- |
| must   | `AGENTS.md`，`CLAUDE.md`，`docs/conventions.md`       | 常時適用される配置，型，検証規約           | 2026-08-26 |
| must   | GitHub Issue #211                                     | 要求範囲と画面仕様                         | 2026-08-26 |
| must   | `docs/context-cards/frontend-architecture-routing.md` | `/rooms/manage`とredirectを追加するとき    | 2026-08-26 |
| must   | `docs/context-cards/api-data-schema.md`               | GET，POST，DELETEの呼び出しを変更するとき  | 2026-08-26 |
| must   | `docs/context-cards/room-calendar-domain.md`          | CSV登録と進捗部屋データを扱うとき          | 2026-08-26 |
| should | `docs/context-cards/ui-design-system.md`              | 一覧，ボタン，確認ダイアログを設計するとき | 2026-08-26 |

- **調査結果**: バックエンドの`dateBegin`は`time_start >= dateBegin`として処理されるため，進行中の部屋を含めるには当日開始時刻から取得し，終了済みをクライアントで除く必要がある．削除権限は`privileged`ではなく，対象roomの`admins`にリクエストユーザーが含まれるかで判定される．CSV登録では登録者だけが`admins`へ設定される．
- **承認済みの判断**: 管理画面に全roomを表示しつつ，現在ユーザーが`admins`に含まれるroomだけを選択可能にするA案を採用する．全roomを削除できる要件は，バックエンドの権限または一括削除APIを扱う別Issueの範囲とする．

## Current State

- **完了**: 初期実装`30db737`に加え，承認済みA案として取得開始を当日0時へ変更し，admins内外のroomを一覧へ残しながら選択可否を制御した．本番ビルドと全13テストは成功した．
- **進行中**: なし．ローカル実装と検証は完了した．
- **次の一手**: レビュー後，必要であれば明示的な承認を得てpushとPR作成を行う．
- 詳細は `handoff.md` を参照します．

## Changelog

| version | date       | 変更内容                                                                      | 理由 / 承認                                                                                |
| ------- | ---------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| 1       | 2026-08-26 | 初版                                                                          | Issue #211の実装依頼に基づき，現行APIで実行可能な計画と受け入れプロパティを草案化した．    |
| 2       | 2026-08-26 | Conceptual PlanとP1からP5の承認を記録し，テスト設計案を追加した．             | userが第1 CRPackを承認したため．                                                           |
| 3       | 2026-08-26 | テスト設計の承認を記録し，ミッションをactiveへ変更した．                      | userがVue Test Utilsとjsdomを用いる第2 CRPackのB案を承認したため．                         |
| 4       | 2026-08-26 | 実装と自動検証の完了状態，Context Card更新の必要性を記録した．                | P1からP5の実装と承認済みテストが完了したため．                                             |
| 5       | 2026-08-26 | 実装commitと最終検証を固定し，ミッションをclosedへ変更した．                  | `30db737`でP1からP5と回帰検証がすべてpassしたため．                                        |
| 6       | 2026-08-26 | バックエンド照合で判明した期間・削除権限の差異を記録し，activeへ戻した．      | 承認済みスローモート条件に該当し，実環境の削除可否がUIの`privileged`判定と一致しないため． |
| 7       | 2026-08-26 | 追加CRPackのA案，更新後のP2・P3，対応するテスト境界を承認済みとして記録した． | userが全roomを表示し，adminsに含まれるroomだけを選択可能にするA案を承認したため．          |
| 8       | 2026-08-26 | A案の取得期間，選択可否，権限表示と対応テストの実装完了を記録した．           | 本番ビルドと全13テストが成功し，追加CRPackの要求を満たしたため．                           |
| 9       | 2026-08-26 | A案のcommitと同一SHAで最終検証を固定し，ミッションをclosedへ変更した．        | `7b11ba2`でP1からP5と回帰検証がすべてpassしたため．                                        |
