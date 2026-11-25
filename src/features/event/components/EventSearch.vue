<script setup lang="ts">
import { computed, onMounted } from 'vue'
import SelectMenu from '/@/components/UI/SelectMenu.vue'
import InputField from '/@/components/UI/Form/InputField.vue'
import DataFetchState from '/@/components/UI/DataFetchState.vue'
import EventCardList from '/@/features/event/components/EventCardList.vue'
import { useEventSearch } from '/@/features/event/composables/useEventSearch'

const {
  filters,
  events,
  error,
  state,
  isValidating,
  validationError,
  tags,
  users,
  groups,
  optionsError,
  search,
  reset,
  retry,
  loadOptions
} = useEventSearch()

type SelectionKey = 'tagIds' | 'userIds' | 'groupIds'
const selectionMenus = computed(() => [
  {
    key: 'tagIds' as const,
    label: 'タグ',
    icon: 'i-mdi:tag-outline',
    items: tags.value
  },
  {
    key: 'userIds' as const,
    label: 'ユーザー',
    icon: 'i-mdi:account-outline',
    items: users.value
  },
  {
    key: 'groupIds' as const,
    label: 'グループ',
    icon: 'i-mdi:account-group-outline',
    items: groups.value
  }
])
const chips = computed(() =>
  selectionMenus.value.flatMap((menu) =>
    filters[menu.key].map((id) => ({
      key: menu.key,
      id,
      icon: menu.icon,
      name: menu.items.find((item) => item.id === id)?.name ?? id,
      label: `${menu.label}: ${menu.items.find((item) => item.id === id)?.name ?? id}`
    }))
  )
)
const addSelection = (key: SelectionKey, id: string) => {
  if (!filters[key].includes(id)) filters[key] = [...filters[key], id]
}
const removeSelection = (key: SelectionKey, id: string) => {
  filters[key] = filters[key].filter((selected) => selected !== id)
}

onMounted(() => {
  void search()
})
</script>

