---
id: project-overview
tags: [overview, frontend, architecture]
priority: high
load_when: 'すべての作業の着手時に，リポジトリの目的と主要な境界を確認するとき'
source_pointer:
  - path: package.json
    last_checked: 2026-09-15
  - path: src/router/index.ts
    last_checked: 2026-09-15
  - path: src/lib/api/index.ts
    last_checked: 2026-09-15
  - path: src/features/draft-event/composables/useDraftEvents.ts
    last_checked: 2026-09-15
  - path: src/mocks/environment.ts
    last_checked: 2026-09-15
retirement_status: active
access_notes: all-roles
---

# knoQ_R-UIの全体像

## 通常APIと日程調整では型の契約が異なる

knoQ_R-UIは，Vue 3，TypeScript，Viteで構成されたknoQのフロントエンドである．イベント，進捗部屋，グループ，ユーザー，タグ，カレンダー，iCal，検索，日程調整の画面を持つ．通常のAPI契約にはOpenAPI生成型を使う．日程調整を扱うdraft-eventは，ローカル型の暫定HTTP契約を使う．開発・テストではMSWとFakerを用い，日程調整と必要な通常APIをバックエンドなしで操作できる．

## 変更時に守ること

- 実装前に [`docs/conventions.md`](../conventions.md) を読み，詳細カードは `index.yaml` のタグと `load_when` が作業に一致する場合だけロードする．全カードを一括ロードしない．
- アプリケーションコードは，`src/pages/`，`src/features/`，`src/components/`，`src/composables/`，`src/lib/`，開発・テスト専用の`src/mocks/`の責務に沿って配置する．構成とルーティングの詳細は[[frontend-architecture-routing]]を参照する．
- 通常APIとdraft-eventのデータ境界を混同しない．変更時は[[api-data-schema]]と[[event-draft-event-domain]]の該当箇所を確認する．
- `src/lib/api/schema.d.ts` は生成物であり，手編集しない．
