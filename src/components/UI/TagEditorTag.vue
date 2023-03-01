<template>
  <span>
    <span> {{ props.tag }} </span>
    <button @click="onClick">x</button>
  </span>
</template>

<script setup lang="ts">
const props = defineProps<{
  tag: string;
}>();
const emit = defineEmits<{
  (e: "delete"): void;
}>();

const onClick = (): void => {
  emit("delete");
};
</script>

<style lang="scss" module></style>
