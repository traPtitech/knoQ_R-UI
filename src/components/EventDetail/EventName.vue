<template>
  <div :class="$style.name">{{ props.event_name }}</div>
</template>

<script setup lang="ts">
const props = defineProps<{ event_name: String }>();
</script>

<style lang="scss" module>
.name {
  font-size: 34pt;
}
</style>
