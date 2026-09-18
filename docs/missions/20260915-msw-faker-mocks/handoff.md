---
mission_id: 20260915-msw-faker-mocks
handoff_version: 7
from: Codex
to: user
created_at: 2026-09-18T06:18:35Z
brief_ref: ./mission-brief.md
brief_version: 7
source_commit: 0a1ee9acdcf093d722ef8f23fbb09053fbc1421d
---

# リポジトリルートでモックを起動して確認する

## 統合版をmissionブランチへ取り込んだ

起点は`feat/pages`の`11bd0143b692f6885bae514d0eed53e477428fc7`．共有基盤は`e6414c3998a310fccc93d3dfc1a6398aa49ae50f`である．現在の実装場所は次のとおり．

- branch: `mission/20260915-msw-faker-mocks`
- worktree: メインのリポジトリルート．
- userの2026-09-18の依頼に基づき，統合版`0a1ee9a`までfast-forwardで取り込んだ．追加の変更は利用ガイドのルート移動と参照・作業記録の更新であり，アプリのコードは統合版と同じである．

通常API担当の`e3527d3`を`4933bb0`，日程調整担当の`763cce3`を`9939252`として取り込んだ．両担当の所有範囲・差分・検証結果をレビューし，競合なく統合した．lockfileはclean installで判明したoptional依存の不整合を`1461845`で修正し，両担当にも同じ修正を適用した．

共有起動，4シナリオ，リセット，HTTPテストと画面テストを追加済み．利用ガイドはリポジトリルートの`MOCKS.md`へ移し，READMEと関連文書のリンクを更新した．ルート配置の変更後，PRのCIで判明したlockfileの不足2件も補った．アプリとテストのコード，既存パッケージのversionは変えていない．

## 手動確認はuserが担当する

2026-09-15の「実際のブラウザでの動作確認は俺がやるから，それ以外やればいいよ」という指示をBrief v4に記録した．この分担は継続する．リポジトリルートで次を実行する．

```bash
npm run dev:mock
```

Viteが表示したURLの`/draft-events`を開き，[モック開発ガイド](../../../MOCKS.md)に従う．チェック項目は次のとおり．

1. バックエンドなしで一覧とアイコンが表示され，ConsoleにMSWの開始と再現設定が出る．
2. 「日付で指定」で新規作成し，回答の保存・変更，管理画面の集計と日時選択，イベント作成と詳細表示を確認する．部屋あり・なしを分ける．
3. リロードで変更がリセットされる．`empty`・`error`・`slow`の表示を確認する．
4. 同一originで`npm run dev`へ切り替えてリロードするとモックが応答しない．本番previewでもworkerによるモックが起動しない．

## 検証と注意点をMRPackから辿る

2026-09-18にリポジトリルートで依存を再取得し，HTTP・画面を含む84テスト，lint，型検査を含む本番buildが成功した．起動した開発サーバーでは，`/draft-events`，モック有効設定を持つ`src/main.ts`，workerファイルの配信を確認した．本番bundleへのモック混入もなかった．検証用サーバーは停止済みである．今回と統合時の結果は，[MRPack](./merge-rationale.md)で対象と日時を分けて記録した．実ブラウザの操作は未確認である．

残る制約は[利用ガイド](../../../MOCKS.md#対応範囲と診断を確認する)に記載した．日程調整は暫定HTTP契約であり，正式APIへの接続は別途対応が必要となる．既存の「曜日で指定」は候補日を生成しない．対象外APIの再現や共通`useApiFetch`のエラー処理は拡張していない．

## 再開時に読むもの

| 強度   | ポインタ                                            | 確認すること                       | 出所 / 最終確認日       |
| ------ | --------------------------------------------------- | ---------------------------------- | ----------------------- |
| must   | `mission-brief.md`と`test-design.md`                | 承認範囲とuser担当のブラウザ確認   | Brief v7 / 2026-09-18   |
| must   | `src/mocks/environment.ts`，`browser.ts`，`node.ts` | 共有定義，起動，未定義APIの遮断    | 統合実装 / 2026-09-15   |
| must   | `src/features/draft-event/api.ts`と`mocks/`         | 暫定契約と状態更新                 | 統合実装 / 2026-09-15   |
| must   | `merge-rationale.md`                                | 最終検証の対象commitと証拠         | MRPack / 2026-09-15     |
| should | `MOCKS.md`                                          | ルートでの起動・リセット・追加手順 | 利用ガイド / 2026-09-18 |

2026-09-18の「よし，pushしてPR作って」に基づき，現在のブランチをpushして[PR #254](https://github.com/traPtitech/knoQ_R-UI/pull/254)を作成した．baseは`feat/pages`．実ブラウザの操作確認とレビューはuserが担当し，CIの最新結果はPRのChecksを参照する．担当worktreeとbranchは残している．
