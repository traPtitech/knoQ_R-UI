<script setup lang="ts">
defineProps<{ label: string; id: string }>()
</script>

<template>
  <label grid grid-auto-cols-max grid-flow-col gap-2 :for="id">
    <input :id type="checkbox" />
    {{ label }}
  </label>
</template>
