# knoQ_R-UI — AI エージェント向けエントリポイント

このリポジトリ (knoQ のフロントエンド) で作業する際は、**着手前に必ず** 以下を読むこと。
ドキュメントの本体は `docs/` に集約されています。このファイルは入口 (スタブ) です。

## コーディング規約

- **[`docs/conventions.md`](./docs/conventions.md)** — Vue 3 + TS + UnoCSS のコーディング規約と設計意図。

@docs/conventions.md

## 共通の作法

- 機械的に検証可能な規約は ESLint / Prettier / vue-tsc で強制している。lint 指摘を回避するためだけの書き換えはせず、`docs/conventions.md` に書かれた **なぜ** に沿って書き直すこと。
- ドキュメントを追加・更新する場合は `docs/<topic>/` 配下に置き (AI 向け / 人間向けで分けず topic で切る)、必要なら本ファイルからリンクを足す。AI 専用ファイルは作らない。
