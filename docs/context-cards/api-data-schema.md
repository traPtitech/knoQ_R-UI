---
id: api-data-schema
tags: [api, data, schema]
priority: high
load_when: 'API 呼び出し，データ取得状態，OpenAPI スキーマ，生成型を変更するとき'
source_pointer:
  - path: package.json
    last_checked: 2026-09-15
  - path: src/lib/api/index.ts
    last_checked: 2026-09-15
  - path: src/lib/api/schema.d.ts
    last_checked: 2026-09-15
  - path: src/composables/useApiFetch.ts
    last_checked: 2026-09-15
  - path: src/composables/useSwrvState.ts
    last_checked: 2026-09-15
  - path: src/features/event/api.ts
    last_checked: 2026-09-15
  - path: docs/conventions.md
    last_checked: 2026-09-15
  - path: src/lib/api/baseUrl.ts
    last_checked: 2026-09-15
  - path: src/features/draft-event/api.ts
    last_checked: 2026-09-15
  - path: src/mocks/environment.ts
    last_checked: 2026-09-15
retirement_status: active
access_notes: all-roles
---

# API呼び出しとデータ取得状態

## GETのキャッシュにはSWRVを使う

`src/lib/api/index.ts`は，`openapi-fetch`の型付きクライアントを公開する．`src/lib/api/baseUrl.ts`が定義する開発時のbase URLは`http://localhost:3000/api`，それ以外は`/api`である．Cookieを含めるため，`credentials: 'include'`を指定している．GETのキャッシュにはSWRVベースの`useApiFetch`を使い，`useSwrvState`が取得状態を6種類に整理する．

## 変更時に守ること

- API 呼び出しは `apiClient` を直接使う．GET をリアクティブにキャッシュする場合は `useApiFetch` を使い，独自ラッパー層や新しいストア経由を先に増やさない．
- `useApiFetch` は GET の path と `FetchOptions` を生成済み `paths` から型付けし，キャッシュキーは path と options の JSON で構成する．mutation は `apiClient.POST` / `PUT` / `DELETE` などを直接呼び，必要なら既存データを `mutate` する．
- `src/lib/api/schema.d.ts` は `npm run generate` が upstream の Swagger から生成する．手編集せず，契約変更後は生成コマンドを使い，型エラーが出る呼び出し側を追従させる．
- `useSwrvState` の状態は `idle`，`validating`，`pending`，`success`，`error`，`staleIfError` である．取得 UI は状態の意味を失う独自 boolean へ安易に潰さない．
- draft-eventは生成スキーマに含まれず，feature内の`api.ts`で暫定HTTP契約を定義する．正式API対応時は[[event-draft-event-domain]]も読み，契約とモックの更新範囲を決める．
- 開発モックは`npm run dev:mock`で明示的に起動する．`src/mocks/environment.ts`がブラウザ・Node共通のハンドラーとシナリオを組み立てる．本番からモック実行コードは除外する．
- `useApiFetch`は応答の`.data`だけを返すため，HTTP失敗をSWRVのerrorへ伝えない．draft-eventの専用composableは`response.ok`を検査する．この境界を変更する場合は共通GETへの影響を確認する．
