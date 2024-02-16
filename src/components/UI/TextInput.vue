<template>
  <label>
    {{ label }}
    <input v-model="modelValue" type="text" />
  </label>
</template>
<script setup lang="ts">
defineProps<{
  label: string
}>()
const modelValue = defineModel<string>()
</script>
