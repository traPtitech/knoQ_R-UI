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
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isBefore,
  startOfDay
} from 'date-fns'

const props = defineProps<{
  label?: string
  minDate?: Date
}>()

const selectedDates = defineModel<string[]>({ default: () => [] })

const currentMonth = ref(new Date())

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

const goToPreviousMonth = () => {
  currentMonth.value = subMonths(currentMonth.value, 1)
}

const goToNextMonth = () => {
  currentMonth.value = addMonths(currentMonth.value, 1)
}

const isSelected = (day: Date) => {
  const dateStr = format(day, 'yyyy-MM-dd')
  return selectedDates.value.includes(dateStr)
}

const isPastDate = (day: Date) => {
  const minDate = props.minDate || startOfDay(new Date())
  return isBefore(day, minDate)
}

const toggleDate = (day: Date) => {
  if (isPastDate(day)) return

  const dateStr = format(day, 'yyyy-MM-dd')
  const index = selectedDates.value.indexOf(dateStr)

  if (index === -1) {
    selectedDates.value = [...selectedDates.value, dateStr].sort()
  } else {
    selectedDates.value = selectedDates.value.filter((d) => d !== dateStr)
  }
}

const clearAll = () => {
  selectedDates.value = []
}
</script>

<template>
  <div class="grid gap-2">
    <div v-if="label" class="flex items-center justify-between">
      <h5 h5>{{ label }}</h5>
      <button
        v-if="selectedDates.length > 0"
        type="button"
        class="text-xs text-text-secondary transition-colors hover:text-red-500"
        @click="clearAll"
      >
        すべてクリア
      </button>
    </div>

    <div
      class="border border-border-secondary rounded-lg bg-surface-primary p-4"
    >

      <div class="mb-4 flex items-center justify-between">
        <button
          type="button"
          class="rounded p-1 text-text-secondary transition-colors hover:bg-surface-secondary hover:text-text-primary"
          @click="goToPreviousMonth"
        >
          <span i-mdi:chevron-left class="block text-xl" />
        </button>
        <span class="font-medium">{{ formattedMonth }}</span>
        <button
          type="button"
          class="rounded p-1 text-text-secondary transition-colors hover:bg-surface-secondary hover:text-text-primary"
          @click="goToNextMonth"
        >
          <span i-mdi:chevron-right class="block text-xl" />
        </button>
      </div>

      <div class="grid grid-cols-7 mb-2 gap-1 text-center text-xs font-medium">
        <span class="text-red-400">日</span>
        <span>月</span>
        <span>火</span>
        <span>水</span>
        <span>木</span>
        <span>金</span>
        <span class="text-blue-400">土</span>
      </div>

      <div class="grid grid-cols-7 gap-1">
        <button
          v-for="day in calendarDays"
          :key="day.toISOString()"
          type="button"
          class="relative aspect-square flex items-center justify-center rounded text-sm transition-all"
          :class="{
            'bg-surface-accent-primary text-white font-medium': isSelected(day),
            'ring-2 ring-surface-accent-primary ring-inset':
              isSameDay(day, new Date()) && !isSelected(day),
            'text-text-secondary/40': !isSameMonth(day, currentMonth),
            'cursor-not-allowed opacity-30': isPastDate(day),
            'hover:bg-surface-secondary':
              !isSelected(day) &&
              !isPastDate(day) &&
              isSameMonth(day, currentMonth),
            'cursor-pointer': !isPastDate(day)
          }"
          :disabled="isPastDate(day)"
          @click="toggleDate(day)"
        >
          {{ format(day, 'd') }}
        </button>
      </div>
    </div>

    <div v-if="selectedDates.length > 0" class="flex flex-wrap gap-2">
      <span
        v-for="dateStr in selectedDates"
        :key="dateStr"
        class="inline-flex items-center gap-1 rounded-full bg-surface-accent-primary/10 px-2 py-1 text-xs text-surface-accent-primary"
      >
        {{ format(new Date(dateStr), 'M/d (E)', { locale: undefined }) }}
        <button
          type="button"
          class="transition-colors hover:text-red-500"
          @click="selectedDates = selectedDates.filter((d) => d !== dateStr)"
        >
          <span i-mdi:close class="block text-sm" />
        </button>
      </span>
    </div>

    <p v-else class="text-sm text-text-secondary">
      カレンダーをクリックして候補日を選択してください
    </p>
  </div>
</template>
