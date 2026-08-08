<script setup lang="ts">
import { computed } from 'vue'
import { isSameDay, parseISO } from 'date-fns'
import type { RoomWithEvents } from '/@/features/room/types'
import {
  GRID_H,
  H_END,
  H_START,
  ROW_H,
  layoutDay,
  minutesToBottom,
  minutesToTop
} from '/@/features/room/lib/weekLayout'
import RoomBlock from './RoomBlock.vue'

const WD = ['日', '月', '火', '水', '木', '金', '土'] as const

const props = defineProps<{
  days: Date[]
  rooms: RoomWithEvents[]
}>()

defineEmits<{
  (e: 'select', payload: { room: RoomWithEvents; anchorEl: HTMLElement }): void
}>()

const today = new Date()

const ROW_LINE_COLOR = '#E2E2E2'
const rowLineGradient = `repeating-linear-gradient(to bottom, transparent 0, transparent calc(${ROW_H}px - 1px), ${ROW_LINE_COLOR} calc(${ROW_H}px - 1px), ${ROW_LINE_COLOR} ${ROW_H}px)`

const hours = computed(() => {
  const arr: number[] = []
  for (let h = H_START; h <= H_END; h++) arr.push(h)
  return arr
})

type LaidOutBlock = {
  key: string
  room: RoomWithEvents
  top: number
  height: number
  leftPct: number
  widthPct: number
}

const blocksPerDay = computed<LaidOutBlock[][]>(() =>
  props.days.map((day) => {
    const onDay = props.rooms.filter((r) =>
      isSameDay(parseISO(r.timeStart), day)
    )
    return layoutDay(onDay).map((it) => {
      const top = minutesToTop(it.startMin)
      const bottom = minutesToBottom(it.endMin)
      const widthPct = 100 / it.lanes
      return {
        key: it.room.roomId,
        room: it.room,
        top,
        height: Math.max(30, bottom - top),
        leftPct: widthPct * it.lane,
        widthPct
      }
    })
  })
)

const dayClasses = (d: Date) => {
  const dow = d.getDay()
  const isToday = isSameDay(d, today)
  return {
    bg: isToday
      ? 'bg-surface-accent-soft'
      : dow === 0 || dow === 6
        ? 'bg-background-background'
        : 'bg-surface-primary',
    dowText:
      dow === 0
        ? 'text-weekday-sun'
        : dow === 6
          ? 'text-weekday-sat'
          : 'text-text-secondary'
  }
}
</script>

<template>
  <div
    class="overflow-hidden b-1 b-border-secondary rd-3 b-solid bg-surface-primary shadow-sm"
  >
    <div class="max-h-[74vh] overflow-auto">
      <div
        class="grid grid-cols-[58px_repeat(7,minmax(132px,1fr))] min-w-[940px]"
      >
        <!-- corner -->
        <div
          class="sticky left-0 top-0 z-50 b-b-1 b-r-1 b-b-border-secondary b-r-border-secondary b-b-solid b-r-solid bg-surface-primary"
        />
        <!-- day headers -->
        <div
          v-for="d in days"
          :key="`h-${d.toISOString()}`"
          class="sticky top-0 z-40 b-b-1 b-r-1 b-b-border-secondary b-r-border-secondary b-b-solid b-r-solid px-1 pb-2 pt-2 text-center last:b-r-0"
          :class="dayClasses(d).bg"
        >
          <div
            class="text-xs font-extrabold tracking-wider"
            :class="dayClasses(d).dowText"
          >
            {{ WD[d.getDay()] }}
          </div>
          <div
            class="grid mx-auto mt-1 h-8 w-8 place-items-center rd-full text-lg font-extrabold"
            :class="
              isSameDay(d, today) ? 'bg-surface-accent-primary text-white' : ''
            "
          >
            {{ d.getDate() }}
          </div>
        </div>

        <!-- gutter -->
        <div
          class="sticky left-0 z-30 b-r-1 b-r-border-secondary b-r-solid bg-surface-primary"
          :style="{ height: `${GRID_H}px`, position: 'relative' }"
        >
          <div
            v-for="h in hours"
            :key="`g-${h}`"
            class="absolute right-2 text-xs text-text-tertiary font-semibold tabular-nums -translate-y-2"
            :style="{ top: `${(h - H_START) * ROW_H}px` }"
          >
            {{ h }}:00
          </div>
        </div>

        <!-- day columns -->
        <div
          v-for="(d, di) in days"
          :key="`c-${d.toISOString()}`"
          class="relative b-r-1 b-r-border-secondary b-r-solid last:b-r-0"
          :class="dayClasses(d).bg"
          :style="{
            height: `${GRID_H}px`,
            backgroundImage: rowLineGradient
          }"
        >
          <RoomBlock
            v-for="b in blocksPerDay[di]"
            :key="b.key"
            :room="b.room"
            :top="b.top"
            :height="b.height"
            :left-pct="b.leftPct"
            :width-pct="b.widthPct"
            @click="$emit('select', $event)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
