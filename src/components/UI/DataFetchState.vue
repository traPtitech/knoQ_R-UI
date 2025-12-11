<script setup lang="ts">
import { SwrvState } from '/@/composables/useSwrvState'

defineProps<{
  state: SwrvState
  isEmpty?: boolean
}>()
</script>

<template>
  <div v-if="state === 'pending'">
    <slot name="loading">
      <div class="grid gap-4 animate-pulse">
        <div class="h-32 bg-surface-secondary rd-xl" />
      </div>
    </slot>
  </div>
  <div v-else-if="state === 'error'">
    <slot name="error">
      <div class="text-center py-8 text-text-secondary">
        データの取得に失敗しました
      </div>
    </slot>
  </div>
  <div v-else-if="isEmpty">
    <slot name="empty">
      <div class="text-center py-8 text-text-secondary">データがありません</div>
    </slot>
  </div>
  <div v-else>
    <slot />
  </div>
</template>
