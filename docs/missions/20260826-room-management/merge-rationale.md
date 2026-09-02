---
mission_id: 20260826-room-management
pack_version: 3
generated_by: Codex
generated_at: 2026-09-02T12:55:57Z
source_commit: 8c3dd2391cf47601420af9c79ed81c2e466c35d8
reviewer: user
decision: pending # pending | approved | changes-requested | rejected
non_merge_root_cause: null # property-gap | evidence-missing | tool-gap | scope-drift | other | null
related:
  brief: ./mission-brief.md
  handoff: ./handoff.md
---

# Merge-Readiness Pack: 進捗部屋管理画面を実装する

## サマリー

- **行ったこと**: `/rooms/manage`へCSV一括登録と予約済み進捗部屋の選択削除を統合した．特権ユーザー向け導線，確認ダイアログ，部分失敗処理，`/rooms/new`からのredirect，UIテストも追加した．管理一覧は確認済みroomだけに限定し，ID単位のDELETEを直列実行する．確認済みroomのうち，`admins`外のroomは一覧に残したまま選択不可とした．
- **行わなかったこと**: 部屋編集，1件登録フォーム，バックエンドの一括削除API，OpenAPI生成型の手編集，進捗部屋カレンダーの変更．
- **線引きの理由**: Issue #211とBrief v12で承認された範囲を，既存の`POST /rooms/all`と`DELETE /rooms/{roomID}`だけで実現するため．
- **レビュー推奨箇所**: [`RoomManagementPage.vue`](../../../src/pages/RoomManagementPage.vue)，[`roomManagement.spec.ts`](../../../tests/unit/roomManagement.spec.ts)，[`router/index.ts`](../../../src/router/index.ts)．

## Property Coverage

| ID  | Briefのプロパティ                                                          | 検証                                                                                 | 証拠                                            | 状態 |
| --- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------- | ---- |
| P1  | 確認済みかつ進行中・将来の部屋を開始時刻順で表示し，各取得状態を区別する． | 確認済み・未確認の混在，当日0時のGET，並び順，期限切れ除外，読込，空，取得失敗の試験 | 未確認roomがDOMに存在しないことと各状態のassert | pass |
| P2  | admins内のroomだけ選択でき，取消時はDELETEを呼ばない．                     | admins内外，ボタン状態，取消時0回，二重送信防止を操作試験                            | checkboxの`disabled`とDELETE回数のassert        | pass |
| P3  | 選択可能な各IDを直列に1回ずつ削除し，成功分を除き，失敗分とエラーを残す．  | 制御可能なPromiseで同時実行数の上限1と，1件目の失敗後に2件目を処理する操作試験       | 呼出順・回数，一覧，選択状態のassert            | pass |
| P4  | CSV成功時だけ入力を消して再取得し，失敗時は入力を保持する．                | POST成功・失敗，GET再実行，送信中の二重送信を操作試験                                | POST・GET回数，入力値，`disabled`のassert       | pass |
| P5  | 非特権ユーザーへ操作を隠し，旧URLを転送する．                              | 権限別のページ・ヘッダー表示とmemory routerのredirect試験                            | 管理操作の有無，最終URL，既存`/rooms`のassert   | pass |

## 変更の全体像

- **主要な変更**: `CreateRoom.vue`を`RoomManagementPage.vue`へ統合し，CSV登録に加えてGET一覧とID単位DELETEを実装した．取得開始は当日0時とし，終了済みと未確認のroomを画面側で除く．現在ユーザーがroomの`admins`に含まれる場合だけ削除対象へ選択でき，DELETEは1件ずつ直列実行する．ルーターとヘッダーを管理画面へ接続し，Vue Test Utilsとjsdomをテスト依存へ追加した．
- **影響範囲**: 特権ユーザーの進捗部屋管理，`/rooms/new`の遷移先，ヘッダー導線．API契約と`/rooms`カレンダーは変更していない．
- **差分**: source commit `8c3dd2391cf47601420af9c79ed81c2e466c35d8`．初期実装は`30db737`，API権限に合わせた修正は`7b11ba2`，確認済みroomへの限定と直列削除は`8c3dd23`．

