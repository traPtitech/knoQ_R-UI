# バックエンドなしで日程調整を動かす

フロントエンド開発者向けのガイドです．まず起動とリセットを確認し，データ追加やテストの節は必要なときに参照してください．HTTPへ応答するMSWと，データを生成するFakerを使っています．

## リポジトリルートで`dev:mock`を起動する

Node.js 24で検証しています．リポジトリルートで次のコマンドを実行してください．依存はlockfileに合わせて取得します．

```bash
npm ci
npm run dev:mock
```

Viteが表示したURLの`/draft-events`を開きます．通常は`http://localhost:8080/draft-events`です．モックの準備が完了してからVueが起動し，初回のAPI要求からMSWが応答します．開発者ツールのConsoleに`[MSW] Mocking enabled.`と`[mocks] Reproduction settings:`が表示されます．後者に再現用の設定があります．

既定のユーザーは先頭の開発メンバーです．「開発チームの進捗共有会」では回答と管理画面を操作できます．新規作成では「日付で指定」を選びます．候補を選んで回答した後，管理画面から日時をイベント作成画面へ引き継ぎ，主催グループと場所を選んで作成します．

`npm run dev`は通常APIへ接続します．モックは`import.meta.env.DEV`かつ`VITE_ENABLE_MOCKS=true`のときだけ起動します．本番では有効化できません．日程調整もHTTPを使うため，通常起動時に従来の固定データへ戻る動作はありません．

## シナリオを選び，リロードで初期状態へ戻す

環境変数を指定して開発サーバーを起動します．変更時はサーバーを再起動し，ページをリロードしてください．

```bash
VITE_MOCK_SCENARIO=empty npm run dev:mock
VITE_MOCK_SCENARIO=error npm run dev:mock
VITE_MOCK_SCENARIO=slow npm run dev:mock
```

| シナリオ  | 再現する状態                                                                  |
| --------- | ----------------------------------------------------------------------------- |
| `default` | 募集中・締切済み・確定済み，回答済み・未回答，管理者・招待者，長い名前        |
| `empty`   | 日程調整・回答・イベントが0件．新規作成に必要なユーザー・グループ・部屋は残る |
| `error`   | 日程調整の一覧取得が500．関連ユーザーの取得は成功する                         |
| `slow`    | 対象APIの応答を1秒遅らせる                                                    |

保存先はブラウザのメモリです．通常のリロードで，作成・削除・回答などの変更と画面キャッシュがリセットされます．永続化はしていません．

## 現在より前と後の日付を必ず含める

ID，ユーザー名，部屋の場所などはFakerで生成します．イベント名や状態，日付の配置には画面確認用のルールを使い，API要求のたびにデータを再抽選しません．

`VITE_MOCK_NOW`を省略すると，ページ読込時の現在時刻を基準に初期データを生成します．乱数シードによらず，次の過去・未来の両方を用意します．

| 対象         | 過去                           | 未来                         |
| ------------ | ------------------------------ | ---------------------------- |
| 通常イベント | 2日前の開催済みイベント        | 翌日・翌々日のイベント       |
| 部屋         | 2日前の利用枠                  | 翌日から3日後までの利用枠    |
| 日程調整     | 期限切れの締切と，過去の候補日 | 募集中の締切と，将来の候補日 |

これは初期データ全体の条件です．`empty`では日程調整とイベントを空にし，期間を指定したAPIはその期間だけを返します．固定の`VITE_MOCK_NOW`を指定した場合は，実際の現在時刻ではなく，指定日時の前後になります．起動後に日時を自動で移動する処理はないため，長く開いた画面を現在基準へ戻すにはリロードしてください．

## 同じデータを再現する

乱数シード，基準日時，シナリオ，lockfileを揃えます．基準日時の既定はページの起動時刻で，過去と未来のデータを生成します．既定の乱数シードは`20260915`です．IDや名前を変えたい場合は`VITE_MOCK_SEED`を変更します．

```bash
VITE_MOCK_SEED=42 VITE_MOCK_NOW=2026-09-15T09:00:00+09:00 npm run dev:mock
```

