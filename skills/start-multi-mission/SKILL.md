---
name: start-multi-mission
description: 2件以上の独立した開発ミッションを，別々のGit branch，worktree，CodexまたはClaude Codeの対話セッション，PRとして準備する．ユーザーが各セッションと個別に対話したい場合や，タスクごとにPRをレビューしてmergeしたい場合に使う．1つの調整役がすべての作業をintegration branchへまとめる場合は，parallel-feature-developmentを使う．
---

# Start Multiple Missions

ミッションごとに，長期間利用できるworktreeを作る．ユーザーは，各ミッションの対話とPRを別々に管理する．複数ミッションの成果を統合したブランチやcommitは作らず，実装subagentも使わない．

作成の承認を求める前に，[作成提案の型](references/proposal-template.md)を読む．セッションコマンドの準備やtmuxの起動前には，[ツール対応表](references/tool-adapters.md)を確認する．ミッションが関連領域を変更する場合や，別のPRより先にmergeされる可能性がある場合は，[独立PRの進め方](references/independent-pr-workflow.md)も読む．

## 1．独立したミッションへ分ける

1. 適用されるリポジトリガイドと`docs/missions/README.md`を読む．
2. 各成果を，短いタイトル，小文字kebab-caseのslug，作業範囲，非目標，暫定的な受け入れプロパティを持つ個別ミッションへ言い換える．
3. 依存関係と競合箇所を整理する．共通component，router，API schema，設定，lockfile，生成ファイルを含める．
4. 別ミッションの未merge commitがなくても，レビュー，merge，revert，作業再開ができる場合だけ，独立したミッションとして扱う．
5. 共通の前提作業は，先行する独立ミッションへ分ける．密結合した作業は1つのミッションにまとめる．名目上だけ独立したPRの裏に，stacked dependencyを隠さない．
6. すべてのミッションに共通するtarget branchとbase refを決める．通常は，同じローカルブランチをtargetにする．targetには，`start-multi-mission`，`start-mission`，ミッションtemplateを先に反映しておく．これらの基盤を各feature PRへ混入させない．baseを変える場合は理由を記録し，依存関係のある作業を独立ミッションとして扱わない．
7. batch ID，mission ID，タイトル，branch，worktree path，所有境界，target branch，session hostを提案する．
8. branch，worktree，ミッション文書，対話セッションを作る前に，ユーザーの明示的な承認を得る．

batch IDとmission slugには，小文字の英字，数字，hyphenだけを使い，それぞれ48文字以内にする．

## 2．branchとworktreeを作る

承認後に，main worktreeから次を実行する．

```bash
node skills/start-multi-mission/scripts/multi-mission-manager.mjs create \
  --batch 20260806-event-improvements \
  --date 20260806 \
  --base main \
  --target main \
  --mission 'event-filter=Filter events by status and tag' \
  --mission 'event-export=Export an event as iCalendar'
```

managerは，ミッションごとにbranchとworktreeを1つずつ作る．

```text
mission/20260806-event-filter
.mission-worktrees/20260806-event-improvements/20260806-event-filter
```

各worktreeでは，既存の`start-mission`初期化スクリプトを実行する．そのため，各branchは個別の`docs/missions/<mission-id>/`文書一式を持つ．Issue，commit，push，PR，integration branchは作成しない．

作成後に，各Mission Briefへ，承認済みの初期目的，作業境界，target branch，Context Pointerだけを記入する．Conceptual Planとテスト設計の判断は，各ミッションの対話セッションに委ねる．

ignored credentialをコピーせず，`node_modules`も共有しない．必要になった時点で，各セッションが個別に依存関係をインストールする．

## 3．独立したセッションを始める

標準では，セッションを開くコマンドだけを表示する．

```bash
node skills/start-multi-mission/scripts/multi-mission-manager.mjs launch \
  --batch 20260806-event-improvements \
  --agent codex
```

ユーザーは，各コマンドを別々のterminalまたはeditor sessionで開く．すべてのセッションは担当worktreeから始まり，`start-mission`を使って既存ミッションを再開する．ユーザーは，作業範囲，Conceptual Plan，テスト，実装，PR準備を各セッションと個別に相談できる．

ユーザーがlocal sessionの自動起動を明示的に承認した場合は，ミッションごとにtmux windowを1つ作る．

```bash
node skills/start-multi-mission/scripts/multi-mission-manager.mjs launch \
  --batch 20260806-event-improvements \
  --agent claude \
  --tmux \
  --yes
```

この承認なしに，入れ子のagent CLIを起動しない．対話セッションの代わりにinternal subagentを使わない．

## 4．各ミッションが自分のPRを管理する

各セッションは，次の責任を持つ．

- 担当するmission worktreeとbranchだけで作業する．
- Mission Briefを正本として扱う．
- Conceptual Planとテスト設計について，それぞれユーザーの承認を得る．
- 自分のミッションの実装と文書だけをcommitする．
- Issue作成，push，PR作成の前に承認を求める．
- batch manifestの`targetBranch`をPRのtargetにする．
- 自分のMerge-Readiness Packを作り，残るリスクを報告する．

別ミッションのbranchをmerge，rebase，cherry-pick，編集してはならない．batchの調整役は境界を監視するが，実装commitを統合しない．

## 5．batch全体の状態を確認する

次のコマンドで，local branchとworktreeの状態を確認する．

```bash
node skills/start-multi-mission/scripts/multi-mission-manager.mjs status \
  --batch 20260806-event-improvements
```

ユーザーがremote readを許可し，GitHub CLIの認証も利用できる場合は，`--github`でPRの状態を含める．

```bash
node skills/start-multi-mission/scripts/multi-mission-manager.mjs status \
  --batch 20260806-event-improvements \
  --github
```

branch，worktree，dirty state，共通base以降のcommit，Briefの有無，要求された場合はPRのURLと状態を，ミッションごとに報告する．

1つのPRが先にmergeされた場合は，残るミッションのセッションが，自分のbranchをどう更新するか判断する．更新後は，自分の受け入れプロパティを再検証する．別ミッションの履歴を黙って書き換えない．

## 6．ミッションごとに後片付けする

最初に対話セッションを終了し，worktreeがcleanであることを確認する．PRがmerge済みか，ユーザーがミッションの放棄を明示していることも確かめる．その後，後片付けの承認を求め，次を実行する．

```bash
node skills/start-multi-mission/scripts/multi-mission-manager.mjs cleanup \
  --batch 20260806-event-improvements \
  --mission 20260806-event-filter \
  --require-merged \
  --yes
```

batch全体の後片付けをユーザーが明示的に承認した場合だけ，`--mission`を省略できる．cleanupはdirty worktreeを拒否し，mission branchを残す．PRの承認やmerge完了から，後片付けの承認を推測してはならない．
