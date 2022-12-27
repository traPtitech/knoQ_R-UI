<template>
  <h1 :class="$style.name">{{ props.event_name }}</h1>
</template>

<script setup lang="ts">
const props = defineProps<{ event_name: String }>();
</script>

<style lang="scss" module>
.name {
  @include color-ui-primary;
  font-size: 2.25rem;
}
</style>
