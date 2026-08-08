<script setup lang="ts">
import { Schedule } from '/@/features/event/types'

defineProps<{
  schedule: Schedule | undefined
}>()

const emit = defineEmits<{
  (e: 'update:schedule', schedule: Schedule): void
}>()

const options: {
  value: Schedule
  label: string
  icon: string
  activeClass: string
}[] = [
  {
    value: 'attendance',
    label: '参加',
    icon: 'i-mdi:check-circle',
    activeClass: 'bg-primary text-white border-primary'
  },
  {
    value: 'pending',
    label: '未定',
    icon: 'i-mdi:help-circle',
    activeClass: 'bg-yellow-500 text-white border-yellow-500'
  },
  {
    value: 'absent',
    label: '不参加',
    icon: 'i-mdi:close-circle',
    activeClass: 'bg-gray-500 text-white border-gray-500'
  }
]
</script>

<template>
  <div class="w-full flex flex-col gap-3">
    <div class="grid grid-cols-3 gap-2">
      <button
        v-for="option in options"
        :key="option.value"
        type="button"
        class="flex flex-col items-center justify-center gap-1 border-2 rounded-lg p-2 transition-all duration-200"
        :class="[
          schedule === option.value
            ? option.activeClass
            : 'bg-surface-secondary text-text-secondary border-transparent hover:bg-surface-tertiary'
        ]"
        @click="emit('update:schedule', option.value)"
      >
        <div :class="[option.icon, 'text-2xl']" />
        <span class="text-xs font-bold">{{ option.label }}</span>
      </button>
    </div>
    <div class="text-center text-sm">
      現在のステータス:
      <span
        class="font-bold"
        :class="{
          'text-primary': schedule === 'attendance',
          'text-yellow-600': schedule === 'pending',
          'text-gray-500': schedule === 'absent'
        }"
      >
        {{ options.find((o) => o.value === schedule)?.label }}
      </span>
    </div>
  </div>
</template>
