---
id: ui-design-system
tags: [ui, design-system, frontend]
priority: high
load_when: '共通 UI，フォーム，色，余白，アイコン，UnoCSS 設定を変更するとき'
source_pointer:
  - path: uno.config.ts
    last_checked: 2026-08-06
  - path: docs/conventions.md
    last_checked: 2026-08-06
  - path: src/main.ts
    last_checked: 2026-08-06
  - path: src/components/UI/Button/PrimaryButton.vue
    last_checked: 2026-08-06
  - path: src/components/UI/Form/InputField.vue
    last_checked: 2026-08-06
  - path: src/components/UI/DataFetchState.vue
    last_checked: 2026-08-06
  - path: src/components/UI/AnchoredPopover.vue
    last_checked: 2026-08-06
retirement_status: active
access_notes: all-roles
---

# UI とデザインシステム

## 概要

スタイルは UnoCSS に集約され，Wind3，Attributify，Icons，WebFonts の preset を使う．`uno.config.ts` は surface，border，text，status，tag，weekday，room の色トークンと，見出し，button，card，input の shortcut を定義する．共通 UI は `src/components/UI/` に置かれる．

## 不変条件

- 既存の theme token と shortcut を優先し，同じ表現が繰り返される場合は `uno.config.ts` への追加を検討する．任意値は固定フォーマットの寸法など，既存 token で表現できない場合に限定する．
- Vue SFC に `<style>` を追加しない．グローバル背景と基本文字色は UnoCSS の preflight，reset と生成 CSS は `src/main.ts` から読み込まれる．
- アイコンは `presetIcons` が提供する Iconify class を使い，SVG をコンポーネントへ直接埋め込まない．
- 一般化できる UI は `src/components/UI/` の既存部品を再利用または拡張する．フォームは `InputField` など，取得状態は `DataFetchState`，アンカー付き overlay は `AnchoredPopover` の既存契約を先に確認する．
- UI 変更でもコンポーネントの配置とページ境界を変える場合は [[frontend-architecture-routing]] を追加で読む．
