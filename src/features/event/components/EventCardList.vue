<script setup lang="ts">
import { computed } from 'vue'
import { format, parseISO } from 'date-fns'
import { ja } from 'date-fns/locale'
import type { KnoqEvent } from '/@/features/event/types'
import EventCard from '/@/features/event/components/EventCard.vue'

const props = defineProps<{ events: KnoqEvent[]; groupByDate?: boolean }>()
const groups = computed(() => {
  const result: { key: string; label: string; events: KnoqEvent[] }[] = []
  for (const event of props.events) {
    const start = parseISO(event.timeStart)
    const label = format(start, 'yyyy/M/d (EEE)', { locale: ja })
    const previous = result.at(-1)
    if (previous?.label === label) previous.events.push(event)
    else result.push({ key: event.eventId, label, events: [event] })
  }
  return result
})
</script>

<template>
  <div v-if="groupByDate" class="grid gap-6">
    <section
      v-for="group in groups"
      :key="group.key"
      class="grid min-w-0 gap-3"
    >
      <h3 class="text-sm text-text-secondary font-medium">{{ group.label }}</h3>
      <EventCard
        v-for="event in group.events"
        :key="event.eventId"
        :event="event"
        hide-date
        show-date-in-time
      />
    </section>
  </div>
  <div v-else class="grid gap-4">
    <EventCard v-for="event in events" :key="event.eventId" :event="event" />
  </div>
</template>
