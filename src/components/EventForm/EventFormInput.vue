<template>
  <input :placeholder="placeholder" v-bind="value" :class="$style.input" />
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
  @include background-secondary;
  @include color-ui-primary;
  @include size-h3;
  border: 0;
  width: 100%;
  height: 40px;

  &::placeholder {
    @include color-ui-secondary;
  }
}
</style>
