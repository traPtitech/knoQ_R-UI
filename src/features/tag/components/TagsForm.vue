<template>
  <div :class="$style.editor">
    <TagElement
      v-for="tag in modelValue"
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
  modelValue: Tag[]
  suggestions?: string[]
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', v: Tag[]): void
}>()

const tagInputValue = ref('')

const onTagAdded = () => {
  const newTags = props.modelValue
  if (!newTags.map((t) => t.name).includes(tagInputValue.value) && tagInputValue.value !== '') {
    newTags.push({
      name: tagInputValue.value
    })
  }
  emit('update:modelValue', newTags)
  tagInputValue.value = ''
}
const onDeleteTag = (tagName: string) => {
  const newTags = props.modelValue.filter((t: Tag) => t.name !== tagName)
  console.log(newTags.map((t) => t.name))
  emit('update:modelValue', newTags)
}
const onChangeLockState = (tagName: string, lock: boolean) => {
  const newTags = props.modelValue.map((t: Tag) => {
    if (t.name === tagName) {
      return {
        name: tagName,
        locked: lock
      }
    } else {
      return t
    }
  })
  emit('update:modelValue', newTags)
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