## Evidence and Provenance

| 検証       | 結果 | 実行コマンド                                     | 証拠                                                                |
| ---------- | ---- | ------------------------------------------------ | ------------------------------------------------------------------- |
| lint       | pass | `npm run lint`                                   | 終了コード0．変更外の既存警告10件，追加エラー0件．                  |
| type check | pass | `npm run type-check`                             | 終了コード0．                                                       |
| build      | pass | `npm run build`                                  | 終了コード0．991 modules transformed．                              |
| tests      | pass | `npm exec -- vitest run --coverage.enabled=true` | 2 files，13 tests pass．管理画面はstatements 90.64%，lines 94.35%． |

- **対象 commit**: `8c3dd2391cf47601420af9c79ed81c2e466c35d8`
- **実行環境**: Node `v20.17.0` / npm `10.8.2` / Darwin `24.5.0 arm64`
- **生成日時**: `2026-09-02T12:55:57Z`
- **not-run の理由**: 実ブラウザーでの目視確認は，操作可能なブラウザーが接続されていなかったため未実施．自動UIテストと本番ビルドで代替範囲を検証した．

## 判断と探索の要約

- 一括削除APIは生成スキーマに存在しないため，ID単位DELETEを直列実行するA案を採用した．前のDELETEが完了してから次を送り，部分失敗後も残りを処理する．成功分だけを一覧から除き，失敗分を選択状態で残す．
- バックエンド照合で，`dateBegin`が開始時刻へ適用され，DELETE権限がroomの`admins`で判定されることを確認した．当日0時から取得した結果を`verified`で絞り，確認済みroomだけを表示する．admins外の確認済みroomは一覧へ残したまま選択不可とした．判断と一次情報へのポインタは[`mission-brief.md`](./mission-brief.md)に記録した．
- 破壊的操作のUI回帰を検出するため，純粋関数だけの試験ではなく，Vue Test Utilsとjsdomを使うB案を採用した．
- `CreateRoom.vue`の責務移動とAPI照合結果に合わせて[`room-calendar-domain.md`](../../context-cards/room-calendar-domain.md)を更新した．

## 承認と逸脱

- **Conceptual Plan 承認**: user / 2026-08-26T13:12:25Z / Brief v2
- **受け入れプロパティ承認**: user / 2026-08-26T13:12:25Z / Brief v2
- **テスト設計承認**: user / 2026-08-26T13:16:47Z / Brief v3
- **追加CRPack承認**: user / 2026-08-26T13:45:57Z / Brief v7
- **表示・削除方式の変更承認**: user / 2026-09-02T12:47:13Z / Brief v10
- **更新テスト設計承認**: user / 2026-09-02T12:51:44Z / Brief v11
- **CRPack と結果**: 第1 CRPackで画面統合とP1からP5，第2 CRPackでVue Test Utilsとjsdom，追加CRPackでadminsに基づくA案が承認された．その後，確認済みroomへの限定とDELETEの直列化，対応する更新テスト設計が承認された．
- **Brief からの逸脱**: なし．API照合でスローモート条件に該当したため作業を止め，追加承認後にBriefを更新して再開した．
- **外部操作**: push，PR作成，Issue更新，デプロイは未実施．テスト依存の取得と公開バックエンドの読み取りだけを行った．

## 未解決事項とリスク

- 実ブラウザーの目視確認は未実施．操作可能なブラウザーが接続された環境では，情報密度，狭幅時の折返し，確認ダイアログの見た目を追加確認できる．
- ビルドとテストではGoogle Fontsを取得できない警告が出たが，既存のUnoCSS設定による外部通信であり，終了コードと生成物には影響しなかった．
- Node `v20.17.0`はViteが要求する`20.19+`を下回る警告が出た．今回のビルドは成功したが，開発環境のNode更新が望ましい．
- Lintには変更範囲外の既存警告10件が残るが，今回の変更ファイルに新しい警告やエラーはない．

## Reviewer Decision

- **decision**: pending
- **コメント**: P1からP5の対応表，source commit，未実施の目視確認を基に判断する．
