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
  <div class="grid grid-cols-[3em_1fr] gap-4 border-b border-border-primary p-4">
    <span class="text-text-secondary">
      {{ eventDate }}
    </span>
    <RouterLink :to="`/events/${eventId}`" class="link">
      {{ eventName }}
    </RouterLink>
  </div>
</template>
