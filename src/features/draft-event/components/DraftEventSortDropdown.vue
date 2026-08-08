<script lang="ts" setup>
import { computed, ref } from 'vue'
import DropdownMenu from '/@/components/UI/DropdownMenu.vue'

export type SortKey = 'deadline-asc' | 'deadline-desc' | 'status'

const modelValue = defineModel<SortKey>({ required: true })

const isOpen = ref(false)

const sortOptions: { key: SortKey; label: string }[] = [
  { key: 'deadline-asc', label: '締切日が近い順' },
  { key: 'deadline-desc', label: '締切日が遠い順' },
  { key: 'status', label: 'ステータス順' }
]

const currentLabel = computed(() => {
  const opt = sortOptions.find((o) => o.key === modelValue.value)
  return opt?.label ?? ''
})

function select(key: SortKey) {
  modelValue.value = key
  isOpen.value = false
}
</script>

<template>
  <DropdownMenu v-model:is-open="isOpen">
    <template #trigger>
      <div
        flex
        items-center
        gap-1.5
        rounded-md
        px-2.5
        py-1.5
        text-sm
        text-text-secondary
        transition-colors
        hover:bg-surface-secondary
      >
        <span i-material-symbols:swap-vert />
        {{ currentLabel }}
      </div>
    </template>

    <button
      v-for="opt in sortOptions"
      :key="opt.key"
      type="button"
      w-full
      flex
      cursor-pointer
      items-center
      gap-2
      rounded-md
      b-none
      px-3
      py-2
      text-sm
      transition-colors
      :class="
        modelValue === opt.key
          ? 'bg-surface-accent-primary/10 text-surface-accent-primary fw-500'
          : 'bg-transparent text-text-secondary hover:bg-surface-secondary'
      "
      @click.stop="select(opt.key)"
    >
      <span w-4 text-surface-accent-primary>
        {{ modelValue === opt.key ? '✓' : '' }}
      </span>
      {{ opt.label }}
    </button>
  </DropdownMenu>
</template>
