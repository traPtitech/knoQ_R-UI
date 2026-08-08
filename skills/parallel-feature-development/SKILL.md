---
name: parallel-feature-development
description: 1つの調整セッションから，2件以上の実装タスクをsubagentまたはagent teamへ割り当てる．各担当は分離したGit worktreeで作業し，調整役がcommitをレビューして1つの統合ブランチへまとめる．1人のエージェントから統合済みの成果を受け取りたい場合に使う．利用者が担当ごとに対話したり，独立したPRを作ったりする場合はstart-multi-missionを使う．
---

# Parallel Feature Development

互いに独立した機能を並行実装し，複数のエージェントが同じcheckoutを編集しないようにする．計画，統合，破壊的操作，ユーザーとの対話は，すべて調整役が担当する．ユーザーが各担当と個別に対話したい場合や，ブランチごとにPRを作りたい場合は，このスキルを使わず`start-multi-mission`へ切り替える．

## 前提条件

1. 計画前に，適用される`AGENTS.md`，`CLAUDE.md`，`docs/conventions.md`などのリポジトリガイドを読む．
2. リンクされたworktreeではなく，リポジトリのmain worktreeから実行する．
3. 未追跡ファイルを含め，作業ツリーがcleanであることを確認する．既存のユーザー変更を自動でstash，commit，破棄，コピーしない．
4. 独立して意味のある進捗を出せる実装タスクが，2件以上あることを確認する．
5. 実行環境が正式に提供する並行worker機能を使う．並行workerを利用できない場合は，ユーザーの承認後にworktreeだけを作り，各worktreeでエージェントセッションを開く方法を案内する．入れ子のagent CLI processを自動起動しない．

## 分離方法を選ぶ

通常はGit worktreeを使う．分担前に[ツール対応表](references/tool-adapters.md)を読み，現在の実行環境へ手順を割り当てる．ユーザーがcontainer，Codespaces，cloud実行，より強い分離を求めた場合は，[分離方法の選び方](references/isolation-strategies.md)も確認する．

- Vue，TypeScript，UnoCSS，テスト，ドキュメントの通常変更にはworktreeを使う．
- native dependency，信頼できないコマンド，競合するtoolchainなどにより，実行環境を分離する利点が追加コストを上回る場合だけ，各worktreeへcontainerを追加する．
- Codespacesまたはmanaged agent cloudは，ユーザーがremote実行を求めた場合や，local resourceの制約で作業が難しい場合に限る．課金またはremote resourceを作る前に承認を得る．

containerはソース分離の代わりにならない．1つの書き込み可能なcheckoutを，複数のエージェントへbind mountしてはならない．

## Phase 1：編集前に分担を設計する

1. 各機能を，受け入れ条件を持つ限定された成果へ言い換える．
2. 依存関係図とファイル所有表を作る．対象になりそうなpage，feature directory，共通component，router，API schema，test，設定ファイルを含める．
3. 共通の前提作業は，明示的な直列phaseへ移す．同じ書き込み対象を2人へ割り当てない．
4. `src/router/index.ts`，`uno.config.ts`，`package.json`，lockfile，生成済みAPI schema，共通UI componentなど，競合しやすいファイルを特定する．1タスクが排他的に所有する場合を除き，調整役が担当する．
5. 開発に必要なignored local fileを確認する．明示的な承認なしに，`.env`，credential，その他のignored dataをworktreeへコピーしない．
6. base ref，task slug，branch名，worktree path，所有表，直列の前提作業，統合順序，検証コマンドを提案する．
7. worktreeの作成や実装担当の起動前に，ユーザーの承認を得る．

task slugは，小文字の英字，数字，hyphenだけで構成し，48文字以内にする．

## Phase 2：分離したworktreeを作る

承認後に`20260806-153000`のようなrun IDを決め，次を実行する．

```bash
node skills/parallel-feature-development/scripts/worktree-manager.mjs create \
  --run 20260806-153000 \
  --base HEAD \
  --task event-pagination \
  --task profile-editor \
  --task room-search \
  --task integration
```

スクリプトは，次のworktreeとbranchを作る．

```text
.agent-worktrees/<run-id>/<task>
agent/<run-id>/<task>
```

同時に，ignored manifestを`.agent-worktrees/<run-id>/manifest.json`へ書き出す．manifestは実行時の状態であり，リポジトリの成果物ではない．

