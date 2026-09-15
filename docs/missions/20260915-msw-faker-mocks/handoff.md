---
mission_id: 20260915-msw-faker-mocks
handoff_version: 3
from: Codex
to: next
created_at: 2026-09-15T10:38:37Z
brief_ref: ./mission-brief.md
brief_version: 3
source_commit: 11bd0143b692f6885bae514d0eed53e477428fc7
---

# Handoff / Continuity Pack: MSWとFakerでモックAPIとデータを構造化する

## Current State

- **完了**: 両ゲートと2担当分担の承認をBrief v3へ記録した．第2 CRPackの承認記録日時は2026-09-15T10:56:33Z．
- **進行中**: 共有基盤の実装．
- **次の一手**: 基盤のcommitと検証を終え，worktreeを3件作成する．

## 有効な決定と根拠

| 決定                                                             | 根拠                                                                       | Brief反映 |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------- | --------- |
| A案とP1からP6は承認済み．                                        | 第1 CRPackに対するuserの明示的な承認．記録日時は2026-09-15T10:31:13Z．     | yes       |
| モックは開発・テスト限定とし，既存の日程調整モックを撤去する．   | 本番での疑似動作が終了する扱いを含め，前の回答で提示した方針が承認された． | yes       |
| 起点は`feat/pages`の`11bd014`，現在は同じmissionブランチを使う． | 既存ミッションの継続である．                                               | yes       |
| テストとworktree分担は承認済み．                                 | userが第2 CRPackを明示的に承認した．                                       | yes       |
| GitHub Issueは作成せずローカルで進める．                         | 外部操作は依頼されていない．                                               | yes       |

## 最小再開コンテキスト

| 強度   | ポインタ                                                                  | 必要な理由                                  | 出所 / 最終確認日               |
| ------ | ------------------------------------------------------------------------- | ------------------------------------------- | ------------------------------- |
| must   | `mission-brief.md`                                                        | 範囲と承認状態の正本                        | Brief v3 / 2026-09-15           |
| must   | `skills/start-mission/SKILL.md`                                           | 2つの承認ゲートと，承認後の分担判断         | リポジトリのスキル / 2026-09-15 |
| must   | `src/features/draft-event/mock.ts`，同featureの`types.ts`と`composables/` | 795行の固定データ・状態・疑似通信を移す境界 | 作業ツリー / 2026-09-15         |
| must   | BriefのContext Pointersにある画面とAPIクライアント                        | 日程調整からイベント作成までの依存          | 作業ツリー / 2026-09-15         |
| should | `docs/context-cards/quality-tooling.md`                                   | 既存の部屋管理テストを含む検証手段          | 今回の補正文書 / 2026-09-15     |

## 未解決事項と上申

- **blocker**: 技術的な阻害要因は確認していない．
- **承認待ちCRPack**: なし．
- **未回答の問い**: なし．

## 検証状態

| 確認                                                                                                                | 結果 | 実行日     | 証拠の要約                                                                                      |
| ------------------------------------------------------------------------------------------------------------------- | ---- | ---------- | ----------------------------------------------------------------------------------------------- |
| `npm view msw version engines exports typesVersions --json`とFakerの同等確認                                        | pass | 2026-09-15 | MSW 2.15.0，Faker 10.6.0．Node v24.12.0とnpm 11.6.2は対応範囲内．                               |
| 一時環境での`tsc probe.ts --noEmit --strict --skipLibCheck --module esnext --moduleResolution node --target esnext` | pass | 2026-09-15 | プロジェクトのTypeScriptコンパイラでMSWの3入口とfakerJAの型解決に成功．終了コード0．            |
| 一時環境でのNode実行                                                                                                | pass | 2026-09-15 | `fetch`へのMSW応答と，固定シード・基準日時による日本語データ・日付の再生成が一致．終了コード0． |

一時環境は`npm install --prefix <一時ディレクトリ> --no-save --ignore-scripts --no-audit --no-fund msw@2.15.0 @faker-js/faker@10.6.0`で作成した．参照元はnpmの公開パッケージであり，リポジトリのpackage.jsonとlockfileは変更していない．検査環境はNode `v24.12.0` / npm `11.6.2` / macOS / TypeScript `5.9.3`．これは互換性の小規模検証であり，プロジェクト全体やブラウザの動作確認ではない．

文書4件とカードのPrettier検査，差分・新規文書の空白検査，承認状態・相対リンク・P1からP6の対応検査は2026-09-15T10:40:44Zに成功した．対象は開始commit上の未commit文書である．`natural-japanese`の検査と通読も実施し，Brief・第2 CRPack・Handoffは指摘0件だった．Packと回答文の文長の指摘は，短い状態説明と承認事項を明確にする構成を優先して維持した．

## 探索へのポインタ

- 結論と出典はBriefと第2 CRPackへ反映済み．調査の生ログはリポジトリへ保存していない．
- 生成スキーマにはdraft-eventがない．実サーバーでの提供状況は未確認であり，未実装と断定しない．
- `useApiFetch`のHTTPエラー伝播には既知の注意点がある．共通処理を変更する場合はBriefの相談境界を確認する．

## 再開手順

1. 現在ブランチと`git status --short`を確認し，BriefとこのHandoffを読む．
2. 第2 CRPackへの新しい判断があれば，承認者・日時・理由とともにBriefへ反映する．
3. テスト設計承認後に，共有基盤を実装・検証・commitする．worktree作成前にmain worktreeがcleanで，基盤のSHAを記録済みであることを確認する．
4. 分担も承認済みなら，parallel-feature-developmentのスクリプトで3 worktreeを作る．各担当を別worktreeで起動し，成果をintegrationへ統合する．
