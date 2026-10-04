import { http, HttpResponse, type RequestHandler } from 'msw'
import { z } from 'zod'
import { mockDate } from '/@/mocks/context'
import { mockApiUrl, mockError } from '/@/mocks/http'
import type { MockContext } from '/@/mocks/types'
import type {
  ResponseAvailability,
  ResponseDraftEventDetail,
  ResponseSchedulingResults
} from '/@/features/draft-event/types'

const isoDate = z.iso
  .datetime({ offset: true, local: true })
  .refine((value) => Number.isFinite(Date.parse(value)))
const timeRange = z
  .object({ timeStart: isoDate, timeEnd: isoDate })
  .refine((range) => Date.parse(range.timeStart) < Date.parse(range.timeEnd))
const draftInput = z.object({
  name: z.string().trim().min(1),
  description: z.string().optional(),
  open: z.boolean().default(true),
  deadline: isoDate,
  candidateSlots: z.array(timeRange).min(1),
  admins: z.array(z.string().min(1)).min(1),
  invitees: z.array(z.string().min(1)).default([]),
  tags: z.array(z.object({ name: z.string().trim().min(1) })).default([])
})
const availabilityInput = z.object({
  slotIds: z.array(z.string()),
  comment: z.string().nullable().optional()
})

const readJson = async (request: Request): Promise<unknown> => {
  try {
    return await request.json()
  } catch {
    return undefined
  }
}

const schedulingResults = (
  draft: ResponseDraftEventDetail,
  answers: ResponseAvailability[]
): ResponseSchedulingResults => {
  const respondents = answers.map((answer) => ({
    userId: answer.userId,
    respondedAt: answer.updatedAt,
    comment: answer.comment
  }))
  return {
    draftEventId: draft.draftEventId,
    results: draft.candidateSlots.map((slot) => {
      const availableUsers = answers
        .filter((answer) => answer.slotIds.includes(slot.slotId))
        .map((answer) => answer.userId)
      return {
        slotId: slot.slotId,
        availableCount: availableUsers.length,
        availableUsers,
        availabilityRate:
          answers.length === 0 ? 0 : availableUsers.length / answers.length
      }
    }),
    respondents,
    nonRespondents: [...new Set([...draft.admins, ...draft.invitees])].filter(
      (userId) =>
        !respondents.some((respondent) => respondent.userId === userId)
    )
  }
}

export const createDraftHandlers = (context: MockContext): RequestHandler[] => {
  const findDraft = (id: unknown) =>
    context.state.draftEvents.find((draft) => draft.draftEventId === id)
  const hasUser = (id: unknown) =>
    context.state.users.some((user) => user.userId === id)
  const answersFor = (id: unknown) =>
    context.state.availabilities.filter((answer) => answer.draftEventId === id)
  return [
    http.get(mockApiUrl('/draft-events'), () =>
      HttpResponse.json(
        context.state.draftEvents.map(
          ({ candidateSlots: _slots, tags: _tags, ...draft }) => draft
        )
      )
    ),
    http.post(mockApiUrl('/draft-events'), async ({ request }) => {
      const parsed = draftInput.safeParse(await readJson(request))
      if (!parsed.success)
        return mockError('日程調整の入力内容を確認してください')
      const input = parsed.data
      if (![...input.admins, ...input.invitees].every(hasUser))
        return mockError('指定したユーザーが存在しません')
      const draft: ResponseDraftEventDetail = {
        ...input,
        admins: [...new Set(input.admins)],
        invitees: [...new Set(input.invitees)],
        draftEventId: context.faker.string.uuid(),
        status: 'open',
        candidateSlots: input.candidateSlots.map((slot) => ({
          ...slot,
          slotId: context.faker.string.uuid()
        })),
        createdAt: mockDate(context),
        updatedAt: mockDate(context)
      }
      context.state.draftEvents.push(draft)
      return HttpResponse.json(draft, { status: 201 })
    }),
    http.get(mockApiUrl('/draft-events/:id'), ({ params }) => {
      const draft = findDraft(params.id)
      return draft
        ? HttpResponse.json(draft)
        : mockError('日程調整が見つかりません', 404)
    }),
    http.delete(mockApiUrl('/draft-events/:id'), ({ params }) => {
      if (!findDraft(params.id))
        return mockError('日程調整が見つかりません', 404)
      context.state.draftEvents = context.state.draftEvents.filter(
        (draft) => draft.draftEventId !== params.id
      )
      context.state.availabilities = context.state.availabilities.filter(
        (answer) => answer.draftEventId !== params.id
      )
      return new HttpResponse(null, { status: 204 })
    }),
    http.post(
      mockApiUrl('/draft-events/:id/confirm'),
      async ({ params, request }) => {
        const draft = findDraft(params.id)
        if (!draft) return mockError('日程調整が見つかりません', 404)
        const parsed = timeRange.safeParse(await readJson(request))
        if (!parsed.success) return mockError('確定する日時を確認してください')
        draft.status = 'confirmed'
        draft.confirmedTimeStart = parsed.data.timeStart
        draft.confirmedTimeEnd = parsed.data.timeEnd
        draft.updatedAt = mockDate(context)
        return HttpResponse.json(draft)
      }
    ),
    http.get(mockApiUrl('/draft-events/:id/availabilities'), ({ params }) => {
      if (!findDraft(params.id))
        return mockError('日程調整が見つかりません', 404)
      return HttpResponse.json(answersFor(params.id))
    }),
    http.get(
      mockApiUrl('/draft-events/:id/availabilities/:userId'),
      ({ params }) => {
        if (!findDraft(params.id) || !hasUser(params.userId))
          return mockError('日程調整またはユーザーが見つかりません', 404)
        return HttpResponse.json(
          answersFor(params.id).find(
            (answer) => answer.userId === params.userId
          ) ?? null
        )
      }
    ),
    http.put(
      mockApiUrl('/draft-events/:id/availabilities/:userId'),
      async ({ params, request }) => {
        const draft = findDraft(params.id)
        if (!draft || !hasUser(params.userId))
          return mockError('日程調整またはユーザーが見つかりません', 404)
        const parsed = availabilityInput.safeParse(await readJson(request))
        if (!parsed.success)
          return mockError('回答の入力内容を確認してください')
        if (
          !parsed.data.slotIds.every((slotId) =>
            draft.candidateSlots.some((slot) => slot.slotId === slotId)
          )
        )
          return mockError('候補にない時間が指定されています')
        const answer: ResponseAvailability = {
          userId: String(params.userId),
          draftEventId: draft.draftEventId,
          slotIds: [...new Set(parsed.data.slotIds)],
          comment: parsed.data.comment ?? null,
          updatedAt: mockDate(context)
        }
        const index = context.state.availabilities.findIndex(
          (value) =>
            value.draftEventId === draft.draftEventId &&
            value.userId === params.userId
        )
        if (index < 0) context.state.availabilities.push(answer)
        else context.state.availabilities[index] = answer
        return HttpResponse.json(answer)
      }
    ),
    http.get(
      mockApiUrl('/users/:userId/draft-availabilities'),
      ({ params }) => {
        if (!hasUser(params.userId))
          return mockError('ユーザーが見つかりません', 404)
        return HttpResponse.json(
          context.state.availabilities.filter(
            (answer) => answer.userId === params.userId
          )
        )
      }
    ),
    http.get(
      mockApiUrl('/draft-events/:id/scheduling-results'),
      ({ params }) => {
        const draft = findDraft(params.id)
        return draft
          ? HttpResponse.json(schedulingResults(draft, answersFor(params.id)))
          : mockError('日程調整が見つかりません', 404)
      }
    )
  ]
}
