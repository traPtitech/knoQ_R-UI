<script setup lang="ts">
import AppHeader from '/@/components/AppHeader.vue'
import { useMe } from '/@/features/user/composables/useMe'
import { useApiFetch } from '/@/composables/useApiFetch'
import { RouterLink } from 'vue-router'
import { computed } from 'vue'
import DataFetchState from '/@/components/UI/DataFetchState.vue'
import MyEventsView from '/@/components/UI/MyEventsView.vue'

const { me } = useMe()

const { data: myEvents, state: myEventsState } = useApiFetch(
  '/users/me/events',
  {
    params: { query: { relation: 'attendees' } }
  }
)

const upcomingEvents = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return (
    myEvents.value?.filter((e: any) => {
      const d = new Date(e.timeStart)
      return d >= today
    }) ?? []
  )
})

const { data: myGroups, state: myGroupsState } = useApiFetch(
  '/users/me/groups',
  {}
)

const dateString = (date: string) => {
  const d = new Date(date)
  return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`
}
</script>

<template>
  <AppHeader />
  <div v-if="me" grid mx-auto my-8 max-w-3xl gap-4>
    <h2 hl>マイページ</h2>
    <div grid gap-6 card>
      <h3 hm>プロフィール</h3>
      <p>名前: {{ me.name }}</p>
      <p>表示名: {{ me.displayName }}</p>
    </div>
    <div grid gap-6 card>
      <h3 hm>あなたのイベント</h3>
      <DataFetchState :state="myEventsState" :is-empty="upcomingEvents?.length === 0">
        <div v-for="event in upcomingEvents" :key="event.eventId">
          <MyEventsView
            :event-date="dateString(event.timeStart)"
            :event-name="event.name"
            :event-id="event.eventId"
          />
        </div>
      </DataFetchState>
    </div>
    <div grid gap-6 card>
      <h3 hm>あなたのグループ</h3>
      <DataFetchState :state="myGroupsState" :is-empty="myGroups?.length === 0">
        <!-- <div v-for="group in myGroups" :key="group.groupId"> -->
        <!-- <RouterLink :to="`/groups/${group.groupId}`"> -->
        <!-- {{ group.name }} -->
        <!-- </RouterLink> -->
        <!-- </div> -->
      </DataFetchState>
    </div>
  </div>
</template>
