<template>
  <div :class="$style.editor">
    <TagEditorTag
      v-for="tag in tags"
      :key="tag.name"
      :tag="tag"
      @delete="onDeleteTag"
      @changeLockState="onChangeLockState"
    />
    <EventFormInput
      v-model="tagInputValue"
      placeholder="新規タグ"
      :class="$style.input"
      @keydown.enter="onTagAdded"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, ComputedRef } from 'vue'
import EventFormInput from './TextInput.vue'
import TagEditorTag from './TagEditorTag.vue'

interface Tag {
  name: string
  locked?: boolean
}
const props = defineProps<{
  tags: Tag[]
}>()
const emit = defineEmits<{
  (e: 'update:tags', newTags: Tag[]): void
}>()

const tagInputValue = ref('')

const focusInput = () => {}
const onTagAdded = () => {
  const newTags = props.tags
  if (!newTags.map((t) => t.name).includes(tagInputValue.value) && tagInputValue.value !== '') {
    newTags.push({
      name: tagInputValue.value
    })
  }
  emit('update:tags', newTags)
  tagInputValue.value = ''
}
const onDeleteTag = (tagName: string) => {
  const newTags = props.tags.filter((t: Tag) => t.name !== tagName)
  console.log(newTags.map((t) => t.name))
  emit('update:tags', newTags)
}
const onChangeLockState = (tagName: string, lock: boolean) => {
  const newTags = props.tags.map((t: Tag) => {
    if (t.name === tagName) {
      return {
        name: tagName,
        locked: lock
      }
    } else {
      return t
    }
  })
  emit('update:tags', newTags)
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
