<script lang="ts" setup>
import { computed } from 'vue'

type Variant = 'info' | 'warning' | 'danger'

const props = withDefaults(
  defineProps<{
    variant?: Variant
  }>(),
  { variant: 'info' }
)

const variantClasses = {
  info: {
    wrapper: 'border-surface-accent-primary bg-surface-accent-soft',
    icon: 'i-mdi:information text-surface-accent-primary'
  },
  warning: {
    wrapper: 'border-amber-500/30 bg-amber-500/10',
    icon: 'i-mdi:alert text-amber-500'
  },
  danger: {
    wrapper: 'border-status-error bg-surface-primary',
    icon: 'i-mdi:alert-circle text-status-error'
  }
} as const

const classes = computed(() => variantClasses[props.variant])
</script>

<template>
  <div
    class="flex items-start gap-3 border border-l-4 rounded-lg border-solid p-5 text-base leading-relaxed"
    :class="classes.wrapper"
  >
    <span
      class="mt-1 shrink-0 text-xl"
      :class="classes.icon"
      aria-hidden="true"
    />
    <div class="flex-1">
      <slot />
    </div>
  </div>
</template>
