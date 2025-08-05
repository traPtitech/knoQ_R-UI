<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { computed } from 'vue'
import { useApiFetch } from '/@/composables/useApiFetch'
import AppHeader from '/@/components/AppHeader.vue'
import { useMe } from '/@/features/user/composables/useMe'
import EventCard from '/@/features/event/components/EventCard.vue'

const { me } = useMe()

const { data: todaysEvents, error: todaysEventsError } = useApiFetch(
  '/events',
  {
    params: {
      query: {
        dateBegin: new Date().toISOString(),
        dateEnd: new Date(new Date().setHours(23, 59, 59, 999)).toISOString()
      }
    }
  }
)
const { data: myEvents, error: myEventsError } = useApiFetch(
  '/users/me/events',
  { params: { query: { relation: 'attendees' } } }
)
const { data: myGroupIds, error: myGroupsError } = useApiFetch(
  '/users/me/groups',
  {}
)
</script>

<template>
  <AppHeader />
  <div max-w-3xl my-8 mx-auto grid gap-8>
    <h2 hl>7/22 (金)</h2>
    <div grid gap-4>
      <h3 hm>進捗部屋</h3>
      <h3 hm>イベント</h3>
      <div v-if="todaysEventsError">failed to load events</div>
      <div v-else-if="!todaysEvents">loading events</div>
      <div v-else-if="todaysEvents.length === 0">イベントはありません</div>
      <div v-else class="grid gap-4">
        <EventCard
          v-for="event in todaysEvents"
          :key="event.eventId"
          :event="event"
        />
      </div>
    </div>
    <h2 hl>予定</h2>
    <div grid gap-4>
      <h3 hm>あなたのイベント</h3>
      <div v-if="myEventsError">failed to load events</div>
      <div v-else-if="!myEvents">loading events</div>
      <div v-else-if="myEvents.length === 0">イベントはありません</div>
      <div v-else class="grid gap-4">
        <EventCard
          v-for="event in myEvents"
          :key="event.eventId"
          :event="event"
        />
      </div>
    </div>
    <div card grid gap-6>
      <h3 hm>あなたのグループ</h3>
      <div v-if="myGroupsError">failed to load groups</div>
      <div v-else-if="!myGroups">loading groups</div>
      <div v-else-if="myGroups.length === 0">グループはありません</div>
      <div v-else>
        <div v-for="group in myGroups" :key="group.groupId">
          <RouterLink :to="`/groups/${group.groupId}`">
            {{ group.name }}
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>
