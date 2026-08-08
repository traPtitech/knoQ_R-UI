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

# ページ，機能，共通部品の境界

## ルートとページは明示的に対応付ける

`src/main.ts`はVueアプリへPiniaとVue Routerを登録する．`App.vue`は`router-view`だけを描画する．ページは`src/pages/`，ドメイン機能は`src/features/<feature>/`，共通UIは`src/components/`に置く．ルーターはHistory modeを使い，イベント，部屋，カレンダー，draft-event，グループ，ユーザー，検索，iCalなどのページを公開している．

## 変更時に守ること

- 新しいルート画面は`src/pages/`のページコンポーネントとして作り，`src/router/index.ts`へ明示的に登録する．URLパラメーターはページ側で`useRoute`から読む既存パターンに合わせる．
- 特定ドメインに閉じるコンポーネントやcomposableは`src/features/<feature>/`，横断UIは`src/components/`，横断的なリアクティブロジックは`src/composables/`に置く．
- importには，`vite.config.ts`と`tsconfig.json`が定義する`/@`からの絶対エイリアスを使う．親相対importを新しく追加しない．
- `MainLayout.vue`は存在するが，`App.vue`から全ページへ自動適用されていない．ヘッダーや外枠を変更するときは，対象ページが`AppHeader`を直接描画しているかも確認する．
- APIや取得状態へ触れる変更では，[[api-data-schema]]を追加でロードする．
