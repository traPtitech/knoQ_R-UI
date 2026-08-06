---
id: quality-tooling
tags: [quality, tooling]
priority: medium
load_when: 'lint，format，type-check，test，build，Git hook の設定や実行方法を変更するとき'
source_pointer:
  - path: package.json
    last_checked: 2026-08-06
  - path: eslint.config.ts
    last_checked: 2026-08-06
  - path: prettier.config.js
    last_checked: 2026-08-06
  - path: tsconfig.json
    last_checked: 2026-08-06
  - path: vite.config.ts
    last_checked: 2026-08-06
  - path: .husky/pre-commit
    last_checked: 2026-08-06
  - path: .claude/hooks/format.sh
    last_checked: 2026-08-06
  - path: .claude/hooks/typecheck.sh
    last_checked: 2026-08-06
  - path: tests/unit/sample.spec.ts
    last_checked: 2026-08-06
retirement_status: active
access_notes: all-roles
---

# 品質管理とツール

## 概要

主要コマンドは `npm run lint`，`npm run type-check`，`npm run test`，`npm run build`，`npm run format` である．ESLint は TypeScript，Vue，accessibility，UnoCSS，Prettier 連携とプロジェクト固有規約を適用する．pre-commit は lint-staged の後に型検査を実行する．

## 不変条件

- 変更範囲に応じて検証を選ぶ．Markdown / YAML のみなら Prettier と構造検査，アプリケーションコードなら ESLint と `vue-tsc --noEmit`，動作へ影響する変更なら関連テストと build を追加する．
- `npm run build` は型検査の後に Vite build，`npm run test` は Vitest UI と V8 coverage を有効にする．CI 相当の非対話実行が必要な場合は package script の実体を確認して適切な Vitest オプションを選ぶ．
- `src/lib/api/schema.d.ts` と `src/env.d.ts` は ESLint の対象外である．生成物の除外を理由に手書きコードの検証を弱めない．
- `.claude/hooks/format.sh` は編集された source file に Prettier と ESLint fix を実行し，`.claude/hooks/typecheck.sh` は source file を触ったセッションの終了時だけ型検査する．手動検証が不要になるわけではない．
- 現在の unit test は `tests/unit/sample.spec.ts` の smoke test 1 件だけである．既存テストの存在を過大評価せず，変更した振る舞いに対応するテストを追加する．
- `src/lib/api/schema.d.ts` の再生成手順は [[api-data-schema]] を参照する．
