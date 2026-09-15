import { mockDate } from '/@/mocks/context'
import type { MockContext } from '/@/mocks/types'
import type {
  DraftEventStatus,
  ResponseDraftEventDetail
} from '/@/features/draft-event/types'

interface DraftFixture {
  name: string
  status: DraftEventStatus
  adminIndex: number
  inviteeIndexes: number[]
  respondentIndexes: number[]
  open: boolean
  deadlineHours: number
  slotDay: number
}

const fixtures: DraftFixture[] = [
  {
    name: '開発チームの進捗共有会',
    status: 'open',
    adminIndex: 0,
    inviteeIndexes: [1, 2, 3, 4],
    respondentIndexes: [1, 2, 3],
    open: true,
    deadlineHours: 24,
    slotDay: 2
  },
  {
    name: '新メンバー歓迎会の準備ミーティング',
    status: 'open',
    adminIndex: 1,
    inviteeIndexes: [0, 2, 4],
    respondentIndexes: [1, 2],
    open: false,
    deadlineHours: 120,
    slotDay: 7
  },
  {
    name: '秋のものづくり合宿に向けた企画と役割分担の相談会',
    status: 'open',
    adminIndex: 2,
    inviteeIndexes: [0, 1, 3, 5],
    respondentIndexes: [0, 1, 2],
    open: false,
    deadlineHours: 168,
    slotDay: 10
  },
  {
    name: 'デザインと実装の勉強会',
    status: 'open',
    adminIndex: 3,
    inviteeIndexes: [],
    respondentIndexes: [],
    open: true,
    deadlineHours: 216,
    slotDay: 12
  },
  {
    name: '展示会のふりかえり',
    status: 'closed',
    adminIndex: 0,
    inviteeIndexes: [1, 2, 4],
    respondentIndexes: [1, 2],
    open: false,
    deadlineHours: -24,
    slotDay: 2
  },
  {
    name: 'ライトニングトーク発表会',
    status: 'confirmed',
    adminIndex: 0,
    inviteeIndexes: [1, 2, 3, 5],
    respondentIndexes: [0, 1, 2, 5],
    open: true,
    deadlineHours: 24,
    slotDay: 3
  },
  {
    name: '夏のハッカソン打ち上げ',
    status: 'closed',
    adminIndex: 2,
    inviteeIndexes: [0, 1, 4],
    respondentIndexes: [0, 1, 2],
    open: true,
    deadlineHours: -240,
    slotDay: -7
  }
]

export const seedDraftEvents = (context: MockContext): void => {
  const { faker, state } = context
  const userIds = state.users.map((user) => user.userId)
  if (userIds.length < 6)
    throw new Error('Draft fixtures require at least six users')
  state.draftEvents = []
  state.availabilities = []
  for (const fixture of fixtures) {
    const candidateSlots = Array.from({ length: 8 }, (_, index) => {
      const day = fixture.slotDay + Math.floor(index / 4)
      const date = mockDate(context, day * 24).slice(0, 10)
      const hour = 14 + Math.floor((index % 4) / 2)
      const minute = index % 2 === 0 ? '00' : '30'
      const endHour = index % 2 === 0 ? hour : hour + 1
      const endMinute = index % 2 === 0 ? '30' : '00'
      return {
        slotId: faker.string.uuid(),
        timeStart: `${date}T${hour}:${minute}:00+09:00`,
        timeEnd: `${date}T${endHour}:${endMinute}:00+09:00`
      }
    })
    const draft: ResponseDraftEventDetail = {
      draftEventId: faker.string.uuid(),
      name: fixture.name,
      description:
        '参加できる時間を選んでください．候補が合わない場合は，コメントで都合を教えてください．',
      open: fixture.open,
      deadline: mockDate(context, fixture.deadlineHours),
      status: fixture.status,
      admins: [userIds[fixture.adminIndex]],
      invitees: fixture.inviteeIndexes.map((index) => userIds[index]),
      createdAt: mockDate(context, Math.min(-336, fixture.deadlineHours - 72)),
      updatedAt: mockDate(context, Math.min(-12, fixture.deadlineHours)),
      candidateSlots,
      tags: [{ name: faker.helpers.arrayElement(['交流', '開発', '勉強会']) }]
    }
    if (fixture.status === 'confirmed') {
      draft.confirmedTimeStart = candidateSlots[0].timeStart
      draft.confirmedTimeEnd = candidateSlots[3].timeEnd
    }
    state.draftEvents.push(draft)
    fixture.respondentIndexes.forEach((userIndex, respondentIndex) => {
      state.availabilities.push({
        userId: userIds[userIndex],
        draftEventId: draft.draftEventId,
        slotIds:
          respondentIndex === 2
            ? []
            : candidateSlots
                .filter((_, index) => (index + respondentIndex) % 3 !== 2)
                .map((slot) => slot.slotId),
        comment:
          respondentIndex === 2
            ? '今回は参加できる候補がありません'
            : faker.helpers.arrayElement([
                '途中からの参加を希望します',
                'どちらの日も参加できます',
                null
              ]),
        updatedAt: mockDate(context, Math.min(-6, fixture.deadlineHours - 1))
      })
    })
  }
}
