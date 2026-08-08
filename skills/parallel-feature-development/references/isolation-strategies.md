# 並行実装の分離方法を選ぶ

並行実装を担当するエージェントの分離方法を決めるときだけ，この資料を使う．通常はGit worktreeで十分である．

## 比較表

| 方法                | ソースの分離                                             | 実行環境の分離                     | 起動コスト           | 継続コスト                      | 向いている用途                               |
| ------------------- | -------------------------------------------------------- | ---------------------------------- | -------------------- | ------------------------------- | -------------------------------------------- |
| checkoutを共有      | なし                                                     | なし                               | 最小                 | 最小                            | 範囲を限定した読み取り専用の調査             |
| Git worktree        | 作業ファイル，`HEAD`，indexを分離．Git objectとrefは共有 | host環境を共有                     | 低い                 | 依存関係とbuildに使うlocal disk | knoQ_R-UIでの通常の機能開発                  |
| 個別のclone         | 作業ファイルとGit metadataを分離                         | host環境を共有                     | 中                   | Git objectと依存関係を重複保持  | credentialやremote操作も分ける必要がある作業 |
| worktreeとcontainer | worktree単位で分離                                       | processと依存関係をcontainerで分離 | 中〜高               | image，container，volume，port  | native toolchainの競合や信頼できないコマンド |
| GitHub Codespaces   | codespaceごとにremote checkoutとbranchを用意             | 専用remote VMと開発container       | prebuildなしでは高い | 従量制のcomputeとstorage        | remote共同作業やlocal capacity不足           |
| managed agent cloud | taskごとにremote checkoutを用意                          | providerが管理するtask環境         | 環境構築後は中       | 製品利用料とremote環境の制約    | taskのoffloadとPR中心の引き渡し              |

## 通常はGit worktreeを使う

すべてのタスクが既存のNode.js toolchainを使い，機能またはpage単位で所有範囲を分けられるなら，worktreeを選ぶ．短時間で作成でき，Git objectを共有しながら，commitとindexを分離できる．

次の制約は残る．

- 1つのbranchを，同時に複数のworktreeでcheckoutできない．
- refとリポジトリ単位のGit設定は共有される．
- ignored local file，依存関係，build出力，開発server portはworktreeごとに必要になる．
- ファイル書き込みが分離されていても，論理的に結合したファイルを並行編集すると統合競合が起きる．

## 必要性がある場合だけcontainerを加える

互換性のないtool version，native service，より強いprocess分離，よく知らないコマンドの制御実行が必要な場合は，worktreeごとにcontainerを1つ使う．各エージェントのworktreeは，そのエージェント専用のcontainerだけへmountする．

リポジトリのproduction用`Dockerfile`を，内容を確認せず開発環境として流用しない．現在のimageはstatic assetをbuildしてCaddyで配信するもので，対話的な開発toolchainを提供しない．

containerを使うと，image build，複数の依存store，port割り当て，macOS上のfilesystem性能，credential転送，後片付けのコストが増える．別のエージェントと同じ書き込み可能なbind mountを使えば，containerがあってもソース競合は防げない．

## 個別cloneはGit環境も分ける場合に限る

エージェントごとにGit設定，remote，credential，object database，repository maintenance操作を分ける必要がある場合だけ，worktreeの代わりにcloneを使う．cloneはfetchを繰り返す必要があり，disk使用量も増える．branchをlocalで確認して統合する作業も，worktreeより煩雑になる．

## remote capacityが必要ならCodespacesを使う

remoteで作業を続ける必要がある場合，hosted environmentを再現したい場合，localのCPUやmemoryが不足する場合は，branchごとにcodespaceを1つ使う．`.devcontainer/devcontainer.json`の追加はリポジトリ全体の開発環境に影響するため，別の承認済み変更として扱う．

codespaceを作る前に，repository access，organization policy，spending limit，secret設定，machine size，idle timeout，後片付けの担当を確認する．prebuildは起動時間を短縮するが，storageを消費し，リポジトリ管理権限も必要になる．

## taskをoffloadするならmanaged agent cloudを使う

ユーザーがremote task環境と，diffまたはPRによる引き渡しを求める場合に選ぶ．リポジトリと選択したbase commitをremoteから利用できることを確かめる．localの未commit変更は，commitまたは明示的な転送を行わない限りbaseにできない．

cloudのsetup scriptは依存関係をインストールできる．agent phaseでのinternet accessとsecretは，設定済みの環境policyに従う．localのcredentialやserviceがremoteにも存在すると仮定しない．

## セキュリティと承認の境界

次の操作には，ユーザーの明示的な承認が必要である．

- 課金対象のcloud環境を作る．
- 新しいremote serviceへcodeまたはdataをuploadする．
- credentialまたはsecretをcontainerへ転送する．
- 広いnetwork accessを有効にする．
- branchをpushし，PRを作成し，ユーザーのbranchへmergeする．
- worktreeまたはcontainerを削除する．

承認依頼を避けるためにsandboxを弱めてはならない．
