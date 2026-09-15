---
mission_id: 20260915-msw-faker-mocks
handoff_version: 4
from: Codex
to: user
created_at: 2026-09-15T11:28:54Z
brief_ref: ./mission-brief.md
brief_version: 4
source_commit: 39b4b74b6dc56f72ce3331bcdb7cd6d9bf014575
---

# MSWとFakerの統合版を検証する

## 実装はintegration worktreeにある

起点は`feat/pages`の`11bd0143b692f6885bae514d0eed53e477428fc7`．共有基盤は`e6414c3998a310fccc93d3dfc1a6398aa49ae50f`である．現在の実装場所は次のとおり．

- branch: `agent/20260915-105926/integration`
- worktree: `.agent-worktrees/20260915-105926/integration`
- main worktreeの`mission/20260915-msw-faker-mocks`は共有基盤のcommitを保持している．別ブランチへのmergeは未実施．

通常API担当の`e3527d3`を`4933bb0`，日程調整担当の`763cce3`を`9939252`として取り込んだ．両担当の所有範囲・差分・検証結果をレビューし，競合なく統合した．lockfileはclean installで判明したoptional依存の不整合を`1461845`で修正し，両担当にも同じ修正を適用した．

共有起動，4シナリオ，リセット，HTTPテストと画面テストを追加済み．実装commitは`39b4b74b6dc56f72ce3331bcdb7cd6d9bf014575`．自動検証の証拠はMRPackへ記録済み．

## 手動確認はuserが担当する

2026-09-15の「実際のブラウザでの動作確認は俺がやるから，それ以外やればいいよ」という指示をBrief v4に記録した．ブラウザ連携は利用できず，Chromeの画面操作も中断されたため，ブラウザでの成功はまだ記録していない．この確認を再度Codex側で進めない．

```bash
cd .agent-worktrees/20260915-105926/integration
npm run dev:mock -- --port 8083
```

`/draft-events`を開き，[モック開発ガイド](../../development/mocks.md)に従う．チェック項目は次のとおり．

1. バックエンドなしで一覧とアイコンが表示され，ConsoleにMSWの開始と再現設定が出る．
2. 「日付で指定」で新規作成し，回答の保存・変更，管理画面の集計と日時選択，イベント作成と詳細表示を確認する．部屋あり・なしを分ける．
3. リロードで変更がリセットされる．`empty`・`error`・`slow`の表示を確認する．
4. 同一originで`npm run dev`へ切り替えてリロードするとモックが応答しない．本番previewでもworkerによるモックが起動しない．

## 検証と注意点をMRPackから辿る

実装commit上のclean install，HTTP・画面を含む84テスト，型検査，lint，本番buildはすべて成功した．本番のsourcemap 13件に含まれる150モジュールへMSW・Faker・モック実装が混入していないことも確認済み．実行コマンドと証拠は[MRPack](./merge-rationale.md)へ揃えた．

残る制約は[利用ガイド](../../development/mocks.md#対応範囲と診断を確認する)に記載した．日程調整は暫定HTTP契約であり，正式APIへの接続は別途対応が必要となる．既存の「曜日で指定」は候補日を生成しない．対象外APIの再現や共通`useApiFetch`のエラー処理は拡張していない．

## 再開時に読むもの

| 強度   | ポインタ                                            | 確認すること                     | 出所 / 最終確認日       |
| ------ | --------------------------------------------------- | -------------------------------- | ----------------------- |
| must   | `mission-brief.md`と`test-design.md`                | 承認範囲とuser担当のブラウザ確認 | Brief v4 / 2026-09-15   |
| must   | `src/mocks/environment.ts`，`browser.ts`，`node.ts` | 共有定義，起動，未定義APIの遮断  | 統合実装 / 2026-09-15   |
| must   | `src/features/draft-event/api.ts`と`mocks/`         | 暫定契約と状態更新               | 統合実装 / 2026-09-15   |
| must   | `merge-rationale.md`                                | 最終検証の対象commitと証拠       | MRPack / 2026-09-15     |
| should | `docs/development/mocks.md`                         | 起動・リセット・追加手順         | 利用ガイド / 2026-09-15 |

push，PR，missionブランチへのmerge，worktree削除は承認されていない．担当worktreeとbranchは残す．
