<script setup lang="ts">
import { useApiFetch } from '/@/composables/useApiFetch'
import RoomList from '/@/features/room/components/RoomList.vue'
import DataFetchState from '/@/components/UI/DataFetchState.vue'
import { now, today, todayEnd } from '/@/lib/time'
import MainLayout from '/@/layouts/MainLayout.vue'
import EventCardList from '/@/features/event/components/EventCardList.vue'

const { data: todaysEvents, state: todaysEventsState } = useApiFetch(
  '/events',
  { params: { query: { dateBegin: now(), dateEnd: todayEnd() } } }
)
const { data: todaysRooms, state: todaysRoomsState } = useApiFetch('/rooms', {
  params: { query: { dateBegin: now(), dateEnd: todayEnd() } }
})
const { data: myEvents, state: myEventsState } = useApiFetch(
  '/users/me/events',
  { params: { query: { relation: 'attendees', dateBegin: now() } } }
)
</script>

<template>
  <MainLayout>
    <h1 h1>{{ today() }}</h1>
    <div grid gap-2>
      <h2 h2>今日の進捗部屋</h2>
      <DataFetchState
        :state="todaysRoomsState"
        :is-empty="todaysRooms?.length === 0"
      >
        <template #empty>進捗部屋はありません</template>
        <RoomList :rooms="todaysRooms!" />
      </DataFetchState>
    </div>
    <div grid gap-2>
      <h2 h2>今日のイベント</h2>
      <DataFetchState
        :state="todaysEventsState"
        :is-empty="todaysEvents?.length === 0"
      >
        <template #empty>イベントはありません</template>
        <EventCardList :events="todaysEvents!" />
      </DataFetchState>
    </div>
    <div grid gap-2>
      <h2 h2>今後のあなたのイベント</h2>
      <DataFetchState :state="myEventsState" :is-empty="myEvents?.length === 0">
        <template #empty>イベントはありません</template>
        <div class="grid gap-4">
          <EventCardList :events="myEvents!" />
        </div>
      </DataFetchState>
    </div>
  </MainLayout>
</template>
