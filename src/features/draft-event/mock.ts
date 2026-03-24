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
    deadline: '2026-03-15T23:59:59.000Z',
    status: 'open',
    admins: ['user-1'],
    invitees: [
      'user-2',
      'user-3',
      'user-4',
      '1eea935c-0d3c-411b-a565-1b09565237f4'
    ],
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-03-01T10:00:00.000Z'
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
  deadline: '2026-03-15T23:59:59.000Z',
  status: 'open',
  admins: ['user-1'],
  invitees: [
    'user-2',
    'user-3',
    'user-4',
    '1eea935c-0d3c-411b-a565-1b09565237f4'
  ],
  createdAt: '2026-03-01T10:00:00.000Z',
  updatedAt: '2026-03-01T10:00:00.000Z',
  candidateSlots: [
    {
      slotId: 'slot-1',
      timeStart: '2026-03-18T13:00:00',
      timeEnd: '2026-03-18T13:30:00'
    },
    {
      slotId: 'slot-2',
      timeStart: '2026-03-18T13:30:00',
      timeEnd: '2026-03-18T14:00:00'
    },
    {
      slotId: 'slot-3',
      timeStart: '2026-03-18T14:00:00',
      timeEnd: '2026-03-18T14:30:00'
    },
    {
      slotId: 'slot-4',
      timeStart: '2026-03-19T13:00:00',
      timeEnd: '2026-03-19T13:30:00'
    },
    {
      slotId: 'slot-5',
      timeStart: '2026-03-19T13:30:00',
      timeEnd: '2026-03-19T14:00:00'
    },
    {
      slotId: 'slot-6',
      timeStart: '2026-03-19T14:00:00',
      timeEnd: '2026-03-19T14:30:00'
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
    updatedAt: '2026-03-02T10:00:00.000Z'
  },
  {
    userId: 'user-3',
    draftEventId: 'draft-1',
    slotIds: ['slot-1', 'slot-2', 'slot-3'],
    comment: null,
    updatedAt: '2026-03-02T11:00:00.000Z'
  },
  {
    userId: '1eea935c-0d3c-411b-a565-1b09565237f4',
    draftEventId: 'draft-1',
    slotIds: ['slot-1', 'slot-3', 'slot-5'],
    comment: '金曜の午後がベストです',
    updatedAt: '2026-03-03T09:00:00.000Z'
  },
  {
    userId: '1eea935c-0d3c-411b-a565-1b09565237f4',
    draftEventId: 'draft-3',
    slotIds: ['slot-d3-1', 'slot-d3-2', 'slot-d3-4'],
    comment: null,
    updatedAt: '2026-03-06T10:00:00.000Z'
  },
  {
    userId: '1eea935c-0d3c-411b-a565-1b09565237f4',
    draftEventId: 'draft-9',
    slotIds: ['slot-d9-1', 'slot-d9-3'],
    comment: '土曜日希望',
    updatedAt: '2025-01-25T11:00:00.000Z'
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
      respondedAt: '2026-03-02T10:00:00.000Z',
      comment: '午後なら大丈夫です'
    },
    {
      userId: 'user-3',
      respondedAt: '2026-03-02T11:00:00.000Z',
      comment: null
    }
  ],
  nonRespondents: ['user-4']
}

