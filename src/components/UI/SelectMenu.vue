<script setup lang="ts">
import { ref, computed } from 'vue'
import DropdownMenu from '/@/components/UI/DropdownMenu.vue'

interface Item {
  id: string
  name: string
}

const props = defineProps<{
  items: Item[]
  label: string
  id?: string
  invalid?: boolean
  describedBy?: string
}>()

const emit = defineEmits<{
  (e: 'select', item: Item): void
}>()

const isOpen = ref(false)
const searchQuery = ref('')

const filteredItems = computed(() => {
  if (!searchQuery.value) return props.items
  return props.items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const handleSelect = (item: Item) => {
  emit('select', item)
  isOpen.value = false
  searchQuery.value = ''
}
</script>

<template>
  <DropdownMenu
    v-model:is-open="isOpen"
    :trigger-id="id"
    :invalid="invalid"
    :described-by="describedBy"
    width-class="w-full min-w-48"
  >
    <template #trigger>
      <span
        class="input-base flex items-center justify-between gap-4"
        :class="{ 'border-status-error': invalid }"
      >
        <span>{{ label }}</span>
        <span
          i-mdi:chevron-down
          shrink-0
          text-xl
          text-text-secondary
          aria-hidden="true"
        />
      </span>
    </template>
    <div class="border-b border-border-secondary p-2">
      <input
        v-model="searchQuery"
        class="input-base bg-surface-secondary"
        aria-label="選択肢を検索"
        placeholder="検索..."
        @click.stop
      />
    </div>
    <div class="max-h-60 overflow-y-auto py-1">
      <div
        v-if="filteredItems.length === 0"
        class="px-4 py-2 text-sm text-text-secondary"
      >
        見つかりません
      </div>
      <button
        v-for="item in filteredItems"
        :key="item.id"
        type="button"
        class="block min-h-12 w-full px-4 py-3 text-left text-base text-text-primary hover:bg-surface-accent-soft"
        @click.stop="handleSelect(item)"
      >
        {{ item.name }}
      </button>
    </div>
  </DropdownMenu>
</template>
