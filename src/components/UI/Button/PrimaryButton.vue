<script setup lang="ts">
withDefaults(
  defineProps<{ type?: 'button' | 'submit' | 'reset'; loading?: boolean }>(),
  { type: 'button' }
)
const emits = defineEmits<{
  (e: 'click'): void
}>()
</script>

<template>
  <button
    :type="type"
    :aria-busy="loading || undefined"
    btn-primary
    @click="emits('click')"
  >
    <span
      v-if="loading"
      class="i-mdi:loading animate-spin"
      aria-hidden="true"
    />
    <slot />
  </button>
</template>
