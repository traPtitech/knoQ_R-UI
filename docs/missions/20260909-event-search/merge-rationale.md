---
mission_id: 20260909-event-search
status: ready-for-review
owner: quaran
implementation_commit: bebfdc4384bcca08b4e1b7c67a9f0fb1d1596912
generated_at: 2026-09-16T20:18:57.783325+09:00
---

# イベント検索の実装と検証

/eventsの未接続検索欄と/searchの仮表示を共通の検索画面へ置き換えた．複数条件のチップ，期間指定，結果の日付グループ化，右下の参加者表示を追加した．

## コミットの分割

1. useApiFetchでHTTPエラーを検出し，キャッシュの成功扱いを防ぐ．共通処理なので検索以外にも影響する．対応テストを同梱．
2. SelectMenuとDropdownMenuがフォーム内で意図せずsubmitしないようにする．
3. 共通のEventCardとEventCardListの表示を整える．参加者は既存ユーザーキャッシュを使い，最大8人を表示する．HomeやCalendarも共通カード変更の対象．
4. 検索条件・取得状態・両ルートへの組み込み．候補はキャッシュを共有し，検索失敗時に古い結果を消す．検索ロジックのテストを同梱．
5. 現在の仕様と検証結果を記録．

整理前の状態はローカルのcodex/backup-213-before-reorganizingに保全済み．origin/feat/pages（bd4f4f7）をマージし，検索ページ2件の競合を解消した．

## レビュー状況

競合解消済み．競合解消分を含む本人確認・レビューは完了．次のレビュアーによるレビュー待ち．

対象: [PR #267](https://github.com/traPtitech/knoQ_R-UI/pull/267)．

## 検証

2026-10-04の競合解消後（e58e185）は，npm ci --ignore-scriptsで依存を揃え，ビルド・型チェック，全133テスト，対象ページのLint・Prettier，差分チェックに成功した．詳細はvalidation.jsonのconflict_resolutionを参照．

以下は上記implementation_commitに対する2026-09-16時点の検証記録．

- npm run build: 成功（型チェックを含む）．
- npx vitest run: 5ファイル，56件成功．検索条件・日付境界・失敗と再試行・応答競合・候補の反映・共有キャッシュキー・共通HTTPエラーを含む．
- 変更したTypeScript/Vueの15ファイルにESLint: 成功．
- git diff --check origin/feat/pages: 成功．
- 初回の全テストは上流の進捗部屋テストでjsdom未導入のため起動失敗．宣言済み依存をインストール後，全テストを再実行して成功した．package.json・lockfile変更なし．ローカル環境のViteは8.3.0，Vitestは4.1.11で，npm ciによるクリーン環境検証ではない．
- Viteの既存\_\_dirname/configLoader警告あり．今回の履歴整理ではブラウザーの見た目の再確認は実施していない．
- 詳細な日時・環境は[validation.json](./validation.json)を参照．

- sandboxのページ・ルート・preview props・ユーザーデータ差し替え用provide/injectを削除した．削除前の状態はローカルのcodex/backup-213-with-sandboxに保全．