`VITE_MOCK_NOW`はタイムゾーン付きISO日時を指定します．画面自身の現在時刻は固定されないため，過去の基準日時を使うと締切表示も過去になります．テストでは画面側の時刻も固定しています．Fakerのversionが変わると，同じシードでも生成値は変わる場合があります．

## データとHTTP処理を追加する

| 場所                                        | 追加するもの                                     |
| ------------------------------------------- | ------------------------------------------------ |
| `src/features/<feature>/mocks/factories.ts` | 型に沿ったデータ生成と，ドメイン内の初期状態     |
| `src/features/<feature>/mocks/handlers.ts`  | method・pathごとの入力検査，状態更新，HTTP応答   |
| `src/mocks/environment.ts`                  | 生成の順序，ハンドラーの結合，シナリオ，リセット |
| `src/mocks/context.ts`                      | 独立したFakerインスタンス，シード，基準日時      |
| `src/mocks/browser.ts` / `node.ts`          | ブラウザ / Vitestの起動入口                      |

ユーザー→グループ→部屋→イベント→日程調整の順で生成します．IDは既存の状態から参照し，ハンドラーは要求ごとに`context.state`を読みます．配列をハンドラー作成時に保持すると，リセット後も古い配列を参照するためです．日時は`mockDate(context, offsetHours)`を使い，暗黙の現在時刻や`Math.random()`を追加しないでください．

通常APIは`components['schemas']`から型を導出します．日程調整は`src/features/draft-event/api.ts`の暫定HTTP契約と`types.ts`を使います．この契約は正式なバックエンド仕様ではありません．正式APIへ接続する際に置き換え，生成済み`schema.d.ts`は手編集しません．

## Vitestでも同じ定義を使う

`createMockServer()`がブラウザと共通のハンドラー・データを返します．`openapi-fetch`は生成時点のfetchを保持するため，`server.listen()`の後にクライアントやページをimportしてください．

```ts
import { afterAll, afterEach } from 'vitest'
import { createMockServer } from '/@/mocks/node'
import { onUnhandledMockRequest } from '/@/mocks/environment'

const mocks = createMockServer({ seed: 42, now: '2026-09-15T00:00:00Z' })
mocks.server.listen({ onUnhandledRequest: onUnhandledMockRequest })
const { draftApiClient } = await import('/@/features/draft-event/api')

afterEach(() => {
  mocks.server.resetHandlers()
  mocks.reset()
})
afterAll(() => mocks.server.close())
```

`server.use()`で個別の失敗応答を上書きできます．`resetHandlers()`は応答上書き，`reset()`は自前のデータを戻すため，両方が必要です．`reset({ scenario: 'empty' })`でシナリオも変更できます．画面テストではunmount，Piniaの作り直し，SWRVキャッシュの分離，時刻mockの解除も行います．実例は`tests/unit/mockUiSupport.ts`と`draftMockUi.spec.ts`です．

## 対応範囲と診断を確認する

日程調整は一覧・詳細・作成・削除・確定・回答取得保存・集計に対応します．通常APIはGETの`/users`，`/users/me`，`/groups`，`/groups/{groupID}`，`/rooms`，`/events`，`/events/{eventID}`とPOSTの`/events`を扱います．ユーザーアイコンもローカルで応答します．

未定義APIは`[MSW] Unhandled mock API`をConsoleへ出し，通信を失敗させます．部屋の登録削除，参加予定更新，iCalなどは未対応です．イベント検索の`q`構文は400，部屋の`freeTimes`・`sharedTimes`は省略しています．認証・認可の再現も含みません．

既存の「曜日で指定」は候補日を生成しないため，日程調整作成で400になります．今回の動作確認は「日付で指定」を対象にしています．通常APIの共通`useApiFetch`がHTTPエラーを伝えない点も既存のままです．失敗表示の検証は日程調整を対象にしています．

MSW更新後は`npm exec -- msw init public --save`でworkerを再生成します．生成した`public/mockServiceWorker.js`は直接編集しません．このファイルはViteにより本番の公開ファイルにもコピーされますが，本番アプリから登録・実行するコードは含まれません．

設定や未対応APIで困った場合は，Consoleの要求URLと再現設定を添え，担当者へ相談してください．MSWはHTTP応答の差し替え，Fakerはデータ生成，シナリオは表示条件の組み合わせを指します．
