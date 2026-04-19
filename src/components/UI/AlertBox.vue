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
    wrapper:
      'border-surface-accent-primary/30 bg-surface-accent-primary/10',
    icon: 'i-mdi:information text-surface-accent-primary'
  },
  warning: {
    wrapper: 'border-amber-500/30 bg-amber-500/10',
    icon: 'i-mdi:alert text-amber-500'
  },
  danger: {
    wrapper: 'border-status-error/30 bg-status-error/10',
    icon: 'i-mdi:alert-circle text-status-error'
  }
} as const

const classes = computed(() => variantClasses[props.variant])
</script>

<template>
  <div
    class="flex items-start gap-2 rounded border border-solid p-3 text-sm"
    :class="classes.wrapper"
  >
    <span class="mt-0.5" :class="classes.icon" />
    <div class="flex-1">
      <slot />
    </div>
  </div>
</template>
