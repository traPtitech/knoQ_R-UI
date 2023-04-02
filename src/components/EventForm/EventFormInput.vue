<template>
  <span>
    <input :placeholder="placeholder" v-bind="value" :class="$style.input" />
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";
const props = defineProps<{
  placeholder?: string;
  modelValue: string;
}>();
const emit = defineEmits<{
  (e: "update:modelValue", text: string): void;
}>();

const value = computed({
  get() {
    return props.modelValue;
  },
  set(v) {
    emit("update:modelValue", v);
  },
});
</script>

<style lang="scss" module>
input {
}
</style>
