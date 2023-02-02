<template>
  <div>
    <span v-for="tag in props.tags" :key="tag">
      <TagEditorTag :tag="tag" />
    </span>
    +
  </div>
</template>

<script setup lang="ts">
import TagEditorTag from "./TagEditorTag.vue";

const props = defineProps<{
  tags: string[];
}>();
</script>
