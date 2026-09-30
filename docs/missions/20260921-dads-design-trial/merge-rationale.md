---
mission_id: 20260921-dads-design-trial
status: ready-for-review
generated: 2026-09-30
base_commit: 17cc4f9c3c45dedaf17f02f5499c8e56819c1795
---

# DADSを参考にした試作の確認結果

既存のブランド配色を使い，太字の見出しと48pxを基本にしたフォーム部品へ変更した．トップページは今日の予定と自分の予定を並べ，作成画面は3つの入力領域に整理した．採用判断用の試作であり，マージ承認を示すものではない．

変更は上記base commitからの試作差分．環境はmacOS，Node v24.12.0，npm 11.6.2．画面の検証日は2026年9月21日．Draft PRへの保存にあたり，9月30日に最終ソースのlint，型検査を含むビルド，テスト全体を再実行した．

| ID  | 結果 | 証拠                                                                                                                                         |
| --- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| P1  | pass | PC・モバイルのスクリーンショットを目視確認．320，390，768，1440pxで両画面の横はみ出しなし                                                    |
| P2  | pass | 空送信でエラーと最初の項目へのフォーカス，Spaceで選択を開く，検索，Escapeで閉じる，チェックボックス，管理者の追加・削除を確認                |
| P3  | pass | ブラウザのクリックで場所指定，Enterで部屋指定のイベントを各1件作成．日程調整からの2形式の作成，API失敗，確定失敗と重複防止は既存テストで確認 |
| P4  | pass | lintはエラー0件，既存警告9件．型検査を含むbuild成功．Vitestは10ファイル91件成功                                                              |

上表の操作テストは初回試作時の結果．追加指示による配色修正では，色定義がbase commitと完全一致すること，ESLint・型検査・ビルドの成功，2画面のPC・モバイル表示を確認した．追加検証のログは`/private/tmp/dads-brand-build.log`と`/private/tmp/dads-brand-preview.log`にある．

補助文言の削除後は，変更した3つのVueファイルのESLintとPrettier，プロジェクト全体の型検査が成功した．2画面を1440pxと390pxで確認し，横はみ出しとブラウザ実行エラーはなかった．空送信では入力エラーと最初の項目へのフォーカスを確認し，削除した説明への参照が残っていないことも確認した．ログは`/private/tmp/dads-copy-preview.log`と`/private/tmp/dads-copy-form-check.log`．ロジックの変更はなく，この時点ではテスト全体とビルドを再実行していない．

## 検証コマンドと成果物

- `npm run lint`: `/private/tmp/dads-lint.log`．
- `npm run type-check`: 実装後に成功．最終状態は`npm run build`の型検査でも成功．
- `npm run build`: `/private/tmp/dads-build.log`．Webフォント取得を含め成功．
- `npm exec -- vitest run --coverage.enabled=true`: `/private/tmp/dads-tests.log`．
- `node /private/tmp/dads-interactions.mjs`: モック環境のブラウザ検証．結果は`verification.json`．
- スクリーンショット: `/private/tmp/dads-home-desktop.png`，`dads-home-mobile.png`，`dads-create-desktop.png`，`dads-create-mobile.png`，`dads-create-error.png`．

スクリーンショットと詳細ログは一時ディレクトリのため，OSによる削除後は再取得する．

## 変更の境界

本番APIの契約とイベント送信内容は継続した．作成画面はネイティブformのsubmitへまとめ，既存テストの起点もsubmitへ変更した．試作確認に必要だった自分の予定のGETモックと直近の部屋・イベントを補い，日付と欠席条件をHTTPテストで確認した．

共通部品とトークンは他の画面にも適用される．今回，画面全体のデザイン確認を行ったのはホームとイベント作成の2画面である．DADSの完全準拠，ブラウザ間互換性の網羅的確認，本番バックエンドでの操作はこの試作の完了条件に含めない．

ユーザーが許可したローカル試作として実施し，独立したテスト設計の承認を受けたとは扱わない．9月30日にDraft PRとして残す依頼を受け，その保存に必要なcommit，push，PR作成を許可された操作として扱う．正式採用とマージは未承認．

## Draft PRへの保存時の確認

2026年9月30日に`npm run lint`，`npm run build`，`npm exec -- vitest run --coverage.enabled=true`を実行した．lintはエラー0件と既存警告9件，ビルドは型検査とWebフォント取得を含め成功，テストは10ファイル91件すべて成功した．テスト時にはネットワーク制限によるGoogle Fonts取得警告が出たが，テストの失敗はなかった．ログは`/private/tmp/dads-pr-lint.log`，`dads-pr-build.log`，`dads-pr-tests.log`にある．ブランドの色定義がbase commitと一致することも再確認した．

比較先の`feat/pages`は`bd4f4f7735b49d65e54563f7662a9b6277f74e28`まで進み，ヘッダーを`App.vue`へ集約している．今回の依頼は試作の保存であるため，この変更は取り込まず，採用時の調整事項としてPRに記載する．
