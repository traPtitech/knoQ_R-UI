<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
  startOfWeek,
  endOfWeek,
  isSameMonth
} from 'date-fns'
import AppHeader from '/@/components/AppHeader.vue'
import EventCard from '/@/features/event/components/EventCard.vue'
import RoomList from '/@/features/room/components/RoomList.vue'
import { apiClient } from '/@/lib/api'
import type { components } from '/@/lib/api/schema'
import type { KnoqEvent } from '/@/features/event/types'

type Room = components['schemas']['ResponseRoom']

const currentMonth = ref(new Date())
const events = ref<KnoqEvent[]>([])
const rooms = ref<Room[]>([])
const selectedDate = ref<Date>(new Date())

const calendarDays = computed(() => {
  const startMonth = startOfMonth(currentMonth.value)
  const endMonth = endOfMonth(currentMonth.value)
  const startDate = startOfWeek(startMonth)
  const endDate = endOfWeek(endMonth)
  return eachDayOfInterval({ start: startDate, end: endDate })
})

const formattedMonth = computed(() => {
  return format(currentMonth.value, 'yyyy年MM月')
})

const fetchData = async () => {
  const start = startOfWeek(startOfMonth(currentMonth.value)).toISOString()
  const end = endOfWeek(endOfMonth(currentMonth.value)).toISOString()

  const [eventsRes, roomsRes] = await Promise.all([
    apiClient.GET('/events', {
      params: { query: { dateBegin: start, dateEnd: end } }
    }),
    apiClient.GET('/rooms', {
      params: { query: { dateBegin: start, dateEnd: end } }
    })
  ])

  if (eventsRes.data) {
    events.value = eventsRes.data
  }
  if (roomsRes.data) {
    rooms.value = roomsRes.data
  }
}

const goToPreviousMonth = () => {
  currentMonth.value = subMonths(currentMonth.value, 1)
}

const goToNextMonth = () => {
  currentMonth.value = addMonths(currentMonth.value, 1)
}

const selectDate = (date: Date) => {
  selectedDate.value = date
}

const eventsForSelectedDate = computed(() => {
  if (!selectedDate.value) return []
  return events.value.filter((event) =>
    isSameDay(parseISO(event.timeStart), selectedDate.value)
  )
})

const roomsForSelectedDate = computed(() => {
  if (!selectedDate.value) return []
  return rooms.value.filter((room) =>
    isSameDay(parseISO(room.timeStart), selectedDate.value)
  )
})

const getEventsForDay = (day: Date) => {
  return events.value.filter((event) =>
    isSameDay(parseISO(event.timeStart), day)
  )
}

const getRoomsForDay = (day: Date) => {
  return rooms.value.filter((room) => isSameDay(parseISO(room.timeStart), day))
}

watch(currentMonth, () => {
  fetchData()
})

onMounted(() => {
  fetchData()
})
</script>

<template>
  <AppHeader />
  <div class="grid mx-auto my-8 max-w-3xl gap-8 p-4">
    <div class="mb-4 flex items-center justify-between">
      <button
        class="input-base w-auto cursor-pointer hover:bg-surface-secondary"
        @click="goToPreviousMonth"
      >
        &lt; 前月
      </button>
      <h2 hl>{{ formattedMonth }}</h2>
      <button
        class="input-base w-auto cursor-pointer hover:bg-surface-secondary"
        @click="goToNextMonth"
      >
        次月 &gt;
      </button>
    </div>

    <div>
      <div class="grid grid-cols-7 mb-2 gap-1 text-center font-bold">
        <span class="text-red-500">日</span>
        <span>月</span>
        <span>火</span>
        <span>水</span>
        <span>木</span>
        <span>金</span>
        <span class="text-blue-500">土</span>
      </div>

      <div class="grid grid-cols-7 gap-1">
        <div
          v-for="day in calendarDays"
          :key="day.toISOString()"
          role="button"
          tabindex="0"
          class="relative aspect-square flex flex-col cursor-pointer items-center border border-border-secondary rounded-md p-1 transition-colors hover:bg-surface-secondary"
          :class="{
            'bg-surface-accent-primary/10': isSameDay(day, new Date()),
            'text-text-secondary bg-surface-secondary/30': !isSameMonth(
              day,
              currentMonth
            ),
            'ring-2 ring-surface-accent-primary': isSameDay(day, selectedDate)
          }"
          @click="selectDate(day)"
          @keydown.enter="selectDate(day)"
          @keydown.space.prevent="selectDate(day)"
        >
          <span
            class="text-sm"
            :class="{ 'font-bold': isSameDay(day, new Date()) }"
          >
            {{ format(day, 'd') }}
          </span>
          <div
            class="mt-1 w-full flex flex-wrap content-start justify-center gap-0.5 px-1"
          >
            <div
              v-for="event in getEventsForDay(day)"
              :key="event.eventId"
              class="h-1.5 w-1.5 rounded-full bg-surface-accent-primary"
              :title="event.name"
            ></div>
            <div
              v-for="room in getRoomsForDay(day)"
              :key="room.roomId"
              class="h-1.5 w-1.5 rounded-full bg-text-secondary"
              :title="room.place"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <div>
      <h3 hm mb-4>{{ format(selectedDate, 'yyyy年MM月dd日') }} のイベント</h3>
      <div v-if="eventsForSelectedDate.length === 0">予定はありません</div>
      <div v-else class="grid gap-4">
        <EventCard
          v-for="event in eventsForSelectedDate"
          :key="event.eventId"
          :event="event"
        />
      </div>
    </div>

    <div>
      <h3 hm mb-4>{{ format(selectedDate, 'yyyy年MM月dd日') }} の進捗部屋</h3>
      <div v-if="roomsForSelectedDate.length === 0">予定はありません</div>
      <RoomList v-else :rooms="roomsForSelectedDate" />
    </div>
  </div>
</template>
