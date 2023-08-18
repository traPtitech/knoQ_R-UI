<template>
  <div :class="$style.container" @click="emit('update:modelValue', !modelValue)">
    <input type="checkbox" v-model="value" :class="$style.checkbox" />
    {{ text }}
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{
  text: string
  modelValue: boolean
}>()
const value = computed({
  get() {
    return props.modelValue
  },
  set(v: boolean) {
    emit('update:modelValue', v)
  }
})
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
}>()
</script>

<style lang="scss" module>
.container {
  display: flex;
  align-items: center;
}
.checkbox {
  width: 16px;
}
</style>
