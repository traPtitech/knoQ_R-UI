# 作業のまとめ方で選ぶAgent Skill

このリポジトリには，まとまった開発を管理する3つのAgent Skillがあります．質問，コードレビュー，軽微な単発編集には使いません．初めて利用する場合は，次の表で成果のまとめ方を選び，該当するスキル名を依頼文に書いてください．

## 1つの成果へまとめるか，PRを分けるかで選ぶ

| 作業の形                                              | 使うスキル                     | 成果の単位               |
| ----------------------------------------------------- | ------------------------------ | ------------------------ |
| まとまった作業を1つのブランチで進める                 | `start-mission`                | 1ブランチ，1PR           |
| 複数の作業を別々の対話とPRで進める                    | `start-multi-mission`          | 作業ごとに1ブランチ，1PR |
| 1つの対話から複数エージェントへ分担し，最後に統合する | `parallel-feature-development` | 統合ブランチ，1PR        |

判断軸はPRの数です．`start-multi-mission`では，各セッションが独立したPRまで担当します．`parallel-feature-development`では，1つの調整セッションが作業を分担し，最後に統合ブランチへまとめます．同じ作業で両方を併用しません．

## 利用するエージェントに合わせて呼び出す

### Codex

Codexは依頼内容からスキルを自動で選べますが，確実に指定したい場合は，次のように`$スキル名`から依頼を書き始めるか，CLIとIDE拡張の`/skills`から選びます．

```text
$start-mission イベント検索に状態とタグの絞り込みを追加してください
$start-multi-mission 次の3件を，別々に相談できる独立PRとして進めてください
$parallel-feature-development この実装を分担し，1つのPRへまとめてください
```

### Claude Code

Claude Codeでは，`/start-mission`のようにスラッシュコマンドとして指定します．

## 1つのまとまった作業は`start-mission`で進める

1つのPRで進めるなら，`start-mission`を選びます．目的，終了条件，エージェントが判断できる範囲をMission Briefへ記録し，解決方針とテスト設計の承認を経て，実装からレビュー準備までを管理します．詳しい流れは，[ミッション運用ガイド](../missions/README.md)を参照してください．

## PRを分けるなら`start-multi-mission`を使う

複数のPRへ分けるときは，`start-multi-mission`を選びます．このスキルは，ミッションごとにブランチ，worktree，Mission Brief，対話セッションを用意します．各セッションが，自分の作業に必要な承認からPR作成までを担当します．

## 1つのPRへ統合するなら`parallel-feature-development`を使う

`parallel-feature-development`が返すのは，統合済みの1つの成果です．調整セッションが実装を分担し，各担当のworktreeで作られた変更をレビューして統合します．担当ごとの対話やPRを個別に管理したい場合には使いません．

## 詳細な動作は各`SKILL.md`を確認する

判断条件と対応ツールは，各スキルの正本からリンクされた資料にあります．

- [`start-mission`](../../skills/start-mission/SKILL.md)
- [`start-multi-mission`](../../skills/start-multi-mission/SKILL.md)
- [`parallel-feature-development`](../../skills/parallel-feature-development/SKILL.md)

運用を変更した場合は，スキル本体とこのガイドを同じ変更で更新してください．

## スキルが見つからないとき

リポジトリのルートをworkspaceとして開き，Codexでは`.agents/skills/`，Claude Codeでは`.claude/skills/`に各スキルへのシンボリックリンクがあることを確認してください．追加後のスキルが表示されない場合は，新しいセッションを開始します．それでも解決しない場合は，確認した環境とエラーを添えて，このリポジトリのIssueまたはPRで共有してください．
