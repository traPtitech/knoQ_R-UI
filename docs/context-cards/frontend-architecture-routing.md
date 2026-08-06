---
id: frontend-architecture-routing
tags: [frontend, architecture, routing]
priority: high
load_when: 'ページ，ルート，レイアウト，機能ディレクトリ，アプリ初期化を変更するとき'
source_pointer:
  - path: src/main.ts
    last_checked: 2026-08-06
  - path: src/App.vue
    last_checked: 2026-08-06
  - path: src/router/index.ts
    last_checked: 2026-08-06
  - path: src/layouts/MainLayout.vue
    last_checked: 2026-08-06
  - path: docs/conventions.md
    last_checked: 2026-08-06
  - path: vite.config.ts
    last_checked: 2026-08-06
retirement_status: active
access_notes: all-roles
---

# フロントエンド構成とルーティング

## 概要

`src/main.ts` は Vue アプリへ Pinia と Vue Router を登録する．`App.vue` は `router-view` のみを描画し，ページは `src/pages/`，ドメイン機能は `src/features/<feature>/`，共通 UI は `src/components/` に置かれる．ルートは History mode で，イベント，部屋，カレンダー，draft-event，グループ，ユーザー，検索，iCal などのページを公開する．

## 不変条件

- 新しいルート画面は `src/pages/` のページコンポーネントとして作り，`src/router/index.ts` に明示的に登録する．URL パラメーターはページ側で `useRoute` から読む既存パターンへ合わせる．
- 特定ドメインに閉じるコンポーネントや composable は `src/features/<feature>/`，横断 UI は `src/components/`，横断リアクティブロジックは `src/composables/` に置く．
- import は `vite.config.ts` と `tsconfig.json` が定義する `/@` からの絶対エイリアスを使い，親相対 import を新規追加しない．
- `MainLayout.vue` は存在するが `App.vue` から全ページへ自動適用されていない．ヘッダーや外枠を変更するときは，対象ページが `AppHeader` を直接描画しているかも確認する．
- API や取得状態へ触れる変更では [[api-data-schema]] を追加でロードする．
