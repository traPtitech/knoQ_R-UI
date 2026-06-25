<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue'
import {
  addWeeks,
  eachDayOfInterval,
  endOfWeek,
  startOfWeek,
  subWeeks
} from 'date-fns'
import AppHeader from '/@/components/AppHeader.vue'
import WeekNavigator from '/@/features/room/components/WeekNavigator.vue'
import WeekCalendar from '/@/features/room/components/WeekCalendar.vue'
import RoomDetailPopover from '/@/features/room/components/RoomDetailPopover.vue'
import { useWeekRooms } from '/@/features/room/composables/useWeekRooms'
import type { RoomWithEvents } from '/@/features/room/types'

const anchor = ref<Date>(new Date())

const weekStart = computed(() => startOfWeek(anchor.value))
const weekEnd = computed(() => endOfWeek(anchor.value))
const days = computed(() =>
  eachDayOfInterval({ start: weekStart.value, end: weekEnd.value })
)

const dateBegin = computed(() => weekStart.value.toISOString())
const dateEnd = computed(() => weekEnd.value.toISOString())

const { rooms } = useWeekRooms(dateBegin, dateEnd)

const selectedRoom = shallowRef<RoomWithEvents | null>(null)
const anchorEl = shallowRef<HTMLElement | null>(null)

const onSelect = (payload: { room: RoomWithEvents; anchorEl: HTMLElement }) => {
  selectedRoom.value = payload.room
  anchorEl.value = payload.anchorEl
}

const closePopover = () => {
  selectedRoom.value = null
  anchorEl.value = null
}

const goPrev = () => {
  anchor.value = subWeeks(anchor.value, 1)
  closePopover()
}
const goNext = () => {
  anchor.value = addWeeks(anchor.value, 1)
  closePopover()
}
const goToday = () => {
  anchor.value = new Date()
  closePopover()
}
</script>

<template>
  <AppHeader />
  <div class="mx-auto max-w-[1200px] px-4 pb-12 pt-6">
    <header class="mb-4 flex items-center justify-between gap-3">
      <h1 h1>進捗部屋</h1>
    </header>

    <div class="mb-3">
      <WeekNavigator
        :week-start="weekStart"
        :week-end="weekEnd"
        @prev="goPrev"
        @next="goNext"
        @today="goToday"
      />
    </div>

    <WeekCalendar :days="days" :rooms="rooms" @select="onSelect" />

    <RoomDetailPopover
      v-if="selectedRoom && anchorEl"
      :room="selectedRoom"
      :anchor-el="anchorEl"
      @close="closePopover"
    />
  </div>
</template>
