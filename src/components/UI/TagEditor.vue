<template>
  <div :class="$style.editor">
    <span v-for="tag in validTags" :key="tag.name">
      <TagEditorTag :tag="tag.name" @delete="onDeleteTag(tag.name)" />
    </span>
    <button v-if="!editing" @click="onClick">+</button>
    <span v-else>
      <input v-model="tagInputValue" />
      <button @click="onTagAdded">追加</button>
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, ComputedRef } from "vue";
import TagEditorTag from "./TagEditorTag.vue";

interface Tag {
  name?: string;
  locked?: boolean;
}
const props = defineProps<{
  tags: Tag[];
}>();
const emit = defineEmits<{
  (e: "add", tagName: string): void;
  (e: "delete", tagName: string): void;
}>();

const tagInputValue = ref("");
const editing = ref(false);

const validTags = computed(() =>
  props.tags.filter(
    (t): t is { name: string; locked?: boolean } => t.name !== undefined
  )
);

const onClick = () => (editing.value = true);
const onTagAdded = () => {
  emit("add", tagInputValue.value);
  tagInputValue.value = "";
  editing.value = false;
};
const onDeleteTag = (tag: string) => {
  emit("delete", tag);
};
</script>

<style lang="scss" module>
.editor {
  border: solid 1px #000000;
}
</style>
