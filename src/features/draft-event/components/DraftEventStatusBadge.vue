<script setup lang="ts">
import { computed } from 'vue'
import type { DraftEventStatus } from '../types'

const props = defineProps<{
  status: DraftEventStatus
}>()

const statusMap: Record<DraftEventStatus, { label: string; class: string }> = {
  open: { label: '回答受付中', class: 'bg-green-100 text-green-700' },
  closed: { label: '締切済み', class: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: '確定済み', class: 'bg-blue-100 text-blue-700' }
}

const current = computed(() => statusMap[props.status])
</script>

<template>
  <span class="rounded-full px-3 py-1 text-xs font-medium" :class="current.class">
    {{ current.label }}
  </span>
</template>
