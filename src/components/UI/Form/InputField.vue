<script setup lang="ts">
import { computed, useAttrs } from 'vue'

defineOptions({
  inheritAttrs: false
})

const props = defineProps<{
  label?: string
  id?: string
  error?: boolean
}>()
const model = defineModel<string>()

const attrs = useAttrs()

// wrapper receives class and style (layout)
const wrapperClass = computed(() => attrs.class)
const wrapperStyle = computed(() => attrs.style)

// input receives functional attributes (type, placeholder, etc.)
const inputAttrs = computed(() => {
  const { class: c, style: s, ...rest } = attrs
  return rest
})

// Input styling
const baseStyle =
  'box-border px-4 py-3 b b-solid rd-1 w-full bg-surface-primary text-text-primary'
const borderStyle = computed(() =>
  props.error ? 'b-red-500' : 'b-border-primary'
)
</script>

<template>
  <label
    v-if="label"
    grid
    gap-1
    :for="id"
    :class="wrapperClass"
    :style="wrapperStyle"
  >
    <p h5>{{ label }}</p>
    <input
      :id="id"
      v-model="model"
      :class="[baseStyle, borderStyle]"
      v-bind="inputAttrs"
    />
  </label>
  <input
    v-else
    :id="id"
    v-model="model"
    :class="[baseStyle, borderStyle, wrapperClass]"
    :style="wrapperStyle"
    v-bind="inputAttrs"
  />
</template>
