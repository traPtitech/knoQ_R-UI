<template>
  <div>
    <input
      :placeholder="placeholder"
      v-model="value"
      :class="$style.input"
      :err="hasError"
    />
    <div>
      {{ err }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { ZodError } from "zod";
const props = defineProps<{
  placeholder?: string;
  modelValue: string;
  err?: ZodError;
}>();
const emit = defineEmits<{
  (e: "update:modelValue", text: string): void;
}>();

const value = computed({
  get() {
    return props.modelValue;
  },
  set(v: string) {
    emit("update:modelValue", v);
  },
});

const hasError = computed(() => !!props.err);
</script>

<style lang="scss" module>
input {
  @include background-secondary;
  @include color-ui-primary;
  @include size-h3;
  border: 0;
  height: 40px;
  width: 100%;

  &::placeholder {
    @include color-ui-secondary;
  }
  &[err="true"] {
    border: 2px solid #f00;
  }
}
</style>
