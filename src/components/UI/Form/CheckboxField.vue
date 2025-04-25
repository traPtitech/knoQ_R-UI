<script setup lang="ts">
defineProps<{ label: string }>()
</script>

<template>
  <label grid gap-2 grid-flow-col grid-auto-cols-max grid->
    <input type="checkbox" />
    {{ label }}
  </label>
</template>
