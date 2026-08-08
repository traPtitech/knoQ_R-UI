<script lang="ts" setup>
import { computed, ref } from 'vue'
import DropdownMenu from '/@/components/UI/DropdownMenu.vue'

const typeFilter = defineModel<string[]>('typeFilter', { required: true })
const statusFilter = defineModel<string[]>('statusFilter', { required: true })

const isOpen = ref(false)

const typeOptions = [
  { key: 'invited', label: '招待されたイベント' },
  { key: 'public', label: '公開イベント' }
]

const statusOptions = [
  { key: 'unanswered', label: '未回答' },
  { key: 'answered', label: '回答済' },
  { key: 'confirmed', label: '確定済' }
]

const totalActive = computed(
  () => typeFilter.value.length + statusFilter.value.length
)

const activeKeys = computed(() => [
  ...typeFilter.value.map((k) => ({ key: k, group: 'type' as const })),
  ...statusFilter.value.map((k) => ({ key: k, group: 'status' as const }))
])

function toggle(list: string[], key: string): string[] {
  return list.includes(key) ? list.filter((k) => k !== key) : [...list, key]
}

function toggleType(key: string) {
  typeFilter.value = toggle(typeFilter.value, key)
}

function toggleStatus(key: string) {
  statusFilter.value = toggle(statusFilter.value, key)
}

function removeChip(group: 'type' | 'status', key: string) {
  if (group === 'type') toggleType(key)
  else toggleStatus(key)
}

function clearAll() {
  typeFilter.value = []
  statusFilter.value = []
}

function chipLabel(key: string): string {
  const all = [...typeOptions, ...statusOptions]
  return all.find((o) => o.key === key)?.label ?? key
}
</script>

<template>
  <DropdownMenu v-model:is-open="isOpen" width-class="w-64">
    <template #trigger>
      <div
        flex
        items-center
        gap-1.5
        rounded-md
        px-2.5
        py-1.5
        text-sm
        fw-500
        transition-colors
        :class="
          totalActive > 0
            ? 'bg-surface-accent-primary/10 text-surface-accent-primary hover:bg-surface-accent-primary/20'
            : 'text-text-secondary hover:bg-surface-secondary'
        "
      >
        <span i-material-symbols:filter-list />
        フィルター
        <span
          v-if="totalActive > 0"
          h-4.5
          min-w-4.5
          inline-flex
          items-center
          justify-center
          rounded-full
          bg-surface-accent-primary
          text-xs
          text-white
          fw-500
        >
          {{ totalActive }}
        </span>
      </div>
    </template>

    <div>
      <!-- Header -->
      <div
        flex
        items-center
        justify-between
        b-b="1 solid border-secondary"
        px-4
        pb-2
        pt-3
      >
        <span text-sm fw-500>フィルター</span>
        <button
          v-if="totalActive > 0"
          type="button"
          class="cursor-pointer rounded b-none bg-transparent px-1.5 py-0.5 text-xs text-surface-accent-primary fw-500 transition-colors hover:bg-surface-accent-primary/10"
          @click.stop="clearAll"
        >
          クリア
        </button>
      </div>

      <!-- Type section -->
      <div px-4 pb-1.5 pt-2.5>
        <div mb-2 text-xs text-text-secondary fw-500 tracking-wide uppercase>
          種別
        </div>
        <button
          v-for="opt in typeOptions"
          :key="opt.key"
          type="button"
          w-full
          flex
          cursor-pointer
          items-center
          gap-2.5
          rounded-md
          b-none
          bg-transparent
          px-1
          py-2
          text-sm
          transition-colors
          hover:bg-surface-secondary
          @click.stop="toggleType(opt.key)"
        >
          <span
            h-4
            w-4
            inline-flex
            shrink-0
            items-center
            justify-center
            b-2
            rounded
            b-solid
            transition-all
            :class="
              typeFilter.includes(opt.key)
                ? 'b-surface-accent-primary bg-surface-accent-primary'
                : 'b-border-secondary bg-transparent'
            "
          >
            <span
              v-if="typeFilter.includes(opt.key)"
              i-material-symbols:check
              text-xs
              text-white
            />
          </span>
          {{ opt.label }}
        </button>
      </div>

      <div mx-4 h-px bg-surface-secondary />

      <!-- Status section -->
      <div px-4 pb-3.5 pt-2.5>
        <div mb-2 text-xs text-text-secondary fw-500 tracking-wide uppercase>
          回答状態
        </div>
        <button
          v-for="opt in statusOptions"
          :key="opt.key"
          type="button"
          w-full
          flex
          cursor-pointer
          items-center
          gap-2.5
          rounded-md
          b-none
          bg-transparent
          px-1
          py-2
          text-sm
          transition-colors
          hover:bg-surface-secondary
          @click.stop="toggleStatus(opt.key)"
        >
          <span
            h-4
            w-4
            inline-flex
            shrink-0
            items-center
            justify-center
            b-2
            rounded
            b-solid
            transition-all
            :class="
              statusFilter.includes(opt.key)
                ? 'b-surface-accent-primary bg-surface-accent-primary'
                : 'b-border-secondary bg-transparent'
            "
          >
            <span
              v-if="statusFilter.includes(opt.key)"
              i-material-symbols:check
              text-xs
              text-white
            />
          </span>
          {{ opt.label }}
        </button>
      </div>
    </div>
  </DropdownMenu>

  <!-- Active filter chips -->
  <span
    v-for="chip in activeKeys"
    :key="`${chip.group}-${chip.key}`"
    class="inline-flex items-center gap-1 rounded bg-surface-accent-primary/10 px-2 py-0.5 text-xs text-surface-accent-primary fw-500"
  >
    {{ chipLabel(chip.key) }}
    <button
      type="button"
      cursor-pointer
      b-none
      bg-transparent
      p-0
      text-sm
      text-surface-accent-primary
      leading-none
      opacity-50
      hover:opacity-100
      :aria-label="`${chipLabel(chip.key)}フィルターを解除`"
      @click="removeChip(chip.group, chip.key)"
    >
      &times;
    </button>
  </span>
</template>
