<template>
  <input :value="modelValue" type="datetime-local" @input="onInput" />
</template>
<script lang="ts" setup>
const props = defineProps<{
  modelValue: string
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', text: string): void
}>()

const onInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>