// 追加モックデータ（一覧テスト用）
const additionalMockDraftEvents: ResponseDraftEventDetail[] = [
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
    updatedAt: '2024-12-15T10:00:00.000Z',
    candidateSlots: [],
    tags: [{ name: '飲み会' }]
  },
  {
    draftEventId: 'draft-3',
    name: '新年キックオフ MTG',
    description:
      '新年最初のミーティングです。今期の目標と方針について話し合います。全員参加推奨です。',
    open: false,
    deadline: '2026-03-20T23:59:59.000Z',
    status: 'open',
    admins: ['user-2'],
    invitees: [
      'user-1',
      'user-3',
      'user-5',
      '1eea935c-0d3c-411b-a565-1b09565237f4'
    ],
    createdAt: '2026-03-05T09:00:00.000Z',
    updatedAt: '2026-03-05T09:00:00.000Z',
    candidateSlots: [
      {
        slotId: 'slot-d3-1',
        timeStart: '2026-03-23T10:00:00',
        timeEnd: '2026-03-23T10:30:00'
      },
      {
        slotId: 'slot-d3-2',
        timeStart: '2026-03-23T10:30:00',
        timeEnd: '2026-03-23T11:00:00'
      },
      {
        slotId: 'slot-d3-3',
        timeStart: '2026-03-23T11:00:00',
        timeEnd: '2026-03-23T11:30:00'
      },
      {
        slotId: 'slot-d3-4',
        timeStart: '2026-03-24T10:00:00',
        timeEnd: '2026-03-24T10:30:00'
      },
      {
        slotId: 'slot-d3-5',
        timeStart: '2026-03-24T10:30:00',
        timeEnd: '2026-03-24T11:00:00'
      },
      {
        slotId: 'slot-d3-6',
        timeStart: '2026-03-24T11:00:00',
        timeEnd: '2026-03-24T11:30:00'
      }
    ],
    tags: [{ name: 'MTG' }]
  },
  {
    draftEventId: 'draft-4',
    name: 'チーム合宿',
    description: '春の開発合宿の日程を決めましょう。2泊3日の予定です。',
    open: false,
    deadline: '2026-03-25T23:59:59.000Z',
    status: 'open',
    admins: ['user-3'],
    invitees: [
      'user-1',
      'user-2',
      'user-4',
      'user-5',
      'user-6',
      '1eea935c-0d3c-411b-a565-1b09565237f4'
    ],
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-03-01T10:00:00.000Z',
    candidateSlots: [
      {
        slotId: 'slot-d4-1',
        timeStart: '2026-04-04T09:00:00',
        timeEnd: '2026-04-04T09:30:00'
      },
      {
        slotId: 'slot-d4-2',
        timeStart: '2026-04-04T09:30:00',
        timeEnd: '2026-04-04T10:00:00'
      },
      {
        slotId: 'slot-d4-3',
        timeStart: '2026-04-11T09:00:00',
        timeEnd: '2026-04-11T09:30:00'
      },
      {
        slotId: 'slot-d4-4',
        timeStart: '2026-04-11T09:30:00',
        timeEnd: '2026-04-11T10:00:00'
      },
      {
        slotId: 'slot-d4-5',
        timeStart: '2026-04-18T09:00:00',
        timeEnd: '2026-04-18T09:30:00'
      },
      {
        slotId: 'slot-d4-6',
        timeStart: '2026-04-18T09:30:00',
        timeEnd: '2026-04-18T10:00:00'
      }
    ],
    tags: [{ name: '合宿' }]
  },
  {
    draftEventId: 'draft-5',
    name: 'LT大会 vol.3',
    description: null as unknown as string,
    open: false,
    deadline: '2025-01-31T23:59:59.000Z',
    status: 'confirmed',
    admins: ['user-1'],
    invitees: ['user-2', 'user-3'],
    createdAt: '2025-01-02T12:00:00.000Z',
    updatedAt: '2025-01-20T18:00:00.000Z',
    candidateSlots: [
      {
        slotId: 'slot-d5-1',
        timeStart: '2025-01-25T14:00:00',
        timeEnd: '2025-01-25T14:30:00'
      },
      {
        slotId: 'slot-d5-2',
        timeStart: '2025-01-25T14:30:00',
        timeEnd: '2025-01-25T15:00:00'
      },
      {
        slotId: 'slot-d5-3',
        timeStart: '2025-01-26T14:00:00',
        timeEnd: '2025-01-26T14:30:00'
      },
      {
        slotId: 'slot-d5-4',
        timeStart: '2025-01-26T14:30:00',
        timeEnd: '2025-01-26T15:00:00'
      }
    ],
    tags: [{ name: 'LT' }]
  },
  {
    draftEventId: 'draft-6',
    name: '外部勉強会の参加調整',
    description:
      '来月開催される外部カンファレンスへの参加メンバーを調整します。',
    open: true,
    deadline: '2026-04-01T23:59:59.000Z',
    status: 'open',
    admins: ['user-4'],
    invitees: [],
    createdAt: '2026-03-01T08:00:00.000Z',
    updatedAt: '2026-03-01T08:00:00.000Z',
    candidateSlots: [
      {
        slotId: 'slot-d6-1',
        timeStart: '2026-04-11T13:00:00',
        timeEnd: '2026-04-11T13:30:00'
      },
      {
        slotId: 'slot-d6-2',
        timeStart: '2026-04-11T13:30:00',
        timeEnd: '2026-04-11T14:00:00'
      },
      {
        slotId: 'slot-d6-3',
        timeStart: '2026-04-18T13:00:00',
        timeEnd: '2026-04-18T13:30:00'
      },
      {
        slotId: 'slot-d6-4',
        timeStart: '2026-04-18T13:30:00',
        timeEnd: '2026-04-18T14:00:00'
      }
    ],
    tags: []
  },
  {
    draftEventId: 'draft-7',
    name: '秘密のサプライズ企画',
    description: 'user-6 の送別会サプライズ企画です。本人には秘密！',
    open: false,
    deadline: '2026-03-18T23:59:59.000Z',
    status: 'open',
    admins: ['user-3'],
    invitees: ['user-4', 'user-5'],
    createdAt: '2026-03-05T14:00:00.000Z',
    updatedAt: '2026-03-05T14:00:00.000Z',
    candidateSlots: [
      {
        slotId: 'slot-d7-1',
        timeStart: '2026-03-21T18:00:00',
        timeEnd: '2026-03-21T18:30:00'
      },
      {
        slotId: 'slot-d7-2',
        timeStart: '2026-03-21T18:30:00',
        timeEnd: '2026-03-21T19:00:00'
      }
    ],
    tags: []
  },
  {
    draftEventId: 'draft-8',
    name: '春の歓迎会',
    description: '新メンバーの歓迎会です。場所は後日決定します。',
    open: true,
    deadline: '2025-03-20T23:59:59.000Z',
    status: 'closed',
    admins: ['user-2'],
    invitees: ['1eea935c-0d3c-411b-a565-1b09565237f4', 'user-3', 'user-4'],
    createdAt: '2025-02-01T10:00:00.000Z',
    updatedAt: '2025-03-10T10:00:00.000Z',
    candidateSlots: [
      {
        slotId: 'slot-d8-1',
        timeStart: '2025-04-05T18:00:00',
        timeEnd: '2025-04-05T18:30:00'
      },
      {
        slotId: 'slot-d8-2',
        timeStart: '2025-04-05T18:30:00',
        timeEnd: '2025-04-05T19:00:00'
      },
      {
        slotId: 'slot-d8-3',
        timeStart: '2025-04-12T18:00:00',
        timeEnd: '2025-04-12T18:30:00'
      },
      {
        slotId: 'slot-d8-4',
        timeStart: '2025-04-12T18:30:00',
        timeEnd: '2025-04-12T19:00:00'
      }
    ],
    tags: [{ name: '歓迎会' }]
  },
  {
    draftEventId: 'draft-9',
    name: 'ハッカソン日程調整',
    description: '社内ハッカソンの開催日を決めます。2日間の予定です。',
    open: false,
    deadline: '2025-02-28T23:59:59.000Z',
    status: 'confirmed',
    admins: ['user-3'],
    invitees: [
      '1eea935c-0d3c-411b-a565-1b09565237f4',
      'user-1',
      'user-2',
      'user-5'
    ],
    createdAt: '2025-01-20T08:00:00.000Z',
    updatedAt: '2025-02-25T15:00:00.000Z',
    candidateSlots: [
      {
        slotId: 'slot-d9-1',
        timeStart: '2025-03-15T10:00:00',
        timeEnd: '2025-03-15T10:30:00'
      },
      {
        slotId: 'slot-d9-2',
        timeStart: '2025-03-15T10:30:00',
        timeEnd: '2025-03-15T11:00:00'
      },
      {
        slotId: 'slot-d9-3',
        timeStart: '2025-03-22T10:00:00',
        timeEnd: '2025-03-22T10:30:00'
      },
      {
        slotId: 'slot-d9-4',
        timeStart: '2025-03-22T10:30:00',
        timeEnd: '2025-03-22T11:00:00'
      }
    ],
    tags: [{ name: 'ハッカソン' }]
  }
]

