<script setup lang="ts">
import { computed } from 'vue'

defineProps<{
  label?: string
}>()

// 0=日, 1=月, ..., 6=土
const selectedWeekdays = defineModel<number[]>({ default: () => [] })

const weekdays = [
  { value: 0, label: '日', color: 'text-red-500' },
  { value: 1, label: '月', color: '' },
  { value: 2, label: '火', color: '' },
  { value: 3, label: '水', color: '' },
  { value: 4, label: '木', color: '' },
  { value: 5, label: '金', color: '' },
  { value: 6, label: '土', color: 'text-blue-500' }
]

const isSelected = (weekday: number) => {
  return selectedWeekdays.value.includes(weekday)
}

const toggleWeekday = (weekday: number) => {
  selectedWeekdays.value = isSelected(weekday)
    ? selectedWeekdays.value.filter((w) => w !== weekday)
    : [...selectedWeekdays.value, weekday].sort()
}

const selectedWeekdayLabels = computed(() => {
  return selectedWeekdays.value
    .map((w) => weekdays.find((wd) => wd.value === w)?.label)
    .filter(Boolean)
})

const clearAll = () => {
  selectedWeekdays.value = []
}
</script>

<template>
  <div class="grid gap-2">
    <div v-if="label" class="flex items-center justify-between">
      <h5 h5>{{ label }}</h5>
      <button
        v-if="selectedWeekdays.length > 0"
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
      <div class="flex justify-center gap-2">
        <button
          v-for="day in weekdays"
          :key="day.value"
          type="button"
          class="h-12 w-12 flex items-center justify-center rounded-lg text-sm font-medium transition-all"
          :class="{
            'bg-surface-accent-primary text-white': isSelected(day.value),
            'bg-surface-secondary hover:bg-surface-accent-primary/20':
              !isSelected(day.value),
            [day.color]: !isSelected(day.value) && day.color
          }"
          @click="toggleWeekday(day.value)"
        >
          {{ day.label }}
        </button>
      </div>
    </div>

    <div v-if="selectedWeekdays.length > 0" class="text-sm text-text-secondary">
      毎週 {{ selectedWeekdayLabels.join('・') }}曜日
    </div>
    <p v-else class="text-sm text-text-secondary">
      曜日をクリックして選択してください
    </p>

  </div>
</template>
