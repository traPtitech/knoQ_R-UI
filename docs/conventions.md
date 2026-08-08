# UI コーディング規約

knoQ_R-UI (Vue 3 + TypeScript + UnoCSS のフロントエンド) のコーディング規約をまとめたものです。
**機械的に検証できる項目はすべて `eslint.config.ts` で強制** しています。このドキュメントは「なぜそのルールなのか」「lint で表現できない設計意図と運用」を残すためのものです。AI エージェントは lint が指摘した違反を回避しようとするのではなく、ここに書かれた意図に沿って書き直してください。

## スタック

- Vue 3 (Composition API, `<script setup>`) + TypeScript + Vite
- Pinia (状態管理), Vue Router (ルーティング)
- UnoCSS (スタイリング、Wind3 + Attributify + Icons プリセット)
- ESLint + Prettier
- API クライアントは OpenAPI から `openapi-typescript` で型生成、`openapi-fetch` で呼ぶ

## ディレクトリ構成と責務

- `src/lib/api/` — `schema.d.ts` は OpenAPI から自動生成。**手で編集しない / lint・format 対象外**
- `src/components/` — アプリ全体で再利用する UI 部品 (汎用)
- `src/composables/` — `useXxx` 形式の再利用ロジック (副作用・リアクティブ状態を含む)
- `src/features/<feature>/` — ドメイン単位の機能フォルダ。`components/`, `composables/`, `types.ts`, `mock/` などを内側に持つ
- `src/pages/` — ルートに 1:1 対応するページ単位コンポーネント
- `src/layouts/` — ページを包むレイアウト
- `src/router/` — ルーティング定義
- `src/lib/` — ドメイン横断のユーティリティ (`time.ts` など)

責務が複数にまたがる場合は、所属を選ぶ前に「呼ぶ側はどこか」「副作用を持つか」「特定 feature に閉じるか横断か」を考えてください。

## パスエイリアス

`vite.config.ts` で `/@` → `src/` のエイリアスを定義しています。**親相対パス (`../*`) は禁止** (`no-restricted-imports`)。すべて `/@/...` で書くこと。

## 自動チェック

- `.claude/hooks/format.sh` — Edit/Write 直後に Prettier → ESLint `--fix` を該当ファイルに実行
- `.claude/hooks/typecheck.sh` — タスク完了時に `vue-tsc --noEmit` を実行 (ソースを編集したセッションのみ)
- `.husky/pre-commit` — コミット時に lint-staged (ESLint+Prettier) と `npm run type-check` を実行

エラーが出た場合は自動修正で済むものは直り、残ったエラーは AI にフィードバックされて再修正を促します。

初回セットアップ時は `npm install` の後、husky の `prepare` スクリプトが `.husky/` を有効化します。

---

## lint で強制している規約と意図

### Vue コンポーネント

- **`<script setup lang="ts">` を必須化** (`vue/component-api-style`, `vue/block-lang`)
  - Options API と Composition API の混在はレビュー時の認知コストが高い。書き方を一本化することで読み手はパターンマッチに集中できる。`<script>` を JS で書くと型の恩恵を失うため `lang="ts"` も必須。
- **`defineProps` / `defineEmits` は型ベース宣言のみ** (`vue/define-props-declaration`, `vue/define-emits-declaration`)
  - ランタイム宣言 (`{ type: String, required: true }`) は TS 型と二重管理になり、片方を更新し忘れた瞬間に乖離する。型ベースなら TS 型が Single Source of Truth になる。
  ```ts
  // OK
  const props = defineProps<{ userId: string; isActive?: boolean }>()
  const emit = defineEmits<{ (e: 'select', id: string): void }>()
  ```
- **`<style>` ブロック禁止** (`vue/no-restricted-block`)
  - スタイルは UnoCSS に集約してデザイントークン (色 / 間隔 / タイポ) を一元管理する。`<style scoped>` はクラス衝突回避の動機で増えがちだが、UnoCSS を使えば衝突しないため不要。スタイル方針が二系統に分裂するのを防ぐ。
- **SFC ブロック順序: `<script setup>` → `<template>`** (`vue/block-order`)
  - 「先にロジック、次にテンプレート」の順で読む方が概念フローとして自然。

### TypeScript

