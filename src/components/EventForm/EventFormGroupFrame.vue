<template>
  <div :class="$style.box" :selected="open">
    <div :class="$style.frame">
      <div :class="$style.header" @click="emit('click')" :selected="open">
        <div :class="$style.toggle" />
        <div>
          {{ title }}
        </div>
      </div>
      <div v-if="open">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string;
  open: boolean;
}>();
const emit = defineEmits<{
  (e: "click"): void;
}>();
</script>

<style lang="scss" module>
.box {
  border-radius: 8px;
  padding: 16px 8px 8px 8px;
  position: relative;
  &[selected="true"] {
    border: 1px solid black;
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
  [selected="true"] & {
    background-color: $ui-secondary;
  }
  [selected="false"] & {
    background-color: $ui-tertiary;
  }
}
</style>
