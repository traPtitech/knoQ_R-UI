<script setup lang="ts">
import { ref } from 'vue'

const isOpen = defineModel<boolean>({ default: false })
const dropdownRef = ref<HTMLElement | null>(null)

const toggle = () => {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <div ref="dropdownRef" class="relative">
    <div
      role="button"
      tabindex="0"
      @click="toggle"
      @keydown.enter="toggle"
      @keydown.space="toggle"
    >
      <slot name="trigger" />
    </div>
    <div
      v-if="isOpen"
      class="absolute right-0 mt-2 w-48 bg-surface-primary rounded-md shadow-lg z-10"
    >
      <slot />
    </div>
  </div>
</template>
