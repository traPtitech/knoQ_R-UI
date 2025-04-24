<script setup lang="ts">
defineProps<{
  label: string
}>()
const model = defineModel<string>()
</script>

<template>
  <label grid gap-1>
    <p hxs>{{ label }}</p>
    <textarea
      v-model="model"
      box-border
      px-4
      py-3
      b
      b-solid
      b-border-primary
      rd-1
    />
  </label>
</template>
