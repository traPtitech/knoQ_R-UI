<script setup lang="ts">
import { useApiFetch } from '/@/composables/useApiFetch'
import AppHeader from '/@/components/AppHeader.vue'
import EventCard from '/@/features/event/components/EventCard.vue'

const { data: events, state } = useApiFetch('/events', {})
</script>

<template>
  <AppHeader />
  <div max-w-3xl my-8 mx-auto grid gap-4>
    <h2 hl>イベント一覧</h2>
    <div v-if="state.error">failed to load events</div>
    <div v-else-if="!events">loading events</div>
    <div v-else class="grid gap-4">
      <EventCard v-for="event in events" :key="event.eventId" :event="event" />
    </div>
  </div>
</template>
