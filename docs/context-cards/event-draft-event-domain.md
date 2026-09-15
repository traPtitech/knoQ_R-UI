---
id: event-draft-event-domain
tags: [event, draft-event, data]
priority: high
load_when: 'イベント，参加予定，日程調整，draft-event からのイベント作成を変更するとき'
source_pointer:
  - path: src/lib/api/schema.d.ts
    last_checked: 2026-09-15
  - path: src/features/event/types.ts
    last_checked: 2026-09-15
  - path: src/features/event/api.ts
    last_checked: 2026-09-15
  - path: src/features/event/composables/useMySchedule.ts
    last_checked: 2026-09-15
  - path: src/features/draft-event/types.ts
    last_checked: 2026-09-15
  - path: src/features/draft-event/api.ts
    last_checked: 2026-09-15
  - path: src/features/draft-event/composables/useDraftEvents.ts
    last_checked: 2026-09-15
  - path: src/features/draft-event/stores/pendingEventCreation.ts
    last_checked: 2026-09-15
  - path: src/pages/CreateEvent.vue
    last_checked: 2026-09-15
  - path: src/pages/CreateDraftEvent.vue
    last_checked: 2026-09-15
  - path: src/features/draft-event/mocks/factories.ts
    last_checked: 2026-09-15
  - path: src/features/draft-event/mocks/handlers.ts
    last_checked: 2026-09-15
retirement_status: active
access_notes: all-roles
---

# eventとdraft-eventは別のデータ契約を持つ

## eventは生成型，draft-eventはローカル型を使う

eventは，確定した日時を持つ通常APIのドメインである．型はOpenAPIの`ResponseEvent`，`ResponseEventDetail`，`RequestSchedule`から導出する．draft-eventは候補時間への回答と集計を扱う日程調整ドメインで，ローカル型の暫定HTTP契約と専用composableによって実装されている．開発モックはMSWで応答し，Fakerのシードと基準日時から初期データを生成する．

## 変更時に守ること

- event の API 型を手書きで複製せず，`components['schemas']` から導出する．参加予定値は生成スキーマ上の `pending | absent | attendance` を保つ．
- event 作成は場所文字列を渡す instant event と，`roomId` を渡す stock event の union である．`CreateEvent.vue` は部屋選択の有無で body を分けるため，両形式を変更時に検証する．
- draft-event の status は `open | closed | confirmed` で，候補，回答，集計の型は `src/features/draft-event/types.ts` に集約されている．候補時間は作成画面が30分単位で生成し，IDはHTTP応答側で払い出す．
- draft-eventの一覧，詳細，作成，削除，確定，回答，集計は`draftApiClient`を使う．暫定契約は`api.ts`，モックの生成・HTTP処理は`mocks/`に分ける．正式API対応時は3つのcomposableと型をまとめて見直し，二重契約を残さない．
- draft-event の確定から event 作成へ移る際は，Pinia の `pendingEventCreation` が draft ID と開始・終了時刻を一時保持する．`CreateEvent.vue` は値を読み取って消去し，eventの作成成功後にdraftを確定する．作成失敗時は未確定のままとし，確定だけが失敗した場合は作成済みイベントへのリンクを示して再送信を防ぐ．この橋渡しを変更するときは遷移，prefill，失敗時の状態を一緒に確認する．
- API 契約へ踏み込む場合は [[api-data-schema]] もロードする．
