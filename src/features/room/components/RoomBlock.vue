<script setup lang="ts">
import { computed } from 'vue'
import type { RoomWithEvents } from '/@/features/room/types'
import {
  ROW_H,
  assignLanes,
  minutesOfDay
} from '/@/features/room/lib/weekLayout'

const props = defineProps<{
  room: RoomWithEvents
  top: number
  height: number
  leftPct: number
  widthPct: number
}>()

defineEmits<{
  (e: 'click', payload: { room: RoomWithEvents; anchorEl: HTMLElement }): void
}>()

const shortPlace = computed(() => props.room.place.replace(/\s*\(.+\)$/, ''))

const blockStartMin = computed(() => minutesOfDay(props.room.timeStart))

type Segment = {
  id: string
  name: string
  top: number
  height: number
  exclusive: boolean
  startMin: number
  endMin: number
  lane: number
  lanes: number
}

const segments = computed<Segment[]>(() => {
  const raw = props.room.events.map((ev) => {
    const es = minutesOfDay(ev.timeStart)
    const ee = minutesOfDay(ev.timeEnd)
    return {
      id: ev.eventId,
      name: ev.name,
      top: Math.max(0, ((es - blockStartMin.value) / 60) * ROW_H),
      height: Math.max(15, ((ee - es) / 60) * ROW_H),
      exclusive: !ev.sharedRoom,
      startMin: es,
      endMin: ee
    }
  })
  return assignLanes(
    raw,
    (it) => it.startMin,
    (it) => it.endMin
  )
})
</script>

<template>
  <button
    type="button"
    class="absolute cursor-pointer overflow-hidden b-1 b-room-open-border rd-2 b-solid bg-surface-accent-soft transition-all duration-100 hover:z-50 hover:shadow-sm hover:brightness-98"
    :style="{
      top: `${top}px`,
      height: `${height}px`,
      left: `calc(${leftPct}% + 2px)`,
      width: `calc(${widthPct}% - 4px)`
    }"
    @click="
      (e) => $emit('click', { room, anchorEl: e.currentTarget as HTMLElement })
    "
  >
    <span
      class="absolute bottom-0 left-0 top-0 z-40 w-1 bg-surface-accent-primary"
    />
    <div class="absolute bottom-0 left-1 right-0 top-0 z-10">
      <div
        v-for="seg in segments"
        :key="seg.id"
        class="absolute flex flex-col justify-center gap-px overflow-hidden px-2 py-1"
        :class="
          seg.exclusive
            ? 'bg-room-exclusive-bg b-y-1 b-y-room-exclusive-border b-y-solid'
            : 'bg-room-open-bg'
        "
        :style="{
          top: `${seg.top}px`,
          height: `${seg.height}px`,
          left: `${(seg.lane / seg.lanes) * 100}%`,
          width: `${(1 / seg.lanes) * 100}%`
        }"
      >
        <span
          class="block overflow-hidden text-ellipsis whitespace-nowrap text-left text-xs font-bold"
          :class="
            seg.exclusive
              ? 'text-room-exclusive-fg'
              : 'text-surface-accent-strong'
          "
          >{{ seg.name }}</span
        >
      </div>
    </div>
    <div
      class="absolute left-1 right-0 top-0 z-30 flex items-baseline gap-1 px-2 py-1"
    >
      <span
        class="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-left text-xs text-surface-accent-strong font-extrabold"
        >{{ shortPlace }}</span
      >
    </div>
  </button>
</template>
