import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi
} from 'vitest'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { createMockContext } from '/@/mocks/context'
import { mockApiUrl } from '/@/mocks/http'
import { seedDraftEvents } from '/@/features/draft-event/mocks/factories'
import { createDraftHandlers } from '/@/features/draft-event/mocks/handlers'
import type {
  RequestDraftEvent,
  ResponseAvailability,
  ResponseDraftEvent,
  ResponseDraftEventDetail,
  ResponseSchedulingResults
} from '/@/features/draft-event/types'

const context = createMockContext({
  seed: 17,
  now: '2026-09-15T09:00:00+09:00'
})
const server = setupServer(...createDraftHandlers(context))
const input = (): RequestDraftEvent => ({
  name: 'HTTP経由で作る日程調整',
  deadline: '2026-09-20T23:59:59+09:00',
  admins: [context.state.users[0].userId],
  invitees: context.state.users.slice(1, 4).map((user) => user.userId),
  candidateSlots: [
    {
      timeStart: '2026-09-21T14:00:00+09:00',
      timeEnd: '2026-09-21T14:30:00+09:00'
    },
    {
      timeStart: '2026-09-22T14:00:00+09:00',
      timeEnd: '2026-09-22T14:30:00+09:00'
    }
  ]
})

const request = (
  path: string,
  method = 'GET',
  body?: unknown
): Promise<Response> =>
  fetch(mockApiUrl(path), {
    method,
    headers:
      body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body)
  })

const read = async <T>(path: string): Promise<T> => {
  const response = await request(path)
  expect(response.status).toBe(200)
  return response.json()
}

const create = async (): Promise<ResponseDraftEventDetail> => {
  const response = await request('/draft-events', 'POST', input())
  expect(response.status).toBe(201)
  return response.json()
}

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
beforeEach(() => {
  const fresh = createMockContext(context.options)
  context.faker = fresh.faker
  context.state = fresh.state
  context.state.users = Array.from({ length: 6 }, (_, index) => ({
    userId: `test-user-${index}`,
    name: `member${index}`,
    displayName: `メンバー${index}`,
    icon: '',
    privileged: false,
    state: 1
  }))
  context.state.currentUserId = context.state.users[0].userId
  seedDraftEvents(context)
})
afterEach(() => {
  server.resetHandlers()
  vi.restoreAllMocks()
})
afterAll(() => server.close())

