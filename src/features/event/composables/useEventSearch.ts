import { computed, onScopeDispose, reactive, ref } from 'vue'
import { useApiFetch } from '/@/composables/useApiFetch'
import { apiClient } from '/@/lib/api'
import { useSwrvState } from '/@/composables/useSwrvState'
import type { KnoqEvent } from '/@/features/event/types'
import {
  defaultEventSearchFilters,
  filterEventResults,
  planEventSearch,
  type EventSearchFilters
} from '/@/features/event/eventSearch'

type Option = { id: string; name: string }

export const useEventSearch = () => {
  const filters = reactive(defaultEventSearchFilters())
  const events = ref<KnoqEvent[]>()
  const error = ref<Error>()
  const isValidating = ref(false)
  const validationError = ref('')
  const { state } = useSwrvState(events, error, isValidating)
  const tagRequest = useApiFetch('/tags', {})
  const userRequest = useApiFetch('/users', {})
  const groupRequest = useApiFetch('/groups', {})
  const optionRequests = [
    { label: 'タグ', request: tagRequest },
    { label: 'ユーザー', request: userRequest },
    { label: 'グループ', request: groupRequest }
  ]
  const sortOptions = (options: Option[]) =>
    options.sort((a, b) => a.name.localeCompare(b.name, 'ja'))
  const tags = computed(() =>
    sortOptions(
      (tagRequest.data.value ?? []).map((tag) => ({
        id: tag.tagId,
        name: tag.name
      }))
    )
  )
  const users = computed(() =>
    sortOptions(
      (userRequest.data.value ?? []).map((user) => ({
        id: user.userId,
        name: user.name
      }))
    )
  )
  const groups = computed(() =>
    sortOptions(
      (groupRequest.data.value ?? []).map((group) => ({
        id: group.groupId,
        name: group.name
      }))
    )
  )
  const optionsError = computed(() => {
    const failed = optionRequests
      .filter(({ request }) => request.error.value)
      .map(({ label }) => label)
    return failed.length ? `${failed.join('・')}の取得に失敗しました。` : ''
  })
  let requestId = 0
  let controller: AbortController | undefined
  let appliedFilters = defaultEventSearchFilters()

  const search = async (
    snapshot: EventSearchFilters = { ...filters }
  ): Promise<void> => {
    const now = new Date()
    let plan: ReturnType<typeof planEventSearch>
    try {
      plan = planEventSearch(snapshot, now)
    } catch (cause) {
      validationError.value =
        cause instanceof Error ? cause.message : '検索条件を確認してください。'
      return
    }
    validationError.value = ''
    appliedFilters = { ...snapshot }
    const id = ++requestId
    controller?.abort()
    controller = new AbortController()
    error.value = undefined
    isValidating.value = true
    try {
      if (plan.empty) {
        events.value = []
        return
      }
      const { data, response } = await apiClient.GET('/events', {
        params: { query: plan.query },
        signal: controller.signal
      })
      if (id !== requestId) return
      if (!response.ok || !data) {
        events.value = undefined
        error.value = new Error('イベントの取得に失敗しました。')
        return
      }
      events.value = filterEventResults(data, snapshot, now)
    } catch {
      if (id !== requestId) return
      events.value = undefined
      error.value = new Error('イベントの取得に失敗しました。')
    } finally {
      if (id === requestId) isValidating.value = false
    }
  }

  const reset = (): Promise<void> => {
    Object.assign(filters, defaultEventSearchFilters())
    return search()
  }
  const retry = (): Promise<void> => search({ ...appliedFilters })

  const loadOptions = async (): Promise<void> => {
    await Promise.all(
      optionRequests
        .filter(({ request }) => request.error.value)
        .map(({ request }) => request.mutate())
    )
  }

  onScopeDispose(() => {
    requestId++
    controller?.abort()
  })
  return {
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
  }
}
