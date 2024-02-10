<template>
  <div>
    <h2>あなた</h2>
    <div v-if="meError">failed to load</div>
    <div v-else-if="!me">loading me</div>
    <div v-else>{{ me.name }}</div>
  </div>

  <div>
    <h2>今日のイベント</h2>
    <div v-if="todaysEventsError">failed to load events</div>
    <div v-else-if="!todaysEvents">loading events</div>
    <div v-else>
      <div v-for="event in todaysEvents" :key="event.eventId">
        <RouterLink :to="`/events/${event.eventId}`">
          {{ event.name }}</RouterLink
        >
      </div>
    </div>
  </div>
  <div>
    <h2>あなたのイベント</h2>
    <div v-if="myEventsError">failed to load events</div>
    <div v-else-if="!myEvents">loading events</div>
    <div v-else>
      <div v-for="event in myEvents" :key="event.eventId">
        <RouterLink :to="`/events/${event.eventId}`">
          {{ event.name }}</RouterLink
        >
      </div>
    </div>
  </div>
  <div>
    <h2>あなたのグループ</h2>
    <div v-if="myGroupsError">failed to load events</div>
    <div v-else-if="!myGroupDetails">loading events</div>
    <div v-else>
      <div v-for="group in myGroupDetails" :key="group?.groupId">
        <RouterLink :to="`/groups/${group?.groupId}`">
          {{ group?.name }}</RouterLink
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { computed } from 'vue'
import { useApiFetch } from '/@/composables/useApiFetch'

const { data: me, error: meError } = useApiFetch('/users/me', {})
const { data: todaysEvents, error: todaysEventsError } = useApiFetch(
  '/events',
  {
    params: {
      query: {
        dateBegin: '2023-09-27T00:00:00+09:00',
        dateEnd: '2023-09-27T23:59:59+09:00'
      }
    }
  }
)
const { data: myEvents, error: myEventsError } = useApiFetch(
  '/users/me/events',
  {
    params: { query: { relation: 'attendees' } }
  }
)
const { data: myGroups, error: myGroupsError } = useApiFetch(
  '/users/me/groups',
  {
    params: { query: { relation: 'belongs' } }
  }
)
const { data: allGroups, error: allGroupsError } = useApiFetch('/groups', {})
const myGroupDetails = computed(() =>
  myGroups.value
    ?.map((v) => allGroups.value?.filter((x) => x.groupId === v))
    .flat()
)
</script>
