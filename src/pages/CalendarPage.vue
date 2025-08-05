<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameDay,
  addMonths,
  subMonths,
  parseISO
} from 'date-fns'
import AppHeader from '/@/components/AppHeader.vue'
import EventCard from '/@/features/event/components/EventCard.vue'
import { useApiFetch } from '/@/composables/useApiFetch'
import type { Event } from '/@/features/event/types'

const currentMonth = ref(new Date())

const daysInMonth = computed(() => {
  const start = startOfMonth(currentMonth.value)
  const end = endOfMonth(currentMonth.value)
  return eachDayOfInterval({ start, end })
})

const formattedMonth = computed(() => {
  return format(currentMonth.value, 'yyyy年MM月')
})

const goToPreviousMonth = () => {
  currentMonth.value = subMonths(currentMonth.value, 1)
}

const goToNextMonth = () => {
  currentMonth.value = addMonths(currentMonth.value, 1)
}

const selectedDate = ref<Date | null>(null)

const selectDate = (date: Date) => {
  selectedDate.value = date
}

const { data: events, error: eventsError } = useApiFetch<Event[]>('/events')

const eventsForSelectedDate = computed(() => {
  if (!selectedDate.value || !events.value) return []
  return events.value.filter((event) =>
    isSameDay(parseISO(event.timeStart), selectedDate.value!)
  )
})
</script>

<template>
  <AppHeader />
  <div class="max-w-3xl my-8 mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">カレンダー</h1>

    <div class="flex justify-between items-center mb-4">
      <button
        @click="goToPreviousMonth"
        class="px-4 py-2 bg-primary text-white rounded-md"
      >
        前月
      </button>
      <h2 class="text-xl font-semibold">{{ formattedMonth }}</h2>
      <button
        @click="goToNextMonth"
        class="px-4 py-2 bg-primary text-white rounded-md"
      >
        次月
      </button>
    </div>

    <div class="grid grid-cols-7 gap-2 text-center font-bold mb-2">
      <span>日</span>
      <span>月</span>
      <span>火</span>
      <span>水</span>
      <span>木</span>
      <span>金</span>
      <span>土</span>
    </div>

    <div class="grid grid-cols-7 gap-2">
      <div
        v-for="day in daysInMonth"
        :key="day.toISOString()"
        class="p-2 border rounded-md cursor-pointer"
        :class="{
          'bg-blue-200': isSameDay(day, new Date()),
          'bg-gray-100':
            !isSameDay(day, new Date()) && !isSameDay(day, selectedDate),
          'bg-blue-400 text-white': isSameDay(day, selectedDate)
        }"
        @click="selectDate(day)"
      >
        {{ format(day, 'd') }}
      </div>
    </div>

    <div class="mt-8">
      <h3 class="text-xl font-semibold mb-4">
        {{
          selectedDate
            ? format(selectedDate, 'yyyy年MM月dd日')
            : '日付を選択してください'
        }}
        のイベント
      </h3>
      <div v-if="eventsError">イベントの読み込みに失敗しました</div>
      <div v-else-if="!events">イベントを読み込み中...</div>
      <div v-else-if="eventsForSelectedDate.length === 0">
        選択された日付にイベントはありません
      </div>
      <div v-else class="grid gap-4">
        <EventCard
          v-for="event in eventsForSelectedDate"
          :key="event.eventId"
          :event="event"
        />
      </div>
    </div>
  </div>
</template>
