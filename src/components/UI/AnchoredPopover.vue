<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps<{
  anchorEl: HTMLElement
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const popRef = ref<HTMLElement | null>(null)
const pos = ref<{ left: number; top: number } | null>(null)

const computePosition = () => {
  const pop = popRef.value
  if (!pop) return
  const ar = props.anchorEl.getBoundingClientRect()
  const pw = pop.offsetWidth
  const ph = pop.offsetHeight
  const vw = window.innerWidth
  const vh = window.innerHeight
  let left = ar.right + 8
  if (left + pw > vw - 10) left = ar.left - 8 - pw
  if (left < 10) left = Math.min(Math.max(10, (vw - pw) / 2), vw - pw - 10)
  let top = ar.top
  if (top + ph > vh - 10) top = vh - ph - 10
  if (top < 10) top = 10
  pos.value = { left, top }
}

const onDocClick = (e: MouseEvent) => {
  const t = e.target as Node | null
  if (!t) return
  if (popRef.value?.contains(t)) return
  if (props.anchorEl.contains(t)) return
  emit('close')
}

const onKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape') emit('close')
}

onMounted(() => {
  computePosition()
  document.addEventListener('click', onDocClick)
  document.addEventListener('keydown', onKey)
  window.addEventListener('resize', computePosition)
  window.addEventListener('scroll', computePosition, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick)
  document.removeEventListener('keydown', onKey)
  window.removeEventListener('resize', computePosition)
  window.removeEventListener('scroll', computePosition, true)
})
</script>

<template>
  <Teleport to="body">
    <div
      ref="popRef"
      class="fixed z-50 overflow-hidden b-1 b-border-secondary rd-3 b-solid bg-surface-primary shadow-2xl"
      :style="
        pos
          ? { left: `${pos.left}px`, top: `${pos.top}px` }
          : { left: '-9999px', top: '-9999px' }
      "
      role="dialog"
    >
      <slot />
    </div>
  </Teleport>
</template>
