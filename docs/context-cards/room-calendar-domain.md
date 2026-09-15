---
id: room-calendar-domain
tags: [room, calendar, data]
priority: high
load_when: '進捗部屋，月間カレンダー，週間カレンダー，部屋の一括作成を変更するとき'
source_pointer:
  - path: src/lib/api/schema.d.ts
    last_checked: 2026-08-06
  - path: src/features/room/types.ts
    last_checked: 2026-08-06
  - path: src/features/room/composables/useWeekRooms.ts
    last_checked: 2026-08-06
  - path: src/features/room/composables/useWorkspace.ts
    last_checked: 2026-08-06
  - path: src/features/room/lib/weekLayout.ts
    last_checked: 2026-08-06
  - path: src/features/room/components/WeekCalendar.vue
    last_checked: 2026-08-06
  - path: src/pages/RoomsCalendarPage.vue
    last_checked: 2026-08-06
  - path: src/pages/CalendarPage.vue
    last_checked: 2026-08-06
  - path: src/pages/RoomManagementPage.vue
    last_checked: 2026-08-26
retirement_status: active
access_notes: all-roles
---

# roomとcalendarのデータフロー

## 月表示と週表示ではデータの組み立て方が異なる

roomは，場所，利用可能時間，確認状態，管理者を持つOpenAPI由来のデータである．`CalendarPage.vue`は月表示用にeventsとroomsを並列取得する．`RoomsCalendarPage.vue`は週範囲を監視し，取得したroomsとeventsを`roomId`ごとに結合して時間グリッドへ配置する．

## 変更時に守ること

- room と event の型は生成済み `components['schemas']` から導出する．表示用の `RoomWithEvents` だけが room に `events` を付加するローカル型である．
- 週表示の期間は `dateBegin` / `dateEnd` の変更を `useWeekRooms` が監視して再取得する．取得した event は `roomId` で room へ結合し，`timeStart` 順へ整列する．取得方法を変えても期間変更時の再取得を維持する．
- 週レイアウトは 9:00 から 22:00，1 時間 52 px を基準にする．重なる room は cluster ごとに lane を割り当て，同じ lane は時間が重ならない場合だけ再利用する．レイアウト定数や重なり判定を変える場合は `weekLayout.ts` と `WeekCalendar.vue` を同時に確認する．
- 月表示は events と rooms を同じ月グリッドへ独立に表示し，選択日の詳細リストを別々に生成する．週表示の結合済みデータをそのまま前提にしない．
- `useWorkspace` は `/rooms` の結果を `verified` で絞る．確認済み部屋だけが必要な画面でこの条件を失わない．
- `RoomManagementPage.vue`の一括登録は`/rooms/all`へ`text/csv`を直送し，生成スキーマ上のbody型との差をserializerと型変換で吸収している．room取得の`dateBegin`は開始時刻へ適用されるため，当日0時から取得し，終了済みroomと未確認roomをクライアントで除く．削除は一括APIがないため，現在ユーザーが`admins`に含まれるroomだけを選択可能にし，選択した`roomID`ごとに`DELETE /rooms/{roomID}`を直列実行する．部分失敗後も残りを処理し，失敗したroomは選択状態で残す．これらの例外を広げず，API契約が変わった場合は呼び出し側も見直す．API変更時は[[api-data-schema]]を追加で読む．
