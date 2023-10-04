<template>
  <div :class="$style.editor">
    <TagElement
      v-for="tag in tags"
      :key="tag.name"
      :tag="tag"
      @delete="() => onDeleteTag(tag.name)"
      @changeLockState="(state) => onChangeLockState(tag.name, state)"
    />
    <TextInput
      v-model="tagInputValue"
      placeholder="新規タグ"
      :class="$style.input"
      @keydown.enter="onTagAdded"
    />
  </div>
  <div v-if="suggestions">
    {{ suggestions }}
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TextInput from '../../../components/TextInput.vue'
import TagElement from './TagElement.vue'
import { Tag } from '..'

const props = defineProps<{
  tags: Tag[]
  suggestions?: string[]
}>()
const emit = defineEmits<{
  (e: 'add', tagName: string): void
  (e: 'update', tagName: string, locked: boolean): void
  (e: 'delete', tagName: string): void
}>()

const tagInputValue = ref('')

const onTagAdded = () => {
  if (!props.tags.map((t) => t.name).includes(tagInputValue.value) && tagInputValue.value !== '') {
    emit('add', tagInputValue.value)
  }
  tagInputValue.value = ''
}
const onDeleteTag = (tagName: string) => {
  emit('delete', tagName)
}
const onChangeLockState = (tagName: string, lock: boolean) => {
  emit('update', tagName, lock)
}
</script>

<style lang="scss" module>
.editor {
  @include background-secondary;
  @include color-ui-primary;
  @include size-h3;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.input {
  min-width: 40px;
  flex-grow: 1;
}
</style>
