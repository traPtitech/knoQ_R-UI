<template>
  <RouterLink :to="tagPath" :class="$style.link">
    <span :class="$style.tag">{{ props.name }}</span>
  </RouterLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps<{ id: string; name: string }>()
const tagPath = computed(() => `/events?tags=${props.id}`)
</script>

<style lang="scss" module>
.link {
  text-decoration: none;
}

.tag {
  @include size-caption;
  @include color-ui-secondary;
  background-color: $bg-secondary;
  border-radius: 4px;
  padding: 4px;

  &:hover {
    background-color: $bg-tertiary;
  }
}
</style>
