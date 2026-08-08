# UIコーディング規約

knoQ_R-UIでは，機械的に判定できる規約を`eslint.config.ts`で強制しています．この文書が扱うのは，各ルールを設けた理由と，Lintだけでは判断できない設計方針です．エラーを避けるために形だけ変えるのではなく，ここに示す意図に沿って修正してください．

## 採用技術

- Vue 3のComposition APIと`<script setup>`
- TypeScriptとVite
- 状態管理にPinia，ルーティングにVue Router
- スタイリングにUnoCSSのWind3，Attributify，Iconsプリセット
- 静的検査にESLint，整形にPrettier
- API型の生成に`openapi-typescript`，通信に`openapi-fetch`

## コードは利用範囲と責務で配置する

| 場所                      | 責務                                                     |
| ------------------------- | -------------------------------------------------------- |
| `src/pages/`              | ルートと1対1で対応するページ                             |
| `src/layouts/`            | ページを包むレイアウト                                   |
| `src/router/`             | URLとページを対応付けるルーティング定義                  |
| `src/features/<feature>/` | 特定ドメインに閉じた部品，composable，型，mock           |
| `src/components/`         | アプリ全体で再利用するUI部品                             |
| `src/composables/`        | 複数機能から使う，副作用やリアクティブ状態を含むロジック |
| `src/lib/`                | APIクライアントや時刻処理など，ドメインをまたぐコード    |
| `src/lib/api/schema.d.ts` | OpenAPIから生成するAPI型．直接編集しない                 |

所属に迷ったときは，そのコードを呼ぶ側，副作用の有無，特定のfeatureだけで使うかを確認します．複数の画面から使うという理由だけで，ドメイン固有の部品を共通化しないでください．

## importは`/@`から始める

`vite.config.ts`と`tsconfig.json`は，`/@`を`src/`へ割り当てています．親相対importの`../*`はESLintで禁止しているため，`/@/...`を使います．ファイルを移動しても参照が壊れにくく，参照先もリポジトリ全体から検索しやすくなります．

## 自動検査は編集直後とcommit前に動く

| タイミング            | 仕組み                       | 実行内容                                               |
| --------------------- | ---------------------------- | ------------------------------------------------------ |
| Claude Codeでの編集後 | `.claude/hooks/format.sh`    | 対象ソースへPrettierと`eslint --fix`を実行             |
| Claude Codeの終了時   | `.claude/hooks/typecheck.sh` | ソースを編集したセッションだけ`vue-tsc --noEmit`を実行 |
| commit前              | `.husky/pre-commit`          | lint-stagedと`npm run type-check`を実行                |

初回の`npm install`では，`prepare`スクリプトがHuskyを有効にします．自動検査が通っても，変更した振る舞いに必要なテストとビルドは別途実行してください．

## ESLintで守る規約

### Vueコンポーネント

- `<script setup lang="ts">`を使います．Options APIとComposition APIを混在させず，すべてのコンポーネントでTypeScriptの型検査を有効にするためです．
- `defineProps`と`defineEmits`は型ベースで宣言します．ランタイム宣言とTypeScript型を二重管理しません．

  ```ts
  const props = defineProps<{ userId: string; isActive?: boolean }>()
  const emit = defineEmits<{ (e: 'select', id: string): void }>()
  ```

- `<style>`ブロックは追加しません．スタイルをUnoCSSへ集約し，色，間隔，タイポグラフィを一元管理します．
- SFCのブロックは`<script setup>`，`<template>`の順に置きます．ロジックから表示へ順に読み進められる構成にするためです．

### TypeScriptと命名

- `any`は使いません．未知の値は`unknown`で受け，利用前に型を絞り込みます．
- Vueコンポーネントの`.vue`ファイルはPascalCase，`.ts`ファイルはcamelCaseで命名します．ファイル名から役割を判別できる状態を保ちます．
- 推論できるローカル変数には冗長な型注釈を付けません．関数の引数，戻り値，公開APIには，契約が読み取れる型を明示します．

### 分岐，コールバック，例外コメント

- `if`を入れ子にしません．ガード節，早期return，関数分割で分岐を平らにします．縦方向の深さが増えない`else if`は利用できます．
- コールバックはアロー関数で書きます．`function`式が独自の`this`を持つことで起きる，意図しない参照を防ぎます．
- `eslint-disable`には，その例外が必要な理由を書きます．理由のない無効化を残すと，後からルールを見直せません．

### UnoCSS

`@unocss/eslint-config/flat`を適用しています．クラスの順序は`eslint --fix`が整えるため，手作業で並べ替える必要はありません．順序を統一すると，スタイル変更の差分を追いやすくなります．

## レビューで守る設計方針

### APIクライアントは直接使う

API呼び出しには`src/lib/api/`が公開する`openapi-fetch`クライアントを使います．新しいラッパー層やストアを先に設けると，API変更時に追従する場所が増えます．具体的な必要性が生じるまでは導入しません．

スキーマが変わった場合は，`npm run generate`で`src/lib/api/schema.d.ts`を再生成します．生成物は直接編集しません．次の生成時に変更が失われるためです．

### UnoCSSのtokenとshortcutを優先する

色，ボタン，カード，入力欄には，`uno.config.ts`の`theme`と`shortcuts`を使います．同じスタイルが2回以上現れたらshortcut化を検討してください．`w-[317px]`のような任意値は，既存tokenで表せない固定寸法に限ります．

アイコンは`presetIcons`から，たとえば`<span class="i-mdi:account" />`のように使います．SVGを各コンポーネントへコピーしません．全体の背景色と文字色は`preflights`で設定しているため，コンポーネントから`body`を変更しないでください．

### コメントには理由を残す

コードを読めば分かる処理内容ではなく，その実装を選んだ理由を書きます．制約，例外，避けた選択肢が将来の判断に必要な場合だけコメントを残してください．
