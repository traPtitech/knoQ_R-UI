<script setup lang="ts">
import { KnoqEvent } from '../types'
import EventCard from './EventCard.vue'

defineProps<{
  events: KnoqEvent[]
}>()
</script>

<template>
  <div class="grid gap-4">
    <EventCard v-for="event in events" :key="event.eventId" :event="event" />
  </div>
</template>