// ストレージ（作成されたdraftイベントを保持）
let draftEventsStore: ResponseDraftEventDetail[] = [
  mockDraftEventDetail,
  ...additionalMockDraftEvents
]
const availabilitiesStore: ResponseAvailability[] = [...mockAvailabilities]

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
  },

  // ユーザーの全回答を取得
  getMyAllAvailabilities: async (
    userId: string
  ): Promise<ResponseAvailability[]> => {
    await delay(200)
    return availabilitiesStore.filter((a) => a.userId === userId)
  },

  // 参加可能時間一覧取得
  getAvailabilities: async (
    draftEventId: string
  ): Promise<ResponseAvailability[]> => {
    await delay(300)
    return availabilitiesStore.filter((a) => a.draftEventId === draftEventId)
  },

  // 自分の参加可能時間を取得
  getMyAvailability: async (
    draftEventId: string,
    userId: string
  ): Promise<ResponseAvailability | null> => {
    await delay(200)
    return (
      availabilitiesStore.find(
        (a) => a.draftEventId === draftEventId && a.userId === userId
      ) || null
    )
  },

  // 参加可能時間を登録/更新
  saveAvailability: async (
    draftEventId: string,
    userId: string,
    data: { slotIds: string[]; comment?: string | null }
  ): Promise<ResponseAvailability> => {
    await delay(300)
    const now = new Date().toISOString()
    const existing = availabilitiesStore.find(
      (a) => a.draftEventId === draftEventId && a.userId === userId
    )

    if (existing) {
      existing.slotIds = data.slotIds
      existing.comment = data.comment ?? null
      existing.updatedAt = now
      return existing
    }

    const newAvailability: ResponseAvailability = {
      userId,
      draftEventId,
      slotIds: data.slotIds,
      comment: data.comment ?? null,
      updatedAt: now
    }
    availabilitiesStore.push(newAvailability)
    return newAvailability
  }
}

// ユーティリティ
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
