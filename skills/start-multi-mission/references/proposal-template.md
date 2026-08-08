# 複数ミッションの作成提案

作成の承認を求める前に，次の構成で提案する．提案段階では何も作らない．例を固定値として流用せず，リポジトリで確認した事実を記入する．

## Batch

- Batch IDと目的．
- local target branchとbase ref．
- session host：Codex CLI，Codex UI，Claude Codeのいずれか．
- 起動方法：標準はコマンド表示．tmuxは別途承認を得た場合だけ使う．

## Missions

各ミッションについて，次を示す．

- ID，タイトル，branch，worktree path．
- 成果と所有境界．
- 非目標．
- 暫定的な受け入れプロパティと，想定する証拠．
- 変更する可能性が高いファイルまたはsubsystem．
- 単独でレビュー，merge，revert，作業再開ができる理由．

## 依存関係と競合箇所

共通component，route，API schema，設定，lockfile，生成ファイル，その他の依存関係を示す．共通の前提作業は，ミッションを独立と判断する前に解消する．

## 承認依頼

準備するbranch，worktree root，Mission文書，session commandを正確に示す．この時点ではIssue，commit，push，PR，対話セッションを作成しないことも明記する．まず`create`を実行するための承認を1つ求め，tmuxによる起動は後から別に承認を得る．
