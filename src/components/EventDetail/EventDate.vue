<template>
  <div :class="$style.date">{{ props.time_start }}</div>
  >
  <div :class="$style.date">{{ props.time_end }}</div>
</template>

<script setup lang="ts">
const props = defineProps<{ time_start: string; time_end: string }>();
</script>

<style lang="scss" module>
.date {
  font-size: 24px;
}
</style>