describe('draft-event HTTP contract', () => {
  it('allocates draft and candidate IDs on POST and exposes the same record on later reads', async () => {
    const body = input()
    const response = await request('/draft-events', 'POST', {
      ...body,
      draftEventId: 'client-draft',
      candidateSlots: body.candidateSlots.map((slot) => ({
        ...slot,
        slotId: 'client-slot'
      }))
    })
    expect(response.status).toBe(201)
    const draft: ResponseDraftEventDetail = await response.json()
    expect(draft.draftEventId).not.toBe('client-draft')
    expect(new Set(draft.candidateSlots.map((slot) => slot.slotId)).size).toBe(
      2
    )
    expect(
      draft.candidateSlots.every((slot) => slot.slotId !== 'client-slot')
    ).toBe(true)
    expect(draft).toMatchObject({
      name: body.name,
      status: 'open',
      open: true,
      tags: []
    })
    expect(await read(`/draft-events/${draft.draftEventId}`)).toEqual(draft)
    const list = await read<ResponseDraftEvent[]>('/draft-events')
    const listed = list.find((item) => item.draftEventId === draft.draftEventId)
    expect(listed).toMatchObject({ name: body.name, status: 'open' })
    expect(listed).not.toHaveProperty('candidateSlots')
  })

  it('distinguishes unanswered from no respondents and calculates zero rates', async () => {
    const draft = await create()
    const path = `/draft-events/${draft.draftEventId}`
    expect(await read(`${path}/availabilities`)).toEqual([])
    expect(
      await read(`${path}/availabilities/${context.state.currentUserId}`)
    ).toBeNull()
    const result = await read<ResponseSchedulingResults>(
      `${path}/scheduling-results`
    )
    expect(result.respondents).toEqual([])
    expect(result.nonRespondents).toEqual([...draft.admins, ...draft.invitees])
    expect(result.results).toEqual(
      draft.candidateSlots.map((slot) => ({
        slotId: slot.slotId,
        availableCount: 0,
        availableUsers: [],
        availabilityRate: 0
      }))
    )
  })

  it('overwrites answers, deduplicates selected slots, and counts an empty answer in the denominator', async () => {
    const draft = await create()
    const path = `/draft-events/${draft.draftEventId}`
    const userId = context.state.currentUserId
    const secondUser = context.state.users[1].userId
    const [firstSlot, secondSlot] = draft.candidateSlots
    const saved = await request(`${path}/availabilities/${userId}`, 'PUT', {
      slotIds: [firstSlot.slotId, firstSlot.slotId],
      comment: '最初の回答'
    })
    expect(saved.status).toBe(200)
    expect(await saved.json()).toMatchObject({
      userId,
      draftEventId: draft.draftEventId,
      slotIds: [firstSlot.slotId],
      comment: '最初の回答'
    })
    const empty = await request(`${path}/availabilities/${secondUser}`, 'PUT', {
      slotIds: []
    })
    expect(empty.status).toBe(200)
    const results = await read<ResponseSchedulingResults>(
      `${path}/scheduling-results`
    )
    expect(results.results[0]).toMatchObject({
      availableCount: 1,
      availabilityRate: 0.5,
      availableUsers: [userId]
    })
    expect(results.respondents.map((value) => value.userId)).toEqual([
      userId,
      secondUser
    ])
    expect(results.nonRespondents).not.toContain(secondUser)

    const overwrite = await request(`${path}/availabilities/${userId}`, 'PUT', {
      slotIds: [secondSlot.slotId],
      comment: null
    })
    expect(overwrite.status).toBe(200)
    const answers = await read<ResponseAvailability[]>(`${path}/availabilities`)
    expect(answers).toHaveLength(2)
    expect(await read(`${path}/availabilities/${userId}`)).toMatchObject({
      slotIds: [secondSlot.slotId],
      comment: null
    })
    const updated = await read<ResponseSchedulingResults>(
      `${path}/scheduling-results`
    )
    expect(updated.results[0].availableCount).toBe(0)
    expect(updated.results[1].availabilityRate).toBe(0.5)
    const all = await read<ResponseAvailability[]>(
      `/users/${userId}/draft-availabilities`
    )
    expect(
      all.filter((answer) => answer.draftEventId === draft.draftEventId)
    ).toEqual([answers[0]])
  })

  it('retains confirmation in list and detail responses', async () => {
    const draft = await create()
    const path = `/draft-events/${draft.draftEventId}`
    const slot = input().candidateSlots[0]
    const response = await request(`${path}/confirm`, 'POST', slot)
    expect(response.status).toBe(200)
    const expected = {
      status: 'confirmed',
      confirmedTimeStart: slot.timeStart,
      confirmedTimeEnd: slot.timeEnd
    }
    expect(await response.json()).toMatchObject(expected)
    expect(await read(path)).toMatchObject(expected)
    const list = await read<ResponseDraftEvent[]>('/draft-events')
    expect(
      list.find((item) => item.draftEventId === draft.draftEventId)
    ).toMatchObject(expected)
  })

  it('cascades deletion to answers without removing other drafts or answers', async () => {
    const draft = context.state.draftEvents[0]
    const otherAnswers = context.state.availabilities.filter(
      (answer) => answer.draftEventId !== draft.draftEventId
    )
    const response = await request(
      `/draft-events/${draft.draftEventId}`,
      'DELETE'
    )
    expect(response.status).toBe(204)
    expect(await response.text()).toBe('')
    expect(
      (await read<ResponseDraftEvent[]>('/draft-events')).some(
        (value) => value.draftEventId === draft.draftEventId
      )
    ).toBe(false)
    expect((await request(`/draft-events/${draft.draftEventId}`)).status).toBe(
      404
    )
    expect(
      (await request(`/draft-events/${draft.draftEventId}/availabilities`))
        .status
    ).toBe(404)
    for (const user of context.state.users) {
      const answers = await read<ResponseAvailability[]>(
        `/users/${user.userId}/draft-availabilities`
      )
      expect(answers).toEqual(
        otherAnswers.filter((answer) => answer.userId === user.userId)
      )
    }
  })

  it('returns 404 for every missing draft operation and missing users without mutating data', async () => {
    const before = structuredClone(context.state)
    const user = context.state.currentUserId
    const existing = context.state.draftEvents[0].draftEventId
    const paths = [
      ['/draft-events/missing', 'GET'],
      ['/draft-events/missing', 'DELETE'],
      ['/draft-events/missing/confirm', 'POST'],
      ['/draft-events/missing/availabilities', 'GET'],
      [`/draft-events/missing/availabilities/${user}`, 'GET'],
      [`/draft-events/missing/availabilities/${user}`, 'PUT'],
      ['/draft-events/missing/scheduling-results', 'GET'],
      [`/draft-events/${existing}/availabilities/missing`, 'GET'],
      [`/draft-events/${existing}/availabilities/missing`, 'PUT'],
      ['/users/missing/draft-availabilities', 'GET']
    ]
    for (const [path, method] of paths) {
      const response = await request(path, method)
      expect(response.status, `${method} ${path}`).toBe(404)
      expect(await response.json()).toEqual({ message: expect.any(String) })
    }
    expect(context.state).toEqual(before)
  })

  it.each([
    ['missing name', { name: undefined }],
    ['blank name', { name: ' ' }],
    ['invalid deadline', { deadline: 'yesterday' }],
    ['invalid calendar date', { deadline: '2026-02-30T09:00:00+09:00' }],
    ['missing admins', { admins: undefined }],
    ['unknown admin', { admins: ['missing'] }],
    ['unknown invitee', { invitees: ['missing'] }],
    ['empty slots', { candidateSlots: [] }],
    [
      'invalid slot date',
      {
        candidateSlots: [
          { timeStart: 'invalid', timeEnd: '2026-09-21T10:00:00+09:00' }
        ]
      }
    ],
    [
      'reversed slot',
      {
        candidateSlots: [
          {
            timeStart: '2026-09-21T11:00:00+09:00',
            timeEnd: '2026-09-21T10:00:00+09:00'
          }
        ]
      }
    ]
  ])(
    'rejects creation with %s without partially inserting records',
    async (_label, changes) => {
      const before = structuredClone(context.state)
      const response = await request('/draft-events', 'POST', {
        ...input(),
        ...changes
      })
      expect(response.status).toBe(400)
      expect(await response.json()).toEqual({ message: expect.any(String) })
      expect(context.state).toEqual(before)
    }
  )

  it('rejects malformed JSON for every write operation without changing state', async () => {
    const id = context.state.draftEvents[0].draftEventId
    const before = structuredClone(context.state)
    for (const [path, method] of [
      ['/draft-events', 'POST'],
      [`/draft-events/${id}/confirm`, 'POST'],
      [
        `/draft-events/${id}/availabilities/${context.state.currentUserId}`,
        'PUT'
      ]
    ]) {
      const response = await fetch(mockApiUrl(path), {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: '{'
      })
      expect(response.status).toBe(400)
    }
    expect(context.state).toEqual(before)
  })

  it.each([
    {},
    { timeStart: '2026-09-21T11:00:00+09:00', timeEnd: 'invalid' },
    {
      timeStart: '2026-09-21T11:00:00+09:00',
      timeEnd: '2026-09-21T11:00:00+09:00'
    },
    {
      timeStart: '2026-09-21T11:00:00+09:00',
      timeEnd: '2026-09-21T10:00:00+09:00'
    }
  ])('keeps confirmation unchanged for invalid time range %j', async (body) => {
    const before = structuredClone(context.state)
    const response = await request(
      `/draft-events/${context.state.draftEvents[0].draftEventId}/confirm`,
      'POST',
      body
    )
    expect(response.status).toBe(400)
    expect(context.state).toEqual(before)
  })

  it('rejects foreign candidates and invalid answer bodies without overwriting an answer', async () => {
    const draft = context.state.draftEvents[0]
    const answer = context.state.availabilities.find(
      (value) => value.draftEventId === draft.draftEventId
    )!
    const foreign = context.state.draftEvents[1].candidateSlots[0].slotId
    const before = structuredClone(context.state)
    for (const body of [
      {},
      { slotIds: 'invalid' },
      { slotIds: [foreign] },
      { slotIds: [], comment: 1 },
      null
    ]) {
      const response = await request(
        `/draft-events/${draft.draftEventId}/availabilities/${answer.userId}`,
        'PUT',
        body
      )
      expect(response.status).toBe(400)
    }
    expect(context.state).toEqual(before)
  })
})

