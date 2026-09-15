---
id: quality-tooling
tags: [quality, tooling]
priority: medium
load_when: 'lint，format，type-check，test，build，Git hook の設定や実行方法を変更するとき'
source_pointer:
  - path: package.json
    last_checked: 2026-09-15
  - path: eslint.config.ts
    last_checked: 2026-09-15
  - path: prettier.config.js
    last_checked: 2026-09-15
  - path: tsconfig.json
    last_checked: 2026-09-15
  - path: vite.config.ts
    last_checked: 2026-09-15
  - path: .husky/pre-commit
    last_checked: 2026-09-15
  - path: .claude/hooks/format.sh
    last_checked: 2026-09-15
  - path: .claude/hooks/typecheck.sh
    last_checked: 2026-09-15
  - path: tests/unit/sample.spec.ts
    last_checked: 2026-09-15
  - path: tests/unit/roomManagement.spec.ts
    last_checked: 2026-09-15
  - path: src/mocks/node.ts
    last_checked: 2026-09-15
  - path: tests/unit/mockUiSupport.ts
    last_checked: 2026-09-15
retirement_status: active
access_notes: all-roles
---

# 変更範囲に合わせて検証を選ぶ

## 標準コマンドと自動検査

主要コマンドは`npm run lint`，`npm run type-check`，`npm run test`，`npm run build`，`npm run format`である．ESLintはTypeScript，Vue，アクセシビリティ，UnoCSS，Prettier連携とプロジェクト固有規約を適用する．pre-commitでは，lint-stagedの後に型検査を実行する．

## 変更時に守ること

- 変更範囲に応じて検証を選ぶ．Markdown / YAML のみなら Prettier と構造検査，アプリケーションコードなら ESLint と `vue-tsc --noEmit`，動作へ影響する変更なら関連テストと build を追加する．
- `npm run build` は型検査の後に Vite build，`npm run test` は Vitest UI と V8 coverage を有効にする．CI 相当の非対話実行が必要な場合は package script の実体を確認して適切な Vitest オプションを選ぶ．
- `src/lib/api/schema.d.ts`，`src/env.d.ts`，MSW生成workerはESLintの対象外である．coverageと分離worktreeも走査から除く．生成物の除外を理由に手書きコードの検証を弱めない．
- `.claude/hooks/format.sh` は編集された source file に Prettier と ESLint fix を実行し，`.claude/hooks/typecheck.sh` は source file を触ったセッションの終了時だけ型検査する．手動検証が不要になるわけではない．
- unit testには，`tests/unit/sample.spec.ts`のsmoke testと，`tests/unit/roomManagement.spec.ts`の部屋管理テストがある．部屋管理テストはAPIクライアントと現在ユーザーを`vi.mock`で差し替える．変更した振る舞いに対応する検証を選び，既存テストの範囲を過大評価しない．
- モックの自動検証は`mockContext`，`mockData`，`mockLifecycle`，`mockBootstrap`，`draftMockApi`，`relatedMockApi`，`draftMockUi`，`draftEventCreation`の各specが担う．HTTP・画面テストはMSWを通し，`mockUiSupport.ts`が画面キャッシュと時刻を分離する．起動手順は[モック開発ガイド](../development/mocks.md)を参照する．
- `src/lib/api/schema.d.ts` の再生成手順は [[api-data-schema]] を参照する．
