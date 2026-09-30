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
  <MainLayout wide>
    <div
      class="flex flex-wrap items-end justify-between gap-5 pb-3 pt-4 sm:pt-6"
    >
      <div>
        <h1 class="h1">今日の予定</h1>
        <p class="mt-4 text-lg">{{ today() }}</p>
      </div>
      <RouterLink to="/events/new" class="btn-primary"
        ><span
          class="i-mdi:plus text-xl"
          aria-hidden="true"
        />イベントを作成</RouterLink
      >
    </div>

    <div class="grid items-start gap-12 lg:grid-cols-3 lg:gap-10">
      <div class="grid min-w-0 gap-10 lg:col-span-2">
        <section
          aria-labelledby="todays-rooms-heading"
          class="border-t-2 border-text-primary pt-6"
        >
          <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 id="todays-rooms-heading" class="flex items-center gap-3 h3">
              <span
                class="i-mdi:door-open text-2xl"
                aria-hidden="true"
              />今日の進捗部屋
            </h2>
            <RouterLink
              to="/rooms"
              class="inline-flex items-center gap-1 text-sm link"
              >部屋の予定<span class="i-mdi:chevron-right" aria-hidden="true"
            /></RouterLink>
          </div>
          <DataFetchState
            :state="todaysRoomsState"
            :is-empty="todaysRooms?.length === 0"
          >
            <template #empty
              ><p
                class="rounded-lg bg-surface-secondary px-6 py-8 text-text-secondary"
              >
                今日の進捗部屋はありません．
              </p></template
            >
            <RoomList :rooms="todaysRooms!" />
          </DataFetchState>
        </section>
        <section
          aria-labelledby="todays-events-heading"
          class="border-t-2 border-text-primary pt-6"
        >
          <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 id="todays-events-heading" class="flex items-center gap-3 h3">
              <span
                class="i-mdi:calendar-blank-outline text-2xl"
                aria-hidden="true"
              />今日のイベント
            </h2>
            <RouterLink
              to="/events"
              class="inline-flex items-center gap-1 text-sm link"
              >すべてのイベント<span
                class="i-mdi:chevron-right"
                aria-hidden="true"
            /></RouterLink>
          </div>
          <DataFetchState
            :state="todaysEventsState"
            :is-empty="todaysEvents?.length === 0"
          >
            <template #empty
              ><div class="rounded-lg bg-surface-secondary p-8">
                <p>今日のイベントはありません．</p>
                <RouterLink to="/events/new" class="mt-3 inline-block link"
                  >新しいイベントを作成する</RouterLink
                >
              </div></template
            >
            <EventCardList :events="todaysEvents!" />
          </DataFetchState>
        </section>
      </div>

      <aside
        aria-labelledby="my-events-heading"
        class="min-w-0 border-t-2 border-surface-accent-primary bg-surface-secondary p-5 sm:p-6"
      >
        <h2 id="my-events-heading" class="h3">今後の参加予定</h2>
        <DataFetchState
          :state="myEventsState"
          :is-empty="myEvents?.length === 0"
          class="mt-6"
        >
          <template #empty
            ><p class="py-4 text-text-secondary">
              参加予定のイベントはありません．
            </p></template
          >
          <EventCardList :events="myEvents!" />
        </DataFetchState>
        <RouterLink
          to="/me"
          class="mt-6 min-h-11 inline-flex items-center gap-1 text-sm link"
          >自分の予定を確認する<span
            class="i-mdi:chevron-right"
            aria-hidden="true"
        /></RouterLink>
      </aside>
    </div>

    <div
      class="mb-8 mt-2 flex justify-end border-t border-border-secondary pt-6 text-sm"
    >
      <RouterLink
        to="/draft-events/new"
        class="inline-flex items-center gap-2 link"
        >日程調整を作成<span class="i-mdi:arrow-right" aria-hidden="true"
      /></RouterLink>
    </div>
  </MainLayout>
</template>
