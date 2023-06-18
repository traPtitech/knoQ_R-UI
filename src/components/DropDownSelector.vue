<template>
  <select v-model="val">
    <option :value="op.value" v-for="op in options" :key="op.value">
      {{ op.name }}
    </option>
  </select>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{
  modelValue: string
  options: { name: string; value: string }[]
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
}>()

const val = computed({
  get: () => props.modelValue,
  set: (v: string) => emit('update:modelValue', v)
})
</script>
