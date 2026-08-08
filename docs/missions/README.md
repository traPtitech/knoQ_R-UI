# まとまった開発を安全に進めるミッション運用

ミッションは，人間とAIエージェントが作業の目的，終了条件，判断できる範囲を共有し，実装からレビューまで同じ前提で進めるための仕組みです．機能追加，バグ修正，リファクタリング，調査を伴う変更のように，複数の判断が必要な作業で使います．

初めてミッションを始める人は，「ミッションが必要か判断する」と「1つのミッションを始める」まで読んでください．承認，証拠，複数ミッションの節は，その場面になったときに参照できます．

## ミッションが必要か判断する

質問，コードレビュー，軽微な単発編集にはミッションを作りません．複数の判断を伴う機能追加，バグ修正，リファクタリング，調査を，1つのブランチとPRで進める場合に`start-mission`を使います．複数作業を別々のPRにするか，1つの成果へ統合するか迷う場合は，[Agent Skill利用ガイド](../skills/README.md)で選んでください．

## Mission Briefが作業の基準になる

ミッションでは，`docs/missions/<mission-id>/`に3つの文書を置きます．チャットで決まった計画や承認は，その場限りにせずMission Briefへ反映します．別の文書と内容が食い違った場合も，Mission Briefを基準に判断します．

| 文書                 | 答える問い                                     | 更新する時期                   |
| -------------------- | ---------------------------------------------- | ------------------------------ |
| `mission-brief.md`   | 何を，どの条件と判断範囲で進めるか             | 着手前と，重要な決定の直後     |
| `handoff.md`         | 別の担当やセッションが，どこから再開するか     | 担当やセッションを切り替える前 |
| `merge-rationale.md` | 受け入れ条件を満たしたと，何を根拠に判断するか | レビューを依頼する前           |

配置は次の形です．

```text
docs/missions/
├── README.md
├── _templates/
├── _guides/
└── <YYYYMMDD-short-slug>/
    ├── mission-brief.md
    ├── handoff.md
    └── merge-rationale.md
```

mission IDは`YYYYMMDD-short-slug`形式にします．たとえば，2026年8月6日に部屋の絞り込みへ着手する場合は`20260806-room-filter`です．ブランチ名は`mission/<mission-id>`とし，1つのミッションを1つのブランチで扱います．

## 1つのミッションを始める

Codexでは，次のように依頼します．

```text
$start-mission イベント一覧を状態とタグで絞り込めるようにしてください
```

エージェントは，最初に作業範囲と既存ミッションの有無を確認します．新しいミッションであれば，mission ID，ブランチ，Mission Briefを用意します．既存ミッションの続きであれば新しい文書を作らず，該当する`mission-brief.md`と`handoff.md`から再開します．

初期化スクリプトを手動で実行する場合は，先に`mission/<mission-id>`ブランチへ移動し，リポジトリのルートで次を実行します．

```bash
node skills/start-mission/scripts/init-mission.mjs \
  --id 20260806-room-filter \
  --title '進捗部屋を条件で絞り込めるようにする'
```

このスクリプトは，テンプレート3件を`docs/missions/<mission-id>/`へコピーし，mission ID，タイトル，ブランチ，開始日を埋めます．ブランチ，Issue，commit，PRは作成しません．HandoffとMerge-Readiness Packの日時や証拠は，実際に記録するまでプレースホルダーのまま残します．

初期化後は，[Mission Briefの書き方](./_guides/how-to-mission-brief.md)に沿って目的，対象外，受け入れ条件，判断の境界を整理します．

## 実装前に計画とテスト設計を承認する

ミッションでは，本実装に入る前に2回の承認を行います．1回目は，解決方針と受け入れ条件の承認です．2回目は，各条件をどのテストで確かめるかというテスト設計の承認です．どちらもMission Briefへ記録し，`status: active`にしてから本実装を始めます．

エージェントは承認を求めるとき，Consultation Request Pack（CRPack）として次の情報を示します．

1. 今決めたいことと，この時点で判断が必要な理由
2. 制約と確認済みの事実
3. 選択肢とトレードオフ
4. 推奨案
5. 承認後に行う操作

