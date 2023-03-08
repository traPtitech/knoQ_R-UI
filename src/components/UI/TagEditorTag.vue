<template>
  <span>
    <span> {{ props.tag }} </span>
    <button v-if="locked" @click="onClickLockToggle">q</button>
    <button v-else @click="onClickLockToggle">r</button>
    <button @click="onClickDelete">x</button>
  </span>
</template>

<script setup lang="ts">
const props = defineProps<{
  tag: string;
  locked?: boolean;
}>();

const emit = defineEmits<{
  (e: "delete"): void;
  (e: "lock", locked: boolean): void;
}>();

const onClickLockToggle = (): void => {
  if (props.locked === undefined) {
    emit("lock", true);
  } else {
    emit("lock", !props.locked);
  }
};
const onClickDelete = (): void => {
  emit("delete");
};
</script>

<style lang="scss" module></style>
