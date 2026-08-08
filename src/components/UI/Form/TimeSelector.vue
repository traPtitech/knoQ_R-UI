<script setup lang="ts">
import { computed, useId } from 'vue'

const props = defineProps<{
  label?: string
  minTime?: string
  maxTime?: string
}>()

const id = useId()

const modelValue = defineModel<string>({ default: '12:00' })

const timeOptions = computed(() => {
  const options: { value: string; label: string }[] = []
  const minMinutes = props.minTime ? parseTime(props.minTime) : 0
  const maxMinutes = props.maxTime ? parseTime(props.maxTime) : 24 * 60

  for (let minutes = 0; minutes <= 24 * 60; minutes += 60) {
    if (minutes < minMinutes || minutes > maxMinutes) continue

    const hours = Math.floor(minutes / 60)
    const value = `${String(hours).padStart(2, '0')}:00`
    options.push({ value, label: value })
  }

  return options
})

function parseTime(time: string): number {
  const [hours, mins] = time.split(':').map(Number)
  return hours * 60 + mins
}
</script>

<template>
  <div class="grid gap-1">
    <!-- eslint-disable-next-line vuejs-accessibility/label-has-for -->
    <label v-if="label" :for="id" class="text-xs text-text-secondary">{{
      label
    }}</label>
    <select
      :id="id"
      v-model="modelValue"
      :aria-label="label"
      class="input-base w-auto cursor-pointer"
    >
      <option v-for="opt in timeOptions" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </option>
    </select>
  </div>
</template>
