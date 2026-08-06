# knoQ_R-UI - AI エージェント向けエントリポイント

このリポジトリで作業する際は，着手前に次の最小セットを読むこと．

- [`docs/conventions.md`](./docs/conventions.md) - Vue 3，TypeScript，UnoCSS のコーディング規約と設計意図．
- [`docs/context-cards/project-overview.md`](./docs/context-cards/project-overview.md) - プロジェクト全体の短い案内．

@docs/conventions.md
@docs/context-cards/project-overview.md

## Context Card のロード規則

- レジストリは [`docs/context-cards/index.yaml`](./docs/context-cards/index.yaml)，カード本体は `docs/context-cards/<id>.md` にある．
- レジストリの `tags` と各カードの `load_when` を確認し，現在の作業に一致するカードだけを読む．全カードを一括ロードしない．
- `frontend` / `routing` は画面，ルーター，ディレクトリ責務を変更するときにロードする．
- `api` / `data` / `schema` は API 呼び出し，取得状態，OpenAPI 生成型を変更するときにロードする．
- `event` / `draft-event`，`room` / `calendar`，`ui` / `design-system` は対応するドメインを変更するときにロードする．
- `quality` / `tooling` は検証設定，テスト，ビルド，Git hook を変更するときにロードする．
- 本文中の `[[card-id]]` は，その追加情報が必要な場合だけ辿る．

## ミッション運用

- 1つのまとまった機能追加，バグ修正，リファクタリング，調査を伴う変更では `start-mission` スキルを使う．独立した対話セッションとPRを複数立ち上げる場合は `start-multi-mission` を使う．必要になった時点で [`docs/missions/README.md`](./docs/missions/README.md) を読み，質問，レビュー，軽微な単発編集にはミッションを作らない．
- 既存ミッションの続きでは，新しいミッションを作らず，該当する `docs/missions/<mission-id>/mission-brief.md` と `handoff.md` から再開する．

## 共通の作法

- カードは圧縮された案内であり，コードの代替ではない．変更や提案の前に `source_pointer` の実物を確認する．
- カードと実装の不一致を見つけたら，本文，`source_pointer.last_checked`，必要なら `retirement_status` と `index.yaml` を同じ変更で更新する．
- 機械的に検証可能な規約は ESLint，Prettier，vue-tsc で強制している．lint 指摘を回避するためだけの書き換えはせず，`docs/conventions.md` に書かれた意図に沿って直す．
- ドキュメントは `docs/<topic>/` 配下へ置き，AI 向けと人間向けで分けず topic で整理する．必要な場合だけこの入口からリンクする．