<template>
  <main class="grid mx-auto max-w-4xl gap-8 p-4">
    <h1 class="h1">イベント検索</h1>

    <form class="grid gap-5 card" @submit.prevent="search()">
      <div class="grid gap-2">
        <span id="event-keyword-label" class="h5">キーワード</span>
        <div
          class="grid min-w-0 gap-2 border border-border-primary rounded bg-surface-primary px-4 py-3 focus-within:ring-2 focus-within:ring-border-accent-primary"
        >
          <input
            id="event-keyword"
            v-model="filters.keyword"
            aria-labelledby="event-keyword-label"
            type="search"
            placeholder="イベント名・説明から検索"
            class="min-w-0 w-full border-0 bg-transparent p-0 outline-none"
          />
          <div
            v-if="chips.length"
            class="min-w-0 flex flex-wrap items-center gap-2"
          >
            <span
              v-for="chip in chips"
              :key="`${chip.key}-${chip.id}`"
              :title="chip.label"
              class="max-w-full inline-flex items-center gap-1 rounded bg-surface-accent-primary/10 px-2 py-0.5 text-xs text-surface-accent-primary fw-500"
            >
              <span
                :class="chip.icon"
                class="shrink-0 text-sm"
                aria-hidden="true"
              />
              <span class="sr-only"
                >{{
                  selectionMenus.find((menu) => menu.key === chip.key)?.label
                }}:
              </span>
              <span class="min-w-0 break-words">{{ chip.name }}</span>
              <button
                type="button"
                class="h-5 w-5 inline-flex shrink-0 items-center justify-center p-0 opacity-50 hover:opacity-100"
                :aria-label="`${chip.label}を解除`"
                @click="removeSelection(chip.key, chip.id)"
              >
                <span class="i-mdi:close block text-sm" aria-hidden="true" />
              </button>
            </span>
          </div>
        </div>
        <fieldset
          class="m-0 min-w-0 flex flex-wrap items-center gap-2 border-0 p-0"
        >
          <legend class="sr-only">絞り込み条件</legend>
          <SelectMenu
            v-for="menu in selectionMenus"
            :key="menu.key"
            :label="`${menu.label}を追加`"
            :items="
              menu.items.filter((item) => !filters[menu.key].includes(item.id))
            "
            @select="addSelection(menu.key, $event.id)"
          />
        </fieldset>
      </div>
      <div
        v-if="optionsError"
        role="alert"
        class="flex flex-wrap items-center gap-2 text-sm"
      >
        <p class="text-status-error">{{ optionsError }}</p>
        <button
          type="button"
          class="underline underline-offset-4"
          @click="loadOptions"
        >
          再試行
        </button>
      </div>
      <details>
        <summary class="cursor-pointer text-sm">
          期間を指定
          <span
            v-if="filters.dateBegin || filters.dateEnd"
            class="ml-2 text-text-secondary"
          >
            {{ filters.dateBegin || '指定なし' }} 〜
            {{ filters.dateEnd || '指定なし' }}
          </span>
        </summary>
        <div class="grid mt-4 gap-4 sm:grid-cols-2">
          <InputField
            id="event-date-begin"
            v-model="filters.dateBegin"
            label="開始日"
            type="date"
            :error="Boolean(validationError)"
            :aria-invalid="Boolean(validationError)"
            :aria-describedby="
              validationError ? 'event-filter-error' : undefined
            "
          />
          <InputField
            id="event-date-end"
            v-model="filters.dateEnd"
            label="終了日"
            type="date"
            :error="Boolean(validationError)"
            :aria-invalid="Boolean(validationError)"
            :aria-describedby="
              validationError ? 'event-filter-error' : undefined
            "
          />
        </div>
      </details>
      <p
        v-if="validationError"
        id="event-filter-error"
        role="alert"
        class="text-sm text-status-error"
      >
        {{ validationError }}
      </p>
      <div
        class="flex flex-col gap-4 border-t border-border-secondary pt-5 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <label
            for="event-include-past"
            class="flex cursor-pointer items-center gap-2"
          >
            <input
              id="event-include-past"
              v-model="filters.includePast"
              type="checkbox"
              class="h-4 w-4 accent-surface-accent-primary"
            />
            過去のイベントを含める
          </label>
        </div>
        <div class="flex shrink-0 gap-3">
          <button
            type="button"
            class="rounded-lg px-4 py-2 text-sm hover:bg-surface-secondary"
            @click="reset"
          >
            条件をリセット
          </button>
          <button
            type="submit"
            class="flex btn-primary items-center justify-center gap-2"
          >
            <span class="i-mdi:magnify" aria-hidden="true" />検索
          </button>
        </div>
      </div>
    </form>

    <section aria-labelledby="event-results-heading">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 id="event-results-heading" class="h4">検索結果</h2>
        <p role="status" class="text-sm text-text-secondary">
          <template v-if="isValidating">検索中…</template>
          <template v-else-if="events && !error"
            >{{ events.length }}件</template
          >
        </p>
      </div>
      <div :aria-busy="isValidating">
        <DataFetchState :state="state" :is-empty="events?.length === 0">
          <template #loading><span /></template>
          <template #error>
            <div
              role="alert"
              class="grid justify-items-center gap-3 card py-10 text-center"
            >
              <span
                class="i-mdi:alert-circle-outline text-3xl text-text-secondary"
                aria-hidden="true"
              />
              <p>{{ error?.message }}</p>
              <button type="button" class="btn-primary" @click="retry">
                再試行
              </button>
            </div>
          </template>
          <template #empty>
            <div class="grid justify-items-center gap-3 card py-12 text-center">
              <span
                class="i-mdi:calendar-search text-4xl text-text-secondary"
                aria-hidden="true"
              />
              <h3 class="h4">該当するイベントがありません</h3>
              <button
                type="button"
                class="mt-1 underline underline-offset-4"
                @click="reset"
              >
                条件をリセット
              </button>
            </div>
          </template>
          <EventCardList :events="events ?? []" group-by-date />
        </DataFetchState>
      </div>
    </section>
  </main>
</template>
