# 独立したPRとして進める条件

## 独立性は未mergeの実装なしで判定する

共通baseから，別ミッションの未merge実装を必要とせず，レビュー，merge，revert，作業再開ができる場合だけ，独立したミッションとみなす．これが独立性の基準である．

次の状態は，依存関係があることを示す．

- 2つのタスクが，同じ新しい共通componentまたはschema変更を必要とする．
- 一方のタスクが，もう一方だけで追加されるsymbolをimportする．
- 両方のタスクが，競合しやすいregistry，router，lockfile，生成物を変更する．
- 一方がmergeされるまで，もう一方の受け入れプロパティを満たせない．

この場合は，前提ミッションを先に作るか，タスクを統合するか，stacked PRを明示的に採用する．stacked PRを独立したPRとは呼ばない．

## 各セッションが自分のPRに責任を持つ

各ミッションセッションは，1つのbranch，Mission Brief，テスト証拠，Merge-Readiness Pack，PRを担当する．pushとPR作成の前には，それぞれユーザーの承認を得る．PRのtargetには，batch manifestの`targetBranch`を使う．sibling missionからコピーしたcommitは含めない．

batchの調整役は，状態を確認して競合を報告できる．mission commitをintegration branchへcherry-pickしたり，すべてのセッションに代わって実装競合を解消したりしない．

## 別のPRが先にmergeされた場合

残るミッションは，target branchより古くなる可能性がある．そのミッションのセッションが，次の順に対応する．

1. target branchの変更と，自分の変更との重なりを確認する．
2. リポジトリ方針に照らして，mergeとrebaseのどちらが適切か説明する．
3. 履歴の書き換えや保護されたGit操作の前に，承認を得る．
4. 自分のworktreeだけでbranchを更新して競合を解消し，受け入れ条件の証拠を取り直す．
5. 新しいbaseと検証の出所を，Mission BriefとMerge-Readiness Packへ反映する．

## 後片付け

worktreeを削除する前に，対話中のagent sessionを終了する．GitHub PRがある場合は，`cleanup --require-merged`を優先する．このoptionを使わない場合は，ミッションを放棄したか，削除しても安全だというユーザーの明示的な確認が必要になる．cleanup後もbranchは残るため，commit済みの作業は復元できる．
