<script setup lang="ts">
defineProps<{
  label?: string
  id: string
}>()
const model = defineModel<string>()
const style = 'box-border px-4 py-3 b b-solid b-border-primary rd-1'
</script>

<template>
  <label v-if="label" grid gap-1 :for="id">
    <p hxs>{{ label }}</p>
    <input v-model="model" :class="style" :id/>
  </label>
  <input v-else v-model="model" :class="style" />
</template>