各実装worktreeで`npm ci`を実行し，依存関係を個別にインストールする．networkとdiskに余裕がある場合だけ，インストールを並行実行する．`node_modules`を共有したりsymlinkしたりしない．Viteなどのツールが，その中へcacheを書き込む可能性がある．

## Phase 3：実装を分担する

利用可能な並行数の範囲で，独立した実装タスクごとにworkerを1つ起動する．調整役のslotを1つ残す．ユーザーのコンテキストを持つのは調整役であり，ワークフロー全体を1人のforked workerへ委譲しない．各workerへ，次の情報をすべて渡す．

- worktreeの絶対pathと，想定するbranch．
- 機能要件と受け入れ条件．
- 所有するファイルとdirectory．
- 変更してはならない共有ファイル．
- 適用されるリポジトリ指示と検証コマンド．
- browser検証が必要な場合は，一意の開発server port．
- 担当範囲外の依存関係や所有競合を見つけたら，編集前に報告すること．
- push，merge，rebase，worktree削除，他タスクのworktree編集を禁止すること．
- 完了して検証した実装を，担当branchへcommitすること．

依頼文には，次の構造を使う．

```text
Work only in <absolute-worktree-path> on branch <branch>.
Confirm the repository root and branch before editing.

Deliverable: <bounded feature>
Acceptance criteria: <criteria>
Owned paths: <paths>
Do not edit: <shared or other-agent paths>

Read the applicable AGENTS.md and CLAUDE.md files and docs/conventions.md. Install dependencies with npm ci if needed.
Run focused tests, npm run lint, and npm run type-check. Run browser validation on port <port> when the feature changes visible UI.
If work requires a file outside the owned paths, stop that part and report the dependency to the coordinating agent.
Commit the verified implementation. Do not push, merge, rebase, or manage worktrees.

Return the commit SHA, changed files, validation results, and remaining risks.
```

workerの実行中に要件が変わった場合は，影響を受けるworkerだけへ伝える．2つのタスクが共通の前提作業を見つけた場合は，該当する編集を止める．共通base上で前提作業を直列に実装してから再開する．

## Phase 4：各担当の成果をレビューする

すべてのworkerを待ち，次のコマンドで状態を確認する．

```bash
node skills/parallel-feature-development/scripts/worktree-manager.mjs status \
  --run <run-id>
```

各タスクについて，次を確認する．

1. 報告されたcommitが想定branchに存在し，記録したbase commitから派生していること．
2. `git diff --stat <base>..<branch>`と`git diff <base>..<branch>`の内容．
3. worktreeがcleanで，変更ファイルが所有表と一致すること．
4. 変更した振る舞いを，焦点を絞ったテストが実際に検証していること．
5. 未完成または担当範囲外の変更があれば，担当workerが自分のworktreeで修正すること．

commitが存在するという理由だけで統合してはならない．

## Phase 5：直列に統合する

専用のintegration worktreeとbranchを使う．承認したtask commitを依存順にcherry-pickする．競合はintegration worktreeだけで解消し，複数のworkerへ同じ競合を同時に触らせない．

統合後に，次を実行する．

```bash
npm ci
npm run lint
npm run type-check
npm exec -- vitest run
npm run build
```

ユーザーに見える変更では，未使用のportでViteを起動し，browserから統合後の振る舞いを確認する．変更した振る舞いを安定して検証できる場合は，焦点を絞ったテストを追加または更新する．

統合時に設計の不一致が見つかった場合は，integration branchで修正するか，担当workerへ範囲を絞った追加依頼を送る．別のworkerの所有範囲を黙って広げない．

## Phase 6：結果を報告して引き渡す

次の内容を報告する．

- base commitとintegration branch．
- タスクごとのbranch，commit，変更ファイル，検証結果．
- 統合後の検証結果．
- 解消した競合と，そこで行った判断．
- 残るリスクと手動確認事項．

ユーザーが明示的に承認するまでは，対象branchへのmerge，push，PR作成，worktree削除を行わない．

後片付けの承認を得たら，次を実行する．

```bash
node skills/parallel-feature-development/scripts/worktree-manager.mjs cleanup \
  --run <run-id> \
  --yes
```

cleanupはdirty worktreeを拒否し，すべてのtask branchを残す．
