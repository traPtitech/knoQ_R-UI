<template>
  <div :class="$style.title">
    {{ props.title }}
  </div>
  <slot />
</template>

<script setup lang="ts">
const props = defineProps<{ title: string }>();
</script>
<style lang="scss" module>
.title {
  @include color-ui-secondary;
  font-size: 1rem;
}
</style>
