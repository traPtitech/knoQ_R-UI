<template>
  <button @click="emits('click')">{{ name }}</button>
</template>

<script setup lang="ts">
const props = defineProps<{
  name: string
}>()
const emits = defineEmits<{
  (e: 'click'): void
}>()
</script>
