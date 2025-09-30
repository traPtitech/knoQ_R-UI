<script setup lang="ts">
const emits = defineEmits<{
  (e: 'click'): void
}>()
</script>

<template>
  <button btn-primary @click="emits('click')">
    <slot />
  </button>
</template>
