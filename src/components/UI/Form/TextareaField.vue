<script setup lang="ts">
defineProps<{
  label: string
  id: string
}>()
defineOptions({ inheritAttrs: false })
const model = defineModel<string>()
</script>

<template>
  <label grid gap-1 :for="id">
    <p h5>{{ label }}</p>
    <textarea :id="id" v-model="model" class="input-base" v-bind="$attrs" />
  </label>
</template>
