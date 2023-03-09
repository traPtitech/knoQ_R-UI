<template>
  <div :class="$style.editor">
    <span v-for="tag in tags" :key="tag.name">
      <TagEditorTag
        :tag="tag.name"
        :locked="tag.locked"
        @delete="emit('delete', tag.name)"
        @lock="(lock) => emit('lock', tag.name, lock)"
      />
    </span>
    <span v-if="editing">
      <input v-model="tagInputValue" />
      <button @click="onTagAdded">追加</button>
    </span>
    <button v-else @click="editing = true">+</button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, ComputedRef } from "vue";
import TagEditorTag from "./TagEditorTag.vue";

interface Tag {
  name: string;
  locked?: boolean;
}
const props = defineProps<{
  tags: Tag[];
}>();
const emit = defineEmits<{
  (e: "add", tagName: string): void;
  (e: "delete", tagName: string): void;
  (e: "lock", tagName: string, locked: boolean): void;
}>();

const tagInputValue = ref("");
const editing = ref(false);

const onClick = () => (editing.value = true);
const onTagAdded = () => {
  emit("add", tagInputValue.value);
  tagInputValue.value = "";
  editing.value = false;
};
</script>

<style lang="scss" module>
.editor {
  border: solid 1px #000000;
}
</style>
