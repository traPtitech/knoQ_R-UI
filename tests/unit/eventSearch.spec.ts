import { describe, expect, it } from 'vitest'
import {
  defaultEventSearchFilters,
  planEventSearch,
  filterEventResults
} from '/@/features/event/eventSearch'
import { now, ids, event } from './eventSearchFixtures'

const defaults = defaultEventSearchFilters

describe('イベント検索条件', () => {
  it('同種の複数条件を括弧付きOR、種類間をANDで結合する', () => {
    const query = planEventSearch(
      {
        ...defaults(),
        tagIds: [ids.tag, ids.user],
        userIds: [ids.user],
        groupIds: [ids.group]
      },
      now
    ).query
    expect(query.q).toBe(
      `(tag==${ids.tag}||tag==${ids.user})&&user==${ids.user}&&group==${ids.group}`
    )
  })

  it('初期状態は終了日時が現在以降のイベントをAPIへ要求する', () => {
    expect(planEventSearch(defaults(), now).query).toEqual({
      dateBegin: now.toISOString()
    })
    expect(
      planEventSearch({ ...defaults(), includePast: true }, now).query
    ).toEqual({})
  })
  it.each(['tag', 'user', 'group'] as const)(
    '%sの単独条件を生成する',
    (key) => {
      expect(
        planEventSearch({ ...defaults(), [`${key}Ids`]: [ids[key]] }, now).query
          .q
      ).toBe(`${key}==${ids[key]}`)
    }
  )
  it('3種類の条件はANDで結合し、自由語をAPI式へ混入しない', () => {
    expect(
      planEventSearch(
        {
          ...defaults(),
          tagIds: [ids.tag],
          userIds: [ids.user],
          groupIds: [ids.group],
          keyword: 'Vue || group'
        },
        now
      ).query.q
    ).toBe(`tag==${ids.tag}&&user==${ids.user}&&group==${ids.group}`)
  })
  it('日付範囲はローカル日付の翌日0時を上限とする', () => {
    const filters = {
      ...defaults(),
      includePast: true,
      dateBegin: '2026-09-09',
      dateEnd: '2026-09-09'
    }
    expect(planEventSearch(filters, now).query).toEqual({
      dateBegin: new Date('2026-09-09T00:00:00').toISOString(),
      dateEnd: new Date('2026-09-10T00:00:00').toISOString()
    })
  })
  it('未来の開始日を尊重し、過去の開始日は過去OFFなら現在に制限する', () => {
    expect(
      planEventSearch({ ...defaults(), dateBegin: '2026-09-10' }, now).query
        .dateBegin
    ).toBe(new Date('2026-09-10T00:00:00').toISOString())
    expect(
      planEventSearch({ ...defaults(), dateBegin: '2026-09-01' }, now).query
        .dateBegin
    ).toBe(now.toISOString())
  })
  it('有効な過去の日付範囲は、過去OFFなら0件として扱う', () => {
    expect(
      planEventSearch({ ...defaults(), dateEnd: '2026-09-08' }, now).empty
    ).toBe(true)
    expect(
      planEventSearch(
        { ...defaults(), includePast: true, dateEnd: '2026-09-08' },
        now
      ).empty
    ).toBe(false)
  })
  it.each([
    { dateBegin: '2026-09-10', dateEnd: '2026-09-09' },
    { dateBegin: '2026-02-30' },
    { dateEnd: 'not-a-date' },
    { tagIds: ['invalid||group==x'] }
  ])('無効な条件を拒否する: %j', (filters) => {
    expect(() => planEventSearch({ ...defaults(), ...filters }, now)).toThrow()
  })
})

describe('イベント検索結果の境界', () => {
  it.each([
    ['2026-09-09T11:59:59+09:00', false],
    ['2026-09-09T12:00:00+09:00', false],
    ['2026-09-09T12:00:01+09:00', true]
  ])('終了時刻%s: 表示=%s', (timeEnd, visible) => {
    expect(
      filterEventResults([event({ timeEnd })], defaults(), now)
    ).toHaveLength(visible ? 1 : 0)
  })
  it('開催中と未来を残し、過去ONでは終了済みも残す', () => {
    const events = [
      event({ eventId: 'past', timeEnd: '2026-09-09T10:00:00+09:00' }),
      event({ eventId: 'current' }),
      event({
        eventId: 'future',
        timeStart: '2026-09-10T12:00:00+09:00',
        timeEnd: '2026-09-10T13:00:00+09:00'
      })
    ]
    expect(
      filterEventResults(events, defaults(), now).map((e) => e.eventId)
    ).toEqual(['current', 'future'])
    expect(
      filterEventResults(events, { ...defaults(), includePast: true }, now)
    ).toHaveLength(3)
  })
  it('終了日の深夜を含め、翌日0時開始は含めない', () => {
    const events = [
      event({
        eventId: 'inside',
        timeStart: new Date('2026-09-09T23:59:59').toISOString(),
        timeEnd: new Date('2026-09-10T00:30:00').toISOString()
      }),
      event({
        eventId: 'outside',
        timeStart: new Date('2026-09-10T00:00:00').toISOString(),
        timeEnd: new Date('2026-09-10T01:00:00').toISOString()
      })
    ]
    expect(
      filterEventResults(
        events,
        { ...defaults(), includePast: true, dateEnd: '2026-09-09' },
        now
      ).map((e) => e.eventId)
    ).toEqual(['inside'])
  })
  it.each(['vue', ' TypeScript ', '   '])(
    '自由語%sは名前・説明を対象に大小文字と周辺空白を無視する',
    (keyword) => {
      expect(
        filterEventResults([event()], { ...defaults(), keyword }, now)
      ).toHaveLength(1)
    }
  )
  it('一致しない自由語は0件にする', () => {
    expect(
      filterEventResults([event()], { ...defaults(), keyword: '該当なし' }, now)
    ).toEqual([])
  })
  it('タイムゾーン表記の違いに影響されず、元配列を変えずに時系列に並べる', () => {
    const late = event({
      eventId: 'late',
      timeStart: '2026-09-09T04:00:00Z',
      timeEnd: '2026-09-09T05:00:00Z'
    })
    const early = event({
      eventId: 'early',
      timeStart: '2026-09-09T12:30:00+09:00'
    })
    const events = [late, early]
    expect(filterEventResults(events, defaults(), now)).toEqual([early, late])
    expect(events).toEqual([late, early])
  })
})
