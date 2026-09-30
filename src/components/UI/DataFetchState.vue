<script setup lang="ts">
import { SwrvState } from '/@/composables/useSwrvState'

defineProps<{
  state: SwrvState
  isEmpty?: boolean
}>()
</script>

<template>
  <div v-if="state === 'pending'" role="status" aria-label="読み込み中">
    <slot name="loading">
      <div class="grid animate-pulse gap-4">
        <div class="h-32 rounded-lg bg-surface-secondary" aria-hidden="true" />
      </div>
    </slot>
  </div>
  <div v-else-if="state === 'error'" role="status">
    <slot name="error">
      <div
        class="flex items-start gap-2 border border-status-error rounded-lg bg-surface-primary p-5 text-sm text-status-error"
      >
        <span
          class="i-mdi:alert-circle-outline mt-1 shrink-0 text-lg"
          aria-hidden="true"
        />
        <span
          >データの取得に失敗しました．時間をおいて，もう一度お試しください．</span
        >
      </div>
    </slot>
  </div>
  <div v-else-if="isEmpty">
    <slot name="empty">
      <div class="py-8 text-center text-text-secondary">データがありません</div>
    </slot>
  </div>
  <div v-else>
    <slot />
  </div>
</template>
