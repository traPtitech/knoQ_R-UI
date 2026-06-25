<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  weekStart: Date
  weekEnd: Date
}>()

const emit = defineEmits<{
  (e: 'prev'): void
  (e: 'next'): void
  (e: 'today'): void
}>()

const label = computed(() => {
  const s = props.weekStart
  const e = props.weekEnd
  const sameMo = s.getMonth() === e.getMonth()
  const tail = sameMo
    ? `${e.getDate()}日`
    : `${e.getMonth() + 1}月${e.getDate()}日`
  return {
    year: s.getFullYear(),
    range: `${s.getMonth() + 1}月${s.getDate()}日 – ${tail}`
  }
})
</script>

<template>
  <div flex flex-wrap items-center gap-2.5>
    <div flex gap-1>
      <button
        type="button"
        b="1 solid border-secondary"
        grid
        h-8
        w-8
        place-items-center
        rd-2
        bg-surface-primary
        text-text-secondary
        transition-colors
        hover:b-border-primary
        hover:text-text-primary
        aria-label="前の週"
        @click="emit('prev')"
      >
        <span i-mdi:chevron-left text-base />
      </button>
      <button
        type="button"
        b="1 solid border-secondary"
        grid
        h-8
        w-8
        place-items-center
        rd-2
        bg-surface-primary
        text-text-secondary
        transition-colors
        hover:b-border-primary
        hover:text-text-primary
        aria-label="次の週"
        @click="emit('next')"
      >
        <span i-mdi:chevron-right text-base />
      </button>
    </div>
    <button
      type="button"
      b="1 solid border-secondary"
      rd-2
      px-3.5
      py-1.5
      text-xs
      text-text-secondary
      font-bold
      transition-colors
      hover:b-border-primary
      hover:text-text-primary
      @click="emit('today')"
    >
      今週
    </button>
    <div ml-1 flex items-baseline gap-1.5 text-base font-extrabold>
      <span text-xs text-text-tertiary font-bold>{{ label.year }}</span>
      <span>{{ label.range }}</span>
    </div>
  </div>
</template>
