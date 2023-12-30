<template>
  <span v-for="tag in props.tags" :key="tag.id" :class="$style.tag">
    <ATag :id="tag.id" :name="tag.name" />
  </span>
</template>

<script setup lang="ts">
import ATag from './ATag.vue'
const props = defineProps<{ tags: { id: string; name: string }[] }>()
</script>

<style lang="scss" module>
.tag {
  margin: 0 4px;
}
</style>
