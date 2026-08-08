# 実行環境ごとのツール対応

`SKILL.md`のワークフローは，特定の実行環境へ依存しない．探索，承認ゲート，並行実行，外部操作を，以下の対応に沿って現在の製品へ割り当てる．共通の運用規則は変更しない．

## Codex

- 正本の`skills/start-mission`を指す`.agents/skills/start-mission`からスキルを検出する．
- `$start-mission`で明示するか，自然言語で管理されたミッションを依頼する．
- Conceptual Planとテスト設計のConsultation Request Packには，Codexの計画機能とユーザー入力機能を使う．計画状態の遷移だけでは承認とみなさず，提示した判断に対する肯定的な回答を得る．
- Codexのsubagentは，`$parallel-feature-development`など，利用を指示するスキルを通してだけ使う．調整役の対話がBriefとユーザー判断に責任を持つ．
- 計画や編集の前に，適用される`AGENTS.md`を読む．`agents/openai.yaml`は任意のUIメタデータであり，ワークフロー契約には含めない．

## Claude Code

- 正本の`skills/start-mission`を指す`.claude/skills/start-mission`からスキルを検出する．
- `/start-mission`で明示するか，自然言語で管理されたミッションを依頼する．
- 2つのConsultation Request Packでは，必要に応じてplan modeと`AskUserQuestion`を使う．ユーザーが具体的なConceptual Planまたはテスト設計を肯定していなければ，plan modeの終了だけで承認済みにしない．
- Claude Codeのsubagentは，`/parallel-feature-development`など，利用を指示するスキルを通してだけ使う．調整役の対話がBriefとユーザー判断に責任を持つ．
- 計画や編集の前に，適用される`CLAUDE.md`と`AGENTS.md`を読む．リンクされたworktreeでhookやscriptを実行する場合は，作業ディレクトリを明示的に確認する．

## GitHubとGit

- IssueまたはPRの作成には，利用可能なGitHub connectorか`gh` CLIを使う．実行前にタイトルと本文をそのまま示し，ユーザーの明示的な承認を得る．
- Gitの通常機能で状態を確認し，合意したミッションブランチを作る．初期化スクリプトが要求するclean treeを得るために，既存のユーザー変更を隠したり，stashしたり，破棄したり，commitしたりしない．
- push，PR作成，ブランチやworktreeの削除は，それぞれ独立した外部操作または破壊的操作として扱う．実行直前に，対象のブランチ，remote，リポジトリ，パスを示して承認を得る．
- どの実行環境でも，リポジトリルートから`skills/start-mission/scripts/init-mission.mjs`を使う．テンプレート置換を各製品の編集機能で再実装しない．

## 共通規則

- 正本は`skills/start-mission`に置き，製品ごとのコピーを作らない．
- 実行環境の計画UIにかかわらず，継続ミッションの検出と2つの必須承認ゲートを維持する．
- 承認された判断は，直ちにMission Briefへ記録する．チャットやplan modeの状態を正本にしない．
- 実行環境に対する権限付与を，Issue，push，PR，後片付けに対するユーザー承認の代わりにしない．
