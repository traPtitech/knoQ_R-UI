<template>
  <span :class="$style.tag">
    <span> {{ tag.name }} </span>
    <button v-if="tag.locked" @click="onClickLockToggle">
      <AIcon name="lock" />
    </button>
    <button v-else :class="$style.button" @click="onClickLockToggle">
      <AIcon name="lockOpen" />
    </button>
    <button :class="$style.button" @click="onClickDelete">
      <AIcon name="close" />
    </button>
  </span>
</template>

<script setup lang="ts">
import { Tag } from '..'
import AIcon from '/@/components/UI/AIcon.vue'

const props = defineProps<{
  tag: Tag
}>()

const emit = defineEmits<{
  (e: 'delete'): void
  (e: 'changeLockState', locked: boolean): void
}>()

const onClickLockToggle = (): void => {
  if (props.tag.locked === undefined) {
    emit('changeLockState', true)
  } else {
    emit('changeLockState', !props.tag.locked)
  }
}
const onClickDelete = (): void => {
  emit('delete')
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
</style>
