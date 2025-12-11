<script setup lang="ts">
import { ref, computed } from 'vue'
import DropdownMenu from './DropdownMenu.vue'

interface Item {
  id: string
  name: string
}

const props = defineProps<{
  items: Item[]
  label: string
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
  <DropdownMenu v-model:is-open="isOpen">
    <template #trigger>
      <div
        class="input-base w-auto flex items-center justify-between gap-2 px-3 py-2 text-sm hover:bg-surface-secondary transition-colors"
      >
        <span>{{ label }}</span>
        <span i-mdi:chevron-down text-text-secondary />
      </div>
    </template>
    <div class="p-2 border-b border-border-secondary">
      <input
        v-model="searchQuery"
        class="w-full px-2 py-1 text-sm bg-surface-secondary rounded border-none focus:outline-none"
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
        class="block w-full text-left px-4 py-2 text-sm hover:bg-surface-secondary text-text-primary transition-colors"
        @click.stop="handleSelect(item)"
      >
        {{ item.name }}
      </button>
    </div>
  </DropdownMenu>
</template>
