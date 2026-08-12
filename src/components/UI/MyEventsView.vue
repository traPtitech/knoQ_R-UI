<script setup lang="ts">
import { RouterLink } from 'vue-router'

defineProps<{
  eventDate: string
  eventName: string
  eventId: string
  isEventAdmin?: boolean
}>()
</script>

<template>
  <div flex items-center gap-4>
    <span text-text-secondary>
      {{ eventDate }}
    </span>
    <RouterLink :to="`/events/${eventId}`" >
      {{ eventName }}
    </RouterLink>
  </div>
</template>
