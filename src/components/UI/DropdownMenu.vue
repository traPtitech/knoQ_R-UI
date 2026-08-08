<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const isOpen = defineModel<boolean>('isOpen', { default: false })
withDefaults(
  defineProps<{
    align?: 'left' | 'right'
    widthClass?: string
  }>(),
  {
    align: 'left',
    widthClass: 'w-48'
  }
)

const dropdownRef = ref<HTMLElement | null>(null)

const toggle = () => {
  isOpen.value = !isOpen.value
}

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div ref="dropdownRef" class="relative inline-block">
    <div
      role="button"
      tabindex="0"
      class="cursor-pointer"
      @click="toggle"
      @keydown.enter="toggle"
      @keydown.space="toggle"
    >
      <slot name="trigger" />
    </div>
    <div
      v-if="isOpen"
      class="absolute z-10 mt-2 max-h-60 overflow-y-auto border border-border-secondary rounded-md bg-surface-primary shadow-lg"
      :class="[widthClass, align === 'right' ? 'right-0' : 'left-0']"
    >
      <slot />
    </div>
  </div>
</template>
