<script setup lang="ts">
defineProps<{ label: string; id: string }>()
</script>

<template>
  <label grid gap-2 grid-flow-col grid-auto-cols-max :for="id">
    <input type="checkbox" :id />
    {{ label }}
  </label>
</template>
