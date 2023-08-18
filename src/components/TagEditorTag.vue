<template>
  <span :class="$style.tag">
    <span> {{ tag.name }} </span>
    <button v-if="tag.locked" @click="onClickLockToggle">
      <AIcon name="lock" />
    </button>
    <button v-else @click="onClickLockToggle" :class="$style.button">
      <AIcon name="lockOpen" />
    </button>
    <button @click="onClickDelete" :class="$style.button">
      <AIcon name="close" />
    </button>
  </span>
</template>

<script setup lang="ts">
import AIcon from './UI/AIcon.vue'

interface Tag {
  name: string
  locked?: boolean
}
const props = defineProps<{
  tag: Tag
}>()

const emit = defineEmits<{
  (e: 'delete', tagName: string): void
  (e: 'changeLockState', tagName: string, locked: boolean): void
}>()

const onClickLockToggle = (): void => {
  if (props.tag.locked === undefined) {
    emit('changeLockState', props.tag.name, true)
  } else {
    emit('changeLockState', props.tag.name, !props.tag.locked)
  }
}
const onClickDelete = (): void => {
  emit('delete', props.tag.name)
}
</script>

<style lang="scss" module>
.tag {
  @include background-primary;
  border: 1px solid black;
  border-radius: 4px;
  display: flex;
  align-items: center;
  height: 32px;
}

.button {
  // border-radius: 100%;
  // width: 24px;
  // height: 24px;
  // border: 0;
}
</style>
