---
id: project-overview
tags: [overview, frontend, architecture]
priority: high
load_when: 'すべての作業の着手時に，リポジトリの目的と主要な境界を確認するとき'
source_pointer:
  - path: package.json
    last_checked: 2026-08-06
  - path: src/router/index.ts
    last_checked: 2026-08-06
  - path: src/lib/api/index.ts
    last_checked: 2026-08-06
  - path: src/features/draft-event/composables/useDraftEvents.ts
    last_checked: 2026-08-06
retirement_status: active
access_notes: all-roles
---

# プロジェクト概要

## 概要

knoQ_R-UI は Vue 3，TypeScript，Vite で構成された knoQ のフロントエンドである．イベント，進捗部屋，グループ，ユーザー，タグ，カレンダー，iCal，検索，日程調整の画面を持つ．通常の API 契約は OpenAPI 生成型を使う一方，draft-event は現在 mock API に閉じている．

## 不変条件

- 実装前に [`docs/conventions.md`](../conventions.md) を読み，詳細カードは `index.yaml` のタグと `load_when` が作業に一致する場合だけロードする．全カードを一括ロードしない．
- アプリケーションコードは `src/pages/`，`src/features/`，`src/components/`，`src/composables/`，`src/lib/` の既存責務へ配置する．構成とルーティングの詳細は [[frontend-architecture-routing]] を参照する．
- 通常 API と draft-event のデータ境界を混同しない．通常 API は生成スキーマ，draft-event はローカル型と mock 実装が現時点の事実である．変更時は [[api-data-schema]] と [[event-draft-event-domain]] の該当箇所を確認する．
- `src/lib/api/schema.d.ts` は生成物であり，手編集しない．
