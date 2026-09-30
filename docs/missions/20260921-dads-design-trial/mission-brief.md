---
mission_id: 20260921-dads-design-trial
branch: mission/20260921-dads-design-trial
status: closed
owner: user
assignee: Codex
created: 2026-09-21
last_updated: 2026-09-30
brief_version: 4
github_issue: null
issue_status: not-applicable
---

# DADSを参考に基本UIと2画面を試作する

採用判断のため，共通コンポーネント，トップページ，イベント作成画面を試行用ブランチで改修する．2026年9月30日のユーザー依頼により，試作をコミットし，`origin`へpushして`feat/pages`向けのDraft PRとして保存する．

## 作業範囲と判断

ユーザーの「参考にデザインを修正」「試行用ブランチを切って」という依頼を，この範囲のローカル試作の実施許可として扱う．正式採用の承認は未取得であり，本番導入は行わない．検証方法はエージェントが選定し，ユーザーによる個別のテスト設計承認を得たとは扱わない．今回は試作を具体化してレビューできる状態まで進める．

配色は元のブランドカラーを維持し，DADSの書体，余白，フォームの構成を既存のUnoCSSとVueコンポーネントへ反映する．ユーザーの追加指示により，色定義は試作前の値へ戻す．DADSのReact実装の追加は，既存構成との整合と試作の戻しやすさを考え採用しない．共通トークンとコンポーネントの見た目は他画面にも波及する．画面の再構成は指定された2画面に限る．実画面で自分の予定のモックAPI不足が判明したため，試作表示に必要なGETモックと直近のサンプル予定を補う．API契約と画面の取得処理は変更しない．

## 受け入れ条件と検証

追加したキャッチコピー，見出しの補助文言，フォームの補足説明は，ユーザーの追加指示により削除する．入力ラベル，必須表示，入力エラー，選択状態や処理結果の表示は維持する．

| ID  | 条件                                                     | 検証方法                                       |
| --- | -------------------------------------------------------- | ---------------------------------------------- |
| P1  | 共通UIと2画面で配色，見出し，操作状態が揃う              | PC・モバイルのスクリーンショットと実画面確認   |
| P2  | 入力ラベル，必須表示，エラー表示，キーボード操作が使える | ブラウザで入力・選択・フォーカス・空送信を確認 |
| P3  | 場所入力，既存部屋選択，日程調整からの作成が維持される   | 既存のイベント作成テストとモックでの送信       |
| P4  | 型検査，lint，ビルド，既存テストを通る                   | npm scripts，Vitestの結果                      |

## Autonomy Envelope

- may_decide: ブランドカラーを維持した余白，部品，レイアウトの変更とローカル検証．現在の試作のcommit，`origin`へのpush，`traPtitech/knoQ_R-UI`でのDraft PR作成．
- must_consult: 対象画面の追加，API契約変更，正式採用．
- prohibited: 既存の色定義の変更，PRのマージ，正式採用，デプロイ，実サービスへのデータ作成．

## Context Pointers

- must: `AGENTS.md`，`CLAUDE.md`，`docs/conventions.md`．
- must: `docs/context-cards/project-overview.md`，`frontend-architecture-routing.md`，`ui-design-system.md`，`event-draft-event-domain.md`．
- must: `uno.config.ts`，`src/pages/HomePage.vue`，`src/pages/CreateEvent.vue`と使用する共通UI．
- should: [DADS](https://design.digital.go.jp/dads/)，[ボタン](https://design.digital.go.jp/dads/components/button/)，[入力欄](https://design.digital.go.jp/dads/components/input-text/)．

## Current State

試作と検証を完了し，[Draft PR #256](https://github.com/traPtitech/knoQ_R-UI/pull/256)として保存した．採用判断は未確定．比較先の`feat/pages`ではヘッダー配置の変更が進んでいるため，採用時に調整する．検証結果と確認手順は`handoff.md`と`merge-rationale.md`に記録した．
