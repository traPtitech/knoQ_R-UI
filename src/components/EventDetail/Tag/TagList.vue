<template>
  <span :class="$style.tag" v-bind:key="tag.id" v-for="tag in props.tags">
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