describe('draft-event HTTP composables', () => {
  it('uses HTTP for draft, availability, and scheduling composables', async () => {
    // openapi-fetch captures fetch on construction, so imports follow server.listen().
    const { useDraftEvents } = await import(
      '/@/features/draft-event/composables/useDraftEvents'
    )
    const { useAvailability } = await import(
      '/@/features/draft-event/composables/useAvailability'
    )
    const { useSchedulingResults } = await import(
      '/@/features/draft-event/composables/useSchedulingResults'
    )
    const drafts = useDraftEvents()
    const answers = useAvailability()
    const results = useSchedulingResults()
    const draft = await drafts.createDraftEvent(input())
    await drafts.getDraftEvent(draft.draftEventId)
    await drafts.getDraftEvents()
    expect(drafts.currentDraftEvent.value).toEqual(draft)
    expect(
      drafts.draftEvents.value.map((value) => value.draftEventId)
    ).toContain(draft.draftEventId)
    await answers.getMyAvailability(
      draft.draftEventId,
      context.state.currentUserId
    )
    expect(answers.myAvailability.value).toBeNull()
    await answers.saveAvailability(
      draft.draftEventId,
      context.state.currentUserId,
      [draft.candidateSlots[0].slotId]
    )
    await answers.getAllAvailabilities(draft.draftEventId)
    expect(answers.allAvailabilities.value).toEqual([
      answers.myAvailability.value
    ])
    await answers.getMyAllAvailabilities(context.state.currentUserId)
    expect(answers.allAvailabilities.value).toContainEqual(
      answers.myAvailability.value
    )
    await results.getSchedulingResults(draft.draftEventId)
    expect(results.schedulingResults.value?.results[0].availableCount).toBe(1)
    await drafts.confirmDraftEvent(
      draft.draftEventId,
      draft.candidateSlots[0].timeStart,
      draft.candidateSlots[0].timeEnd
    )
    expect(drafts.currentDraftEvent.value?.status).toBe('confirmed')
    await drafts.deleteDraftEvent(draft.draftEventId)
    expect((await request(`/draft-events/${draft.draftEventId}`)).status).toBe(
      404
    )
    expect([
      drafts.error.value,
      answers.error.value,
      results.error.value
    ]).toEqual([null, null, null])
  })

  it('sets read errors and rejects failed mutations, including an empty HTTP error body', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { useDraftEvents } = await import(
      '/@/features/draft-event/composables/useDraftEvents'
    )
    const { useAvailability } = await import(
      '/@/features/draft-event/composables/useAvailability'
    )
    const { useSchedulingResults } = await import(
      '/@/features/draft-event/composables/useSchedulingResults'
    )
    const drafts = useDraftEvents()
    const answers = useAvailability()
    const results = useSchedulingResults()
    const before = structuredClone(context.state)
    server.use(
      http.all(
        mockApiUrl('/draft-events*'),
        () => new HttpResponse(null, { status: 500 })
      )
    )
    await drafts.getDraftEvents()
    expect(drafts.error.value).toBeTruthy()
    await drafts.getDraftEvent('missing')
    expect(drafts.error.value).toBeTruthy()
    await answers.getMyAvailability('missing', context.state.currentUserId)
    expect(answers.error.value).toBeTruthy()
    await results.getSchedulingResults('missing')
    expect(results.error.value).toBeTruthy()
    await expect(drafts.createDraftEvent(input())).rejects.toThrow()
    await expect(drafts.deleteDraftEvent('missing')).rejects.toThrow()
    await expect(
      drafts.confirmDraftEvent('missing', 'invalid', 'invalid')
    ).rejects.toThrow()
    await expect(
      answers.saveAvailability('missing', context.state.currentUserId, [])
    ).rejects.toThrow()
    expect([
      drafts.isLoading.value,
      answers.isLoading.value,
      answers.isSaving.value,
      results.isLoading.value
    ]).toEqual([false, false, false, false])
    expect(context.state).toEqual(before)
  })
})
