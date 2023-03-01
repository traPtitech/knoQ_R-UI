<template>
  <span>
    <input :placeholder="placeholder" :value="modelValue" @input="onInput" />
  </span>
</template>

<script setup lang="ts">
const props = defineProps<{
  placeholder?: string;
  modelValue: string;
}>();
const emit = defineEmits<{
  (e: "update:modelValue", text: string): void;
}>();

const onInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  emit("update:modelValue", target.value);
};
</script>