- **`any` 禁止** (`@typescript-eslint/no-explicit-any`)
  - `any` は型システムを部分的に無効化し、リファクタ時に静かにバグを通す。未知の型を扱いたいときは `unknown` を使い、絞り込みを強制する。
- **親相対 import 禁止** (`no-restricted-imports`)
  - `../foo` はファイル移動でリンクが切れる。読み手も深さが直感的に分からない。`/@/` エイリアスは `src` ルートからの絶対参照で安定し grep もしやすい。

### 命名

- **`.vue` は PascalCase / `.ts` は camelCase** (`unicorn/filename-case`)
  - Vue コンポーネント以外で PascalCase ファイルを作ると、ファイル名から「これはコンポーネントではない」が一目で分かる利点を失う。逆も同様。

### コード品質

- **ネストした if 禁止** (`no-restricted-syntax`)
  - 条件の組み合わせが見えにくく読み手の認知負荷が高い。早期 return / ガード節 / 関数分割で平坦化し、各分岐の責務を明確にする。`else if` チェーンは縦深さが増えないため許可。
- **コールバックはアロー関数で書く** (`prefer-arrow-callback`)
  - `function` 式は独自の `this` を持つため、Composition API や非同期処理で `this` を意図せずシャドウする事故が起きやすい。アロー関数は `this` を字句的に継承するためこの種のバグを構造的に防げる。auto-fix 対応。
- **`eslint-disable` には必ず理由を書く** (`@eslint-community/eslint-comments/require-description`)
  - 理由なし disable が蓄積するとルール自体への信頼が薄れ、ルール見直しの判断もできなくなる。

### UnoCSS

- **`@unocss/eslint-config/flat` を適用**
  - クラス順序など UnoCSS 標準のルールセットを有効化。順序統一で diff のノイズを減らし、共通スタイルの差分を見やすくする。

---

## lint で表現できない設計方針

### API クライアント

- **`src/lib/api/` から `openapi-fetch` クライアントを直接 import して使う**
- **ラッパー層やストア経由を新規導入しない**
  - 早すぎる抽象は将来の API 変更時に「ラッパー側も追従させる」二重作業を生む。必要になった時点で設計し直す方針。
- スキーマ変更時は `npm run generate` で `src/lib/api/schema.d.ts` を再生成する。生成物は **手で編集しない**。

### UnoCSS の使い方

- **uno.config.ts の `theme` / `shortcuts` を優先して使う**
  - 色 (`text-text-primary`, `bg-surface-primary`, …)、ボタン (`btn-primary`)、カード (`card`)、入力 (`input-base`) などは shortcut として定義済み。同じパターンが 2 回以上現れたら shortcut 化を検討する。
- **任意値 (`w-[317px]` 等) は最小限**
  - デザインシステム外の値が紛れ込むサインなので、まず `uno.config.ts` の `theme` で表現できないか確認する。`text-[16px]` のような shortcut 内の任意値は許容 (見出しサイズ等は数値の意味が直接的)。
- **アイコンは `presetIcons` 経由**
  - `<span class="i-mdi:account" />` のように iconify セットから直接使う。SVG をコピペで持ち込まない。
- **`preflights` でグローバルスタイルを当てている**
  - body 背景や全体テキスト色は `uno.config.ts` の `preflights` で一元管理。コンポーネント側で `body` を触らない。

### 型の書き方バランス

- 型は **推論を優先**。冗長な明示は避ける (`const x: number = 1` のような明示は不要)
- ただし関数の引数・戻り値・公開 API は **明示** して契約を読み手に伝える
- lint で判定不可な主観領域なのでレビュー時の議論で揃える

### import の書き方

- すべての import は **`/@/...` エイリアス**で書く (lint で強制)
  - 親相対 (`../foo`) はファイル移動でリンクが切れる / 階層数から元の場所を逆算する必要がある / grep しづらい、と短所しかない。`/@/` は `src` ルートからの絶対参照なので位置感覚が安定する。
- UnoCSS のクラス順序は `@unocss/order` ルール (auto-fix) が `eslint --fix` で並べ替えるので、手で並べ替える必要はない。

### コメント

- WHAT (何をしているか) ではなく WHY (なぜそうしているか) を書く
- やむを得ず `eslint-disable` を使う場合は **なぜその例外が必要か** をコメントで残す (lint でも強制)
