import type {
  ResponseDraftEvent,
  ResponseDraftEventDetail,
  ResponseAvailability,
  ResponseSchedulingResults
} from './types'

// Mock draftイベント一覧
export const mockDraftEvents: ResponseDraftEvent[] = [
  {
    draftEventId: 'draft-1',
    name: '第10回進捗会',
    description: '第10回の進捗会です。参加可能な時間を入力してください。',
    open: true,
    deadline: '2024-12-25T23:59:59.000Z',
    status: 'open',
    admins: ['user-1'],
    invitees: ['user-2', 'user-3', 'user-4'],
    createdAt: '2024-12-14T10:00:00.000Z',
    updatedAt: '2024-12-14T10:00:00.000Z'
  },
  {
    draftEventId: 'draft-2',
    name: '忘年会',
    description: '年末の打ち上げ',
    open: false,
    deadline: '2024-12-20T23:59:59.000Z',
    status: 'closed',
    admins: ['user-1', 'user-2'],
    invitees: ['user-3', 'user-4', 'user-5'],
    createdAt: '2024-12-10T10:00:00.000Z',
    updatedAt: '2024-12-15T10:00:00.000Z'
  }
]

// Mock draftイベント詳細
export const mockDraftEventDetail: ResponseDraftEventDetail = {
  draftEventId: 'draft-1',
  name: '第10回進捗会',
  description: '第10回の進捗会です。参加可能な時間を入力してください。',
  open: true,
  deadline: '2024-12-25T23:59:59.000Z',
  status: 'open',
  admins: ['user-1'],
  invitees: ['user-2', 'user-3', 'user-4'],
  createdAt: '2024-12-14T10:00:00.000Z',
  updatedAt: '2024-12-14T10:00:00.000Z',
  candidateSlots: [
    {
      slotId: 'slot-1',
      timeStart: '2024-12-20T13:00:00',
      timeEnd: '2024-12-20T13:30:00'
    },
    {
      slotId: 'slot-2',
      timeStart: '2024-12-20T13:30:00',
      timeEnd: '2024-12-20T14:00:00'
    },
    {
      slotId: 'slot-3',
      timeStart: '2024-12-20T14:00:00',
      timeEnd: '2024-12-20T14:30:00'
    },
    {
      slotId: 'slot-4',
      timeStart: '2024-12-21T13:00:00',
      timeEnd: '2024-12-21T13:30:00'
    },
    {
      slotId: 'slot-5',
      timeStart: '2024-12-21T13:30:00',
      timeEnd: '2024-12-21T14:00:00'
    },
    {
      slotId: 'slot-6',
      timeStart: '2024-12-21T14:00:00',
      timeEnd: '2024-12-21T14:30:00'
    }
  ],
  tags: [{ name: '進捗会' }]
}

// Mock 参加可能時間
export const mockAvailabilities: ResponseAvailability[] = [
  {
    userId: 'user-2',
    draftEventId: 'draft-1',
    slotIds: ['slot-1', 'slot-2', 'slot-4', 'slot-5'],
    comment: '午後なら大丈夫です',
    updatedAt: '2024-12-15T10:00:00.000Z'
  },
  {
    userId: 'user-3',
    draftEventId: 'draft-1',
    slotIds: ['slot-1', 'slot-2', 'slot-3'],
    comment: null,
    updatedAt: '2024-12-15T11:00:00.000Z'
  }
]

// Mock 日程調整結果
export const mockSchedulingResults: ResponseSchedulingResults = {
  draftEventId: 'draft-1',
  results: [
    {
      slotId: 'slot-1',
      availableCount: 2,
      availableUsers: ['user-2', 'user-3'],
      availabilityRate: 0.67
    },
    {
      slotId: 'slot-2',
      availableCount: 2,
      availableUsers: ['user-2', 'user-3'],
      availabilityRate: 0.67
    },
    {
      slotId: 'slot-3',
      availableCount: 1,
      availableUsers: ['user-3'],
      availabilityRate: 0.33
    },
    {
      slotId: 'slot-4',
      availableCount: 1,
      availableUsers: ['user-2'],
      availabilityRate: 0.33
    },
    {
      slotId: 'slot-5',
      availableCount: 1,
      availableUsers: ['user-2'],
      availabilityRate: 0.33
    },
    {
      slotId: 'slot-6',
      availableCount: 0,
      availableUsers: [],
      availabilityRate: 0
    }
  ],
  respondents: [
    {
      userId: 'user-2',
      respondedAt: '2024-12-15T10:00:00.000Z',
      comment: '午後なら大丈夫です'
    },
    {
      userId: 'user-3',
      respondedAt: '2024-12-15T11:00:00.000Z',
      comment: null
    }
  ],
  nonRespondents: ['user-4']
}

// ストレージ（作成されたdraftイベントを保持）
let draftEventsStore: ResponseDraftEventDetail[] = [mockDraftEventDetail]

// Mock API functions
export const mockApi = {
  // draftイベント一覧取得
  getDraftEvents: async (): Promise<ResponseDraftEvent[]> => {
    await delay(300)
    return draftEventsStore.map(
      ({ candidateSlots: _c, tags: _t, ...rest }) => rest
    )
  },

  // draftイベント詳細取得
  getDraftEvent: async (
    id: string
  ): Promise<ResponseDraftEventDetail | null> => {
    await delay(300)
    return draftEventsStore.find((e) => e.draftEventId === id) || null
  },

  // draftイベント作成
  createDraftEvent: async (
    data: Omit<
      ResponseDraftEventDetail,
      'draftEventId' | 'status' | 'createdAt' | 'updatedAt'
    >
  ): Promise<ResponseDraftEventDetail> => {
    await delay(500)
    const now = new Date().toISOString()
    const newEvent: ResponseDraftEventDetail = {
      ...data,
      draftEventId: `draft-${Date.now()}`,
      status: 'open',
      createdAt: now,
      updatedAt: now
    }
    draftEventsStore.push(newEvent)
    return newEvent
  },

  // draftイベント削除
  deleteDraftEvent: async (id: string): Promise<void> => {
    await delay(300)
    draftEventsStore = draftEventsStore.filter((e) => e.draftEventId !== id)
  }
}

// ユーティリティ
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
