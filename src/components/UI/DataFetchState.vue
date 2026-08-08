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
      <div class="grid animate-pulse gap-4">
        <div class="h-32 rd-xl bg-surface-secondary" />
      </div>
    </slot>
  </div>
  <div v-else-if="state === 'error'">
    <slot name="error">
      <div class="py-8 text-center text-text-secondary">
        データの取得に失敗しました
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
