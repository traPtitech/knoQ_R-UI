# 実行環境ごとのツール対応

`SKILL.md`のワークフローは，特定の実行環境へ依存しない．スキルの検出，呼び出し，並行workerの操作を，以下の対応に沿って現在の製品へ割り当てる．

## Codex

- 正本の`skills/parallel-feature-development`を指す`.agents/skills/parallel-feature-development`からスキルを検出する．
- `$parallel-feature-development`で明示するか，自然言語でワークフローを依頼する．
- Codexのsubagentを並行workerとして使う．main conversationが調整役を務め，入れ子の`codex exec` processを起動しない．
- workerの開始，指示変更，待機，追加依頼には，実行環境が提供するsubagent機能を使う．
- 計画や編集の前に，適用される`AGENTS.md`を読む．
- `agents/openai.yaml`は任意のCodex UIメタデータであり，共通ワークフロー契約には含めない．

## Claude Code

- 同じ正本を指す`.claude/skills/parallel-feature-development`からスキルを検出する．
- `/parallel-feature-development`で明示するか，自然言語でワークフローを依頼する．
- 独立タスクにはClaude Codeのsubagentを使う．worker間で直接調整する必要があり，追加の調整コストに見合う場合だけagent teamを使う．
- main conversationが調整役を務める．調整役はユーザーのコンテキストを保持し，複数workerを管理する必要があるため，このスキルに`context: fork`を追加しない．
- 計画や編集の前に，適用される`CLAUDE.md`と`AGENTS.md`を読む．
- リンクされたworktreeでhookやscriptを使う場合は，そのworktreeから実行されると仮定せず，作業ディレクトリを明示的に確認する．

## 共通規則

- 正本は`skills/parallel-feature-development`に置き，製品ごとのコピーを編集しない．
- 広すぎるpermission grantや，製品固有のtool restrictionを，共通`SKILL.md`のfrontmatterへ追加しない．
- コマンドでは，正本の`skills/parallel-feature-development/scripts/worktree-manager.mjs`を使う．どちらの実行環境でも，同じ指示で動作させるためである．
- 製品にかかわらず，承認境界，worktreeの所有規則，統合レビュー，後片付けの検査を維持する．
