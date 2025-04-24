<template>
  <button
    @click="emits('click')"
    p-4
    bg-surface-accent-primary
    rd-2
    b
    b-solid
    b-border-accent-primary
    text-white
    btn-m
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
const props = defineProps<{}>()
const emits = defineEmits<{
  (e: 'click'): void
}>()
</script>
