<script setup lang="ts">
import { computed } from 'vue'
import { parseISO } from 'date-fns'
import AnchoredPopover from '/@/components/UI/AnchoredPopover.vue'
import { formatTimeRange } from '/@/lib/time'
import type { RoomWithEvents } from '/@/features/room/types'

const WD = ['日', '月', '火', '水', '木', '金', '土'] as const

const props = defineProps<{
  room: RoomWithEvents
  anchorEl: HTMLElement
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const startDate = computed(() => parseISO(props.room.timeStart))

const timeRange = computed(() =>
  formatTimeRange(props.room.timeStart, props.room.timeEnd)
)

const dateLabel = computed(() => {
  const d = startDate.value
  return `${d.getMonth() + 1}月${d.getDate()}日 (${WD[d.getDay()]})`
})

type PopEvent = {
  id: string
  name: string
  timeLabel: string
  exclusive: boolean
}
const events = computed<PopEvent[]>(() =>
  props.room.events.map((ev) => ({
    id: ev.eventId,
    name: ev.name,
    timeLabel: formatTimeRange(ev.timeStart, ev.timeEnd),
    exclusive: !ev.sharedRoom
  }))
)
</script>

<template>
  <AnchoredPopover :anchor-el="anchorEl" @close="emit('close')">
    <div class="w-72 px-4 pb-3 pt-4">
      <div class="mb-3 flex items-start gap-2">
        <span
          class="w-1 flex-none self-stretch rd-1 bg-surface-accent-primary"
        />
        <div class="flex-1">
          <div class="text-base font-extrabold">{{ room.place }}</div>
          <div class="mt-0.5 text-xs text-text-tertiary font-semibold">
            {{ dateLabel }}
          </div>
        </div>
        <button
          type="button"
          class="grid h-6 w-6 flex-none place-items-center rd-2 text-text-tertiary transition-colors hover:bg-surface-secondary hover:text-text-primary"
          aria-label="閉じる"
          @click="emit('close')"
        >
          <span i-mdi:close class="text-sm" />
        </button>
      </div>
      <div class="mb-3 text-sm font-bold tabular-nums">{{ timeRange }}</div>
      <div v-if="events.length === 0" class="py-1 text-xs text-text-tertiary">
        紐づくイベントはありません
      </div>
      <div
        v-else
        class="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-x-2 gap-y-2 text-xs"
      >
        <template v-for="ev in events" :key="ev.id">
          <span
            class="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-text-primary font-bold"
            >{{ ev.name }}</span
          >
          <span
            class="justify-self-end text-xs text-text-tertiary tabular-nums"
            >{{ ev.timeLabel }}</span
          >
          <span
            class="inline-flex items-center justify-center rd-full px-2 py-0.5 text-xs font-bold"
            :class="
              ev.exclusive
                ? 'bg-room-exclusive-bg text-room-exclusive-fg'
                : 'bg-surface-accent-soft text-surface-accent-strong'
            "
            >{{ ev.exclusive ? '共用不可' : '共用可' }}</span
          >
        </template>
      </div>
    </div>
  </AnchoredPopover>
</template>
