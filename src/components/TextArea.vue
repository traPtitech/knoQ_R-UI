<template>
  <div>
    <textarea
      :placeholder="props.placeholder"
      :value="modelValue"
      @input="onInput"
    />
  </div>
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
  const target = e.target as HTMLTextAreaElement;
  emit("update:modelValue", target.value);
};
</script>

<style lang="scss" module>
textarea {
  @include background-secondary;
  @include color-ui-primary;
  @include size-h3;
  resize: none;
  border: 0;
  width: 100%;
  height: 120px;

  &::placeholder {
    @include color-ui-secondary;
  }
}
</style>
