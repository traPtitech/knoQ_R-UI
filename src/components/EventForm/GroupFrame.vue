<template>
  <div :class="$style.box" :selected="open">
    <div :class="$style.header" :selected="open" @click="emit('click')">
      <div :class="$style.toggle" />
      <div>
        {{ title }}
      </div>
    </div>
    <div v-if="open">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string
  open: boolean
}>()
const emit = defineEmits<{
  (e: 'click'): void
}>()
</script>

<style lang="scss" module>
.box {
  border-radius: 8px;
  margin: 16px 0 0 0;
  position: relative;
  &[selected='true'] {
    border: 1px solid black;
    padding: 20px 16px 16px 16px;
  }
  &[selected='false'] {
    padding-top: 8px;
  }
}
.header {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  position: absolute;
  top: 0;
  left: 0;
  transform: translateY(-50%) translateX(-4px);
  padding: 0 8px 0 0;
  background-color: #fff;
}
.toggle {
  height: 16px;
  width: 16px;
  border-radius: 50%;
  [selected='true'] & {
    background-color: $ui-secondary;
  }
  [selected='false'] & {
    background-color: $ui-tertiary;
  }
}
</style>
