<template>
  <label>
    <input v-model="modelValue" type="checkbox" />
    {{ label }}
  </label>
</template>

<script setup lang="ts">
defineProps<{
  label: string
}>()
const modelValue = defineModel<boolean>()
</script>
