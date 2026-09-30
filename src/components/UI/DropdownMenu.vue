<script setup lang="ts">
import { ref, useId, watch, nextTick, onMounted, onUnmounted } from 'vue'

const isOpen = defineModel<boolean>('isOpen', { default: false })
withDefaults(
  defineProps<{
    align?: 'left' | 'right'
    widthClass?: string
    triggerId?: string
    label?: string
    invalid?: boolean
    describedBy?: string
  }>(),
  {
    align: 'left',
    widthClass: 'w-48',
    triggerId: undefined,
    label: undefined,
    describedBy: undefined
  }
)

const dropdownRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLButtonElement | null>(null)
const panelId = useId()

watch(isOpen, async (open) => {
  if (open || !dropdownRef.value?.contains(document.activeElement)) return
  // Keep keyboard navigation at the selector after its chosen option disappears.
  await nextTick()
  triggerRef.value?.focus()
})

const closeWithKeyboard = (event: KeyboardEvent) => {
  if (
    event.key !== 'Escape' ||
    !dropdownRef.value?.contains(event.target as Node)
  )
    return
  event.preventDefault()
  event.stopPropagation()
  isOpen.value = false
  triggerRef.value?.focus()
}

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
  document.addEventListener('keydown', closeWithKeyboard)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', closeWithKeyboard)
})
</script>

<template>
  <div ref="dropdownRef" class="relative inline-block min-w-0">
    <button
      :id="triggerId"
      ref="triggerRef"
      type="button"
      :aria-label="label"
      :aria-expanded="isOpen"
      :aria-controls="panelId"
      :aria-invalid="invalid || undefined"
      :aria-describedby="describedBy"
      class="block min-h-11 w-full cursor-pointer rounded-lg bg-transparent text-left"
      @click="toggle"
    >
      <slot name="trigger" />
    </button>
    <div
      v-if="isOpen"
      :id="panelId"
      class="absolute z-30 mt-2 max-h-80 max-w-screen overflow-y-auto border border-border-primary rounded-lg bg-surface-primary shadow-lg"
      :class="[widthClass, align === 'right' ? 'right-0' : 'left-0']"
    >
      <slot />
    </div>
  </div>
</template>
