---
id: event-draft-event-domain
tags: [event, draft-event, data]
priority: high
load_when: 'イベント，参加予定，日程調整，draft-event からのイベント作成を変更するとき'
source_pointer:
  - path: src/lib/api/schema.d.ts
    last_checked: 2026-08-06
  - path: src/features/event/types.ts
    last_checked: 2026-08-06
  - path: src/features/event/api.ts
    last_checked: 2026-08-06
  - path: src/features/event/composables/useMySchedule.ts
    last_checked: 2026-08-06
  - path: src/features/draft-event/types.ts
    last_checked: 2026-08-06
  - path: src/features/draft-event/mock.ts
    last_checked: 2026-08-06
  - path: src/features/draft-event/composables/useDraftEvents.ts
    last_checked: 2026-08-06
  - path: src/features/draft-event/stores/pendingEventCreation.ts
    last_checked: 2026-08-06
  - path: src/pages/CreateEvent.vue
    last_checked: 2026-08-06
  - path: src/pages/CreateDraftEvent.vue
    last_checked: 2026-08-06
retirement_status: active
access_notes: all-roles
---

# event と draft-event のドメイン

## 概要

event は確定した日時を持つ通常 API のドメインで，型は OpenAPI の `ResponseEvent`，`ResponseEventDetail`，`RequestSchedule` から導出する．draft-event は候補スロットへの回答と集計を扱う日程調整ドメインで，ローカル型，mock API，専用 composable によって実装されている．

## 不変条件

- event の API 型を手書きで複製せず，`components['schemas']` から導出する．参加予定値は生成スキーマ上の `pending | absent | attendance` を保つ．
- event 作成は場所文字列を渡す instant event と，`roomId` を渡す stock event の union である．`CreateEvent.vue` は部屋選択の有無で body を分けるため，両形式を変更時に検証する．
- draft-event の status は `open | closed | confirmed` で，候補，回答，集計の型は `src/features/draft-event/types.ts` に集約されている．候補スロットは作成画面が 30 分単位で生成する．
- draft-event の一覧，詳細，作成，削除，確定，回答，集計は現在 `mockApi` を使う．本番 API 接続時は `useDraftEvents`，`useAvailability`，`useSchedulingResults` とローカル型を一まとまりで見直し，生成スキーマとの二重契約を残さない．
- draft-event の確定から event 作成へ移る際は，Pinia の `pendingEventCreation` が draft ID と開始・終了時刻を一時保持する．`CreateEvent.vue` は値を読み取って消去し，event 作成後に draft を確定する．この橋渡しを変更するときは遷移，prefill，失敗時の状態を一緒に確認する．
- API 契約へ踏み込む場合は [[api-data-schema]] もロードする．
