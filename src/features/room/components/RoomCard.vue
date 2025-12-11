<script setup lang="ts">
import type { components } from '/@/lib/api/schema'
import { computed } from 'vue'
import { format, parseISO } from 'date-fns'

type Room = components['schemas']['ResponseRoom']

const props = defineProps<{
  room: Room
}>()

const timeRange = computed(() => {
  const start = format(parseISO(props.room.timeStart), 'HH:mm')
  const end = format(parseISO(props.room.timeEnd), 'HH:mm')
  return `${start} - ${end}`
})
</script>

<template>
  <div card flex flex-row items-center justify-between gap-4>
    <div font-bold text-lg>{{ room.place }}</div>
    <div flex flex-row items-center gap-2 text-text-secondary>
      <span i-mdi:clock-outline />
      <span>{{ timeRange }}</span>
    </div>
  </div>
</template>
