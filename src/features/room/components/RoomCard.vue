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
  <div
    class="flex flex-col gap-3 border border-border-secondary rounded-lg bg-surface-secondary p-5"
  >
    <div class="flex items-center gap-2 text-base font-bold">
      <span
        class="i-mdi:door-open shrink-0 text-xl text-text-secondary"
        aria-hidden="true"
      />{{ room.place }}
    </div>
    <div class="flex items-center gap-2 text-sm text-text-secondary">
      <span i-mdi:clock-outline aria-hidden="true" />
      <span>{{ timeRange }}</span>
    </div>
  </div>
</template>
