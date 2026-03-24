<script setup lang="ts">
import { computed } from 'vue'

export type DisplayStatus = 'unanswered' | 'answered' | 'confirmed'

const props = defineProps<{
  status: DisplayStatus
}>()

const config = computed(() => {
  switch (props.status) {
    case 'unanswered':
      return {
        label: '未回答',
        classes:
          'bg-status-accepting/10 text-status-accepting b-status-accepting/30'
      }
    case 'answered':
      return {
        label: '回答済',
        classes:
          'bg-status-answered/10 text-status-answered b-status-answered/10'
      }
    case 'confirmed':
      return {
        label: '確定済',
        classes:
          'bg-status-confirmed/10 text-status-confirmed b-status-confirmed/20'
      }
    default:
      return {
        label: '',
        classes: ''
      }
  }
})
</script>

<template>
  <div
    shrink-0
    b-1
    rounded-md
    b-solid
    px-2.5
    py-1
    text-xs
    fw-500
    tracking-wide
    :class="config.classes"
  >
    {{ config.label }}
  </div>
</template>
