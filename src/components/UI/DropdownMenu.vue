<script setup lang="ts">
import { ref } from 'vue'

const isOpen = ref(false)

const toggle = () => {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <div class="relative">
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
