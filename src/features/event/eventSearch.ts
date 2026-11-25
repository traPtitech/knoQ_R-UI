import type { paths } from '/@/lib/api'
import type { KnoqEvent } from '/@/features/event/types'

export type EventSearchFilters = {
  keyword: string
  tagIds: string[]
  userIds: string[]
  groupIds: string[]
  dateBegin: string
  dateEnd: string
  includePast: boolean
}

export const defaultEventSearchFilters = (): EventSearchFilters => ({
  keyword: '',
  tagIds: [],
  userIds: [],
  groupIds: [],
  dateBegin: '',
  dateEnd: '',
  includePast: false
})

const parseDate = (value: string): Date | undefined => {
  if (!value) return undefined
  const date = new Date(`${value}T00:00:00`)
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    Number.isNaN(date.getTime()) ||
    date.getDate() !== Number(value.slice(8, 10))
  ) {
    throw new Error('日付を正しく入力してください。')
  }
  return date
}

export const planEventSearch = (filters: EventSearchFilters, now: Date) => {
  const begin = parseDate(filters.dateBegin)
  const end = parseDate(filters.dateEnd)
  if (begin && end && begin > end) {
    throw new Error('終了日は開始日以降にしてください。')
  }
  // ローカル日付で翌日へ進めることで、終了日全体と夏時間の境界を含める。
  if (end) end.setDate(end.getDate() + 1)
  const from = filters.includePast
    ? begin
    : new Date(Math.max(begin?.getTime() ?? 0, now.getTime()))
  const selections: [string, string[]][] = [
    ['tag', filters.tagIds],
    ['user', filters.userIds],
    ['group', filters.groupIds]
  ]
  const conditions = selections
    .filter(([, ids]) => ids.length > 0)
    .map(([key, ids]) => {
      if (
        ids.some((id) => !/^[\da-f]{8}(-[\da-f]{4}){3}-[\da-f]{12}$/i.test(id))
      ) {
        throw new Error('検索条件を選び直してください。')
      }
      const expression = [...new Set(ids)]
        .map((id) => `${key}==${id}`)
        .join('||')
      return ids.length > 1 ? `(${expression})` : expression
    })
  const query: NonNullable<paths['/events']['get']['parameters']['query']> = {
    ...(from && { dateBegin: from.toISOString() }),
    ...(end && { dateEnd: end.toISOString() }),
    ...(conditions.length > 0 && {
      q: conditions.join('&&')
    })
  }
  return { query, from, end, empty: Boolean(from && end && from >= end) }
}

export const filterEventResults = (
  events: KnoqEvent[],
  filters: EventSearchFilters,
  now: Date
): KnoqEvent[] => {
  const { from, end } = planEventSearch(filters, now)
  const keyword = filters.keyword.trim().toLocaleLowerCase()
  return events
    .filter((event) => {
      const start = new Date(event.timeStart).getTime()
      const finish = new Date(event.timeEnd).getTime()
      if (!filters.includePast && finish <= now.getTime()) return false
      if (from && finish < from.getTime()) return false
      if (end && start >= end.getTime()) return false
      return (
        !keyword ||
        `${event.name}\n${event.description}`
          .toLocaleLowerCase()
          .includes(keyword)
      )
    })
    .sort(
      (a, b) =>
        new Date(a.timeStart).getTime() - new Date(b.timeStart).getTime() ||
        a.eventId.localeCompare(b.eventId)
    )
}
