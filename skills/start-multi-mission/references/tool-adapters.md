# 実行環境ごとのツール対応

branch，worktree，Mission Brief，PR，承認の扱いは，どの実行環境でも変えない．製品固有のコマンドが変えるのは，ユーザーが対話セッションを開く方法だけである．

## Codex

- `.agents/skills/start-multi-mission`からスキルを検出する．
- `$start-multi-mission`で明示するか，別々の対話ミッションとPRを自然言語で依頼する．
- 準備済みのミッションは，`codex -C <absolute-worktree-path> '<prompt>'`で開始する．
- 生成するpromptは`$start-mission`を呼び出し，新しいbranchを作らず既存ミッションを再開するよう指示する．
- managerが同じ入力から同じコマンドを生成し，内容を検証できるため，標準ではCodex CLIを使う．
- local workspaceを扱えるCodex UIでは，準備済みworktreeを別々のworkspaceとして開く．それぞれ別の対話を始め，mission IDとともに`$start-mission`を呼び出す．managerはUI workspaceの作成を自動化しない．
- worktreeごとに，別のterminal，tmux window，Codex UI workspaceを使う．ユーザーから見える対話を，Codex subagentで置き換えない．

## Claude Code

- `.claude/skills/start-multi-mission`からスキルを検出する．
- `/start-multi-mission`で明示するか，別々の対話ミッションとPRを自然言語で依頼する．
- 準備済みworktreeへ移動し，`claude --name <mission-id> '<prompt>'`で開始する．
- 生成するpromptは`/start-mission`を呼び出し，既存ミッションを再開するよう指示する．
- このスキルでworktreeを準備した後は，Claude Codeの`--worktree` optionを使わない．正確なbranch名，path，ミッション文書はmanagerが管理する．

## tmux

- `launch --tmux --yes`は，`knoq-<batch-id>`というdetached tmux sessionを1つ作り，ミッションごとにwindowを1つ用意する．
- CodexとClaude Codeのどちらでも同じ外部tmux構成を使い，batchの動作を実行環境に依存させない．
- managerが表示したコマンドでattachし，windowを切り替えて各ミッションと個別に対話する．
- worktreeを削除する前に，該当windowのagent processを終了する．

## 共通規則

- コマンドの表示はセッションを起動しないため，worktree作成の承認とは別の起動承認を必要としない．
- tmux windowの起動は，課金対象になり得るagent sessionを複数開始する．承認を求める直前に，agent，session名，worktree，ミッション数を示す．
- 生成するCodexまたはClaudeのコマンドへ，権限を迂回するflagを加えない．
- 各セッションは，Issue作成，push，PR作成の前に，それぞれ承認を得る．
