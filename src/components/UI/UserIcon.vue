<template><img :class="$style.icon" :src="iconUrl" /></template>

<script lang="ts" setup>
import { computed } from "@vue/reactivity";
const props = defineProps<{ userName: string }>();
const iconUrl = computed(
  () => `https://q.trap.jp/api/v3/public/icon/${props.userName}`
);
</script>

<style lang="scss" module>
.icon {
  width: 32px;
  height: 32px;
}
</style>