テスト設計を考えるための読み取り専用調査や，破棄できる小さな検証は承認前でも実施できます．一方，テスト設計の選択肢を先回りして固定するプロダクト変更は行いません．

## エージェントが判断できる範囲を3段階で決める

Mission BriefのAutonomy Envelopeでは，操作を次の3区分に分けます．曖昧な「必要なら相談」ではなく，どの操作で止まるかを具体的に書きます．

- `may_decide`は，合意済みの範囲でエージェントが判断できる操作です．
- `must_consult`は，実行前に人間の承認が必要な操作です．解決方針，受け入れ条件，テスト設計，作業範囲の変更は必ず含めます．
- `prohibited`は，承認の有無にかかわらず，そのミッションでは実行しない操作です．

Issue作成，コメント投稿，push，PR作成，デプロイ，外部サービスのデータ変更は，リポジトリ外へ影響します．対象と操作を示し，人間が明示的に承認するまでは実行しません．ローカルの調査，編集，検証，commitは，Mission Briefで合意した範囲内で進められます．GitHub Issueは任意です．使う場合は本文案を先に示し，承認後に作成します．使わない場合は`github_issue: null`と`issue_status: not-applicable`のまま進められます．

## セッションを替える前に再開地点を残す

作業を別の担当やセッションへ渡すときは，[Handoffの書き方](./_guides/how-to-handoff.md)に沿って`handoff.md`を更新します．残すのは，完了した作業，現在地，次の操作，有効な決定と理由，必要な資料への参照，未解決事項，検証状態です．チャットの全文や探索ログは貼り付けません．

Mission BriefとHandoffには，参照資料の内容を複製せず，必要なファイルやContext Cardへのポインタを置きます．共通規約は`AGENTS.md`，`CLAUDE.md`，`docs/conventions.md`を参照し，分野別の情報は`docs/context-cards/`から作業に合うカードだけを選びます．

## レビュー前に受け入れ条件と証拠を対応付ける

完了時は，[Merge-Readiness Packの書き方](./_guides/how-to-merge-rationale.md)に沿って`merge-rationale.md`を仕上げます．受け入れ条件ごとに，検証方法，実測結果，証拠への参照を1対1で対応させます．

knoQ_R-UIでは，変更範囲に応じて次のコマンドから必要なものを選びます．実行しなかった検証があれば，省略理由を記録します．

- `npm run lint`
- `npm run type-check`
- `npm run build`
- `npm exec -- vitest run --coverage.enabled=true`
- 文書だけを変更した場合は`npm exec -- prettier --check docs/missions`と`git diff --check`

証拠には，コマンド，結果，実行日時，実行環境，対象commit SHA，ログや成果物への参照を含めます．別のcommitで得た結果を，現在の変更の証拠として流用しません．

## 複数の独立ミッションは別々に完結させる

`start-multi-mission`は，1ミッションにつき1つのブランチ，worktree，Mission Brief，対話セッションを作ります．各セッションが自分の計画とテスト設計の承認を受け，自分のcommit，push，PRを管理します．中央のintegrationブランチへまとめる運用ではありません．

```text
$start-multi-mission 次の3件を，別々に相談してレビューできる独立PRとして進めてください
```

先にマージされたPRがある場合，残る各ミッションは自分のブランチを更新し，自分の受け入れ条件を再検証します．別ミッションの履歴を無断で書き換えたり，変更を取り込んだりしません．

## テンプレートと詳しい書き方

- [Mission Briefテンプレート](./_templates/mission-brief.template.md)と[書き方](./_guides/how-to-mission-brief.md)
- [Handoffテンプレート](./_templates/handoff.template.md)と[書き方](./_guides/how-to-handoff.md)
- [Merge-Readiness Packテンプレート](./_templates/merge-rationale.template.md)と[書き方](./_guides/how-to-merge-rationale.md)

このガイドで判断できない運用上の問題は，対象ミッションのMission Briefへ未解決事項として記録し，人間へ相談してください．
