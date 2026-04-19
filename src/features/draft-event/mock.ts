import type {
  ResponseDraftEvent,
  ResponseDraftEventDetail,
  ResponseAvailability,
  ResponseSchedulingResults,
  RespondentSummary
} from './types'

// Mock draftイベント一覧
export const mockDraftEvents: ResponseDraftEvent[] = [
  {
    draftEventId: 'draft-1',
    name: '第10回進捗会',
    description: '第10回の進捗会です。参加可能な時間を入力してください。',
    open: true,
    deadline: '2026-04-22T23:59:59+09:00',
    status: 'open',
    admins: ['user-1'],
    invitees: ['user-2', 'user-3', 'user-4', 'user-7'],
    createdAt: '2026-04-08T10:00:00+09:00',
    updatedAt: '2026-04-08T10:00:00+09:00'
  },
  {
    draftEventId: 'draft-2',
    name: '忘年会',
    description: '年末の打ち上げ',
    open: false,
    deadline: '2025-12-15T23:59:59+09:00',
    status: 'closed',
    admins: ['user-1', 'user-2'],
    invitees: ['user-3', 'user-4', 'user-5'],
    createdAt: '2025-12-01T10:00:00+09:00',
    updatedAt: '2025-12-15T10:00:00+09:00'
  }
]

// Mock draftイベント詳細 (draft-1: 私は招待済・未回答)
export const mockDraftEventDetail: ResponseDraftEventDetail = {
  draftEventId: 'draft-1',
  name: '第10回進捗会',
  description: '第10回の進捗会です。参加可能な時間を入力してください。',
  open: true,
  deadline: '2026-04-22T23:59:59+09:00',
  status: 'open',
  admins: ['user-1'],
  invitees: ['user-2', 'user-3', 'user-4', 'user-7'],
  createdAt: '2026-04-08T10:00:00+09:00',
  updatedAt: '2026-04-08T10:00:00+09:00',
  candidateSlots: [
    {
      slotId: 'slot-1',
      timeStart: '2026-04-24T13:00:00+09:00',
      timeEnd: '2026-04-24T13:30:00+09:00'
    },
    {
      slotId: 'slot-2',
      timeStart: '2026-04-24T13:30:00+09:00',
      timeEnd: '2026-04-24T14:00:00+09:00'
    },
    {
      slotId: 'slot-3',
      timeStart: '2026-04-24T14:00:00+09:00',
      timeEnd: '2026-04-24T14:30:00+09:00'
    },
    {
      slotId: 'slot-4',
      timeStart: '2026-04-25T13:00:00+09:00',
      timeEnd: '2026-04-25T13:30:00+09:00'
    },
    {
      slotId: 'slot-5',
      timeStart: '2026-04-25T13:30:00+09:00',
      timeEnd: '2026-04-25T14:00:00+09:00'
    },
    {
      slotId: 'slot-6',
      timeStart: '2026-04-25T14:00:00+09:00',
      timeEnd: '2026-04-25T14:30:00+09:00'
    }
  ],
  tags: [{ name: '進捗会' }]
}

// Mock 参加可能時間
export const mockAvailabilities: ResponseAvailability[] = [
  // draft-1: user-2, user-3 が回答済（私は未回答）
  {
    userId: 'user-2',
    draftEventId: 'draft-1',
    slotIds: ['slot-1', 'slot-2', 'slot-4', 'slot-5'],
    comment: '午後なら大丈夫です',
    updatedAt: '2026-04-10T10:00:00+09:00'
  },
  {
    userId: 'user-3',
    draftEventId: 'draft-1',
    slotIds: ['slot-1', 'slot-2', 'slot-3'],
    comment: null,
    updatedAt: '2026-04-11T11:00:00+09:00'
  },
  // draft-3: 私を含む数名が回答済
  {
    userId: 'user-7',
    draftEventId: 'draft-3',
    slotIds: ['slot-d3-1', 'slot-d3-2', 'slot-d3-4'],
    comment: '午前希望です',
    updatedAt: '2026-04-12T09:00:00+09:00'
  },
  {
    userId: 'user-1',
    draftEventId: 'draft-3',
    slotIds: ['slot-d3-3', 'slot-d3-4', 'slot-d3-5'],
    comment: null,
    updatedAt: '2026-04-12T14:00:00+09:00'
  },
  {
    userId: 'user-3',
    draftEventId: 'draft-3',
    slotIds: ['slot-d3-1', 'slot-d3-2', 'slot-d3-3', 'slot-d3-4'],
    comment: null,
    updatedAt: '2026-04-13T08:00:00+09:00'
  },
  // draft-4: user-1, user-2 が回答済（私は未回答）
  {
    userId: 'user-1',
    draftEventId: 'draft-4',
    slotIds: ['slot-d4-2'],
    comment: '5/22のみ参加可能です',
    updatedAt: '2026-04-13T10:00:00+09:00'
  },
  {
    userId: 'user-2',
    draftEventId: 'draft-4',
    slotIds: ['slot-d4-2', 'slot-d4-3'],
    comment: null,
    updatedAt: '2026-04-13T15:00:00+09:00'
  },
  // draft-5 (確定済): 確定までの参加状況
  {
    userId: 'user-2',
    draftEventId: 'draft-5',
    slotIds: ['slot-d5-1', 'slot-d5-2', 'slot-d5-3'],
    comment: null,
    updatedAt: '2026-04-10T10:00:00+09:00'
  },
  {
    userId: 'user-3',
    draftEventId: 'draft-5',
    slotIds: ['slot-d5-3', 'slot-d5-4'],
    comment: '4/30 推し！',
    updatedAt: '2026-04-11T10:00:00+09:00'
  },
  // draft-6 (公開): 私は未回答
  {
    userId: 'user-2',
    draftEventId: 'draft-6',
    slotIds: ['slot-d6-1', 'slot-d6-3'],
    comment: '土曜午後なら可能',
    updatedAt: '2026-04-12T10:00:00+09:00'
  },
  {
    userId: 'user-5',
    draftEventId: 'draft-6',
    slotIds: ['slot-d6-2', 'slot-d6-3', 'slot-d6-4'],
    comment: null,
    updatedAt: '2026-04-13T10:00:00+09:00'
  },
  // draft-8 (締切後・閉鎖): 私が回答済（過去ログとして残る）
  {
    userId: 'user-7',
    draftEventId: 'draft-8',
    slotIds: ['slot-d8-1', 'slot-d8-3'],
    comment: '楽しみにしています',
    updatedAt: '2026-03-25T11:00:00+09:00'
  },
  {
    userId: 'user-3',
    draftEventId: 'draft-8',
    slotIds: ['slot-d8-1', 'slot-d8-2', 'slot-d8-3'],
    comment: null,
    updatedAt: '2026-03-26T11:00:00+09:00'
  },
  // draft-9 (締切後・確定): 私が回答済（過去ログとして残る）
  {
    userId: 'user-7',
    draftEventId: 'draft-9',
    slotIds: ['slot-d9-1', 'slot-d9-3'],
    comment: '土曜日希望',
    updatedAt: '2026-03-15T11:00:00+09:00'
  },
  {
    userId: 'user-1',
    draftEventId: 'draft-9',
    slotIds: ['slot-d9-1'],
    comment: null,
    updatedAt: '2026-03-15T14:00:00+09:00'
  },
  {
    userId: 'user-2',
    draftEventId: 'draft-9',
    slotIds: ['slot-d9-3', 'slot-d9-4'],
    comment: null,
    updatedAt: '2026-03-16T10:00:00+09:00'
  },
  // draft-10 (私が管理者のLT大会 vol.5): 数名が回答済
  {
    userId: 'user-1',
    draftEventId: 'draft-10',
    slotIds: ['slot-d10-1', 'slot-d10-2', 'slot-d10-3'],
    comment: '土曜の午後が希望です',
    updatedAt: '2026-04-16T10:00:00+09:00'
  },
  {
    userId: 'user-2',
    draftEventId: 'draft-10',
    slotIds: ['slot-d10-3', 'slot-d10-4'],
    comment: null,
    updatedAt: '2026-04-16T14:00:00+09:00'
  },
  {
    userId: 'user-3',
    draftEventId: 'draft-10',
    slotIds: ['slot-d10-1', 'slot-d10-3'],
    comment: 'どちらも大丈夫です',
    updatedAt: '2026-04-17T09:00:00+09:00'
  }
]

// Mock 日程調整結果（draft-1）
export const mockSchedulingResults: ResponseSchedulingResults = {
  draftEventId: 'draft-1',
  results: [
    {
      slotId: 'slot-1',
      availableCount: 2,
      availableUsers: ['user-2', 'user-3'],
      availabilityRate: 1
    },
    {
      slotId: 'slot-2',
      availableCount: 2,
      availableUsers: ['user-2', 'user-3'],
      availabilityRate: 1
    },
    {
      slotId: 'slot-3',
      availableCount: 1,
      availableUsers: ['user-3'],
      availabilityRate: 0.5
    },
    {
      slotId: 'slot-4',
      availableCount: 1,
      availableUsers: ['user-2'],
      availabilityRate: 0.5
    },
    {
      slotId: 'slot-5',
      availableCount: 1,
      availableUsers: ['user-2'],
      availabilityRate: 0.5
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
      respondedAt: '2026-04-10T10:00:00+09:00',
      comment: '午後なら大丈夫です'
    },
    {
      userId: 'user-3',
      respondedAt: '2026-04-11T11:00:00+09:00',
      comment: null
    }
  ],
  nonRespondents: ['user-4', 'user-7']
}

// 追加モックデータ（一覧テスト用）
const additionalMockDraftEvents: ResponseDraftEventDetail[] = [
  {
    draftEventId: 'draft-2',
    name: '忘年会',
    description: '年末の打ち上げ',
    open: false,
    deadline: '2025-12-15T23:59:59+09:00',
    status: 'closed',
    admins: ['user-1', 'user-2'],
    invitees: ['user-3', 'user-4', 'user-5'],
    createdAt: '2025-12-01T10:00:00+09:00',
    updatedAt: '2025-12-15T10:00:00+09:00',
    candidateSlots: [],
    tags: [{ name: '飲み会' }]
  },
  {
    draftEventId: 'draft-3',
    name: '新年度キックオフ MTG',
    description:
      '新年度最初のミーティングです。今期の目標と方針について話し合います。全員参加推奨です。',
    open: false,
    deadline: '2026-04-21T23:59:59+09:00',
    status: 'open',
    admins: ['user-2'],
    invitees: ['user-1', 'user-3', 'user-5', 'user-7'],
    createdAt: '2026-04-10T09:00:00+09:00',
    updatedAt: '2026-04-10T09:00:00+09:00',
    candidateSlots: [
      {
        slotId: 'slot-d3-1',
        timeStart: '2026-04-23T10:00:00+09:00',
        timeEnd: '2026-04-23T10:30:00+09:00'
      },
      {
        slotId: 'slot-d3-2',
        timeStart: '2026-04-23T10:30:00+09:00',
        timeEnd: '2026-04-23T11:00:00+09:00'
      },
      {
        slotId: 'slot-d3-3',
        timeStart: '2026-04-23T11:00:00+09:00',
        timeEnd: '2026-04-23T11:30:00+09:00'
      },
      {
        slotId: 'slot-d3-4',
        timeStart: '2026-04-23T13:00:00+09:00',
        timeEnd: '2026-04-23T13:30:00+09:00'
      },
      {
        slotId: 'slot-d3-5',
        timeStart: '2026-04-23T13:30:00+09:00',
        timeEnd: '2026-04-23T14:00:00+09:00'
      },
      {
        slotId: 'slot-d3-6',
        timeStart: '2026-04-23T14:00:00+09:00',
        timeEnd: '2026-04-23T14:30:00+09:00'
      }
    ],
    tags: [{ name: 'MTG' }]
  },
  {
    draftEventId: 'draft-4',
    name: 'チーム合宿',
    description: '春の開発合宿の日程を決めましょう。2泊3日の予定です。',
    open: false,
    deadline: '2026-05-05T23:59:59+09:00',
    status: 'open',
    admins: ['user-3'],
    invitees: [
      'user-1',
      'user-2',
      'user-4',
      'user-5',
      'user-6',
      'user-7'
    ],
    createdAt: '2026-04-12T10:00:00+09:00',
    updatedAt: '2026-04-12T10:00:00+09:00',
    candidateSlots: [
      {
        slotId: 'slot-d4-1',
        timeStart: '2026-05-15T18:00:00+09:00',
        timeEnd: '2026-05-15T18:30:00+09:00'
      },
      {
        slotId: 'slot-d4-2',
        timeStart: '2026-05-22T18:00:00+09:00',
        timeEnd: '2026-05-22T18:30:00+09:00'
      },
      {
        slotId: 'slot-d4-3',
        timeStart: '2026-05-29T18:00:00+09:00',
        timeEnd: '2026-05-29T18:30:00+09:00'
      },
      {
        slotId: 'slot-d4-4',
        timeStart: '2026-06-05T18:00:00+09:00',
        timeEnd: '2026-06-05T18:30:00+09:00'
      },
      {
        slotId: 'slot-d4-5',
        timeStart: '2026-06-12T18:00:00+09:00',
        timeEnd: '2026-06-12T18:30:00+09:00'
      },
      {
        slotId: 'slot-d4-6',
        timeStart: '2026-06-19T18:00:00+09:00',
        timeEnd: '2026-06-19T18:30:00+09:00'
      }
    ],
    tags: [{ name: '合宿' }]
  },
  {
    draftEventId: 'draft-5',
    name: 'LT大会 vol.4',
    description: null as unknown as string,
    open: true,
    deadline: '2026-04-25T23:59:59+09:00',
    status: 'confirmed',
    admins: ['user-1'],
    invitees: ['user-2', 'user-3'],
    createdAt: '2026-04-01T12:00:00+09:00',
    updatedAt: '2026-04-13T18:00:00+09:00',
    candidateSlots: [
      {
        slotId: 'slot-d5-1',
        timeStart: '2026-04-29T14:00:00+09:00',
        timeEnd: '2026-04-29T14:30:00+09:00'
      },
      {
        slotId: 'slot-d5-2',
        timeStart: '2026-04-29T14:30:00+09:00',
        timeEnd: '2026-04-29T15:00:00+09:00'
      },
      {
        slotId: 'slot-d5-3',
        timeStart: '2026-04-30T14:00:00+09:00',
        timeEnd: '2026-04-30T14:30:00+09:00'
      },
      {
        slotId: 'slot-d5-4',
        timeStart: '2026-04-30T14:30:00+09:00',
        timeEnd: '2026-04-30T15:00:00+09:00'
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
    deadline: '2026-04-30T23:59:59+09:00',
    status: 'open',
    admins: ['user-4'],
    invitees: [],
    createdAt: '2026-04-05T08:00:00+09:00',
    updatedAt: '2026-04-05T08:00:00+09:00',
    candidateSlots: [
      {
        slotId: 'slot-d6-1',
        timeStart: '2026-05-09T13:00:00+09:00',
        timeEnd: '2026-05-09T13:30:00+09:00'
      },
      {
        slotId: 'slot-d6-2',
        timeStart: '2026-05-09T13:30:00+09:00',
        timeEnd: '2026-05-09T14:00:00+09:00'
      },
      {
        slotId: 'slot-d6-3',
        timeStart: '2026-05-16T13:00:00+09:00',
        timeEnd: '2026-05-16T13:30:00+09:00'
      },
      {
        slotId: 'slot-d6-4',
        timeStart: '2026-05-16T13:30:00+09:00',
        timeEnd: '2026-05-16T14:00:00+09:00'
      }
    ],
    tags: []
  },
  {
    draftEventId: 'draft-7',
    name: '秘密のサプライズ企画',
    description: 'user-6 の送別会サプライズ企画です。本人には秘密！',
    open: false,
    deadline: '2026-04-18T23:59:59+09:00',
    status: 'open',
    admins: ['user-3'],
    invitees: ['user-4', 'user-5'],
    createdAt: '2026-04-10T14:00:00+09:00',
    updatedAt: '2026-04-10T14:00:00+09:00',
    candidateSlots: [
      {
        slotId: 'slot-d7-1',
        timeStart: '2026-04-21T18:00:00+09:00',
        timeEnd: '2026-04-21T18:30:00+09:00'
      },
      {
        slotId: 'slot-d7-2',
        timeStart: '2026-04-21T18:30:00+09:00',
        timeEnd: '2026-04-21T19:00:00+09:00'
      }
    ],
    tags: []
  },
  {
    draftEventId: 'draft-8',
    name: '春の歓迎会',
    description: '新メンバーの歓迎会です。場所は後日決定します。',
    open: true,
    deadline: '2026-03-30T23:59:59+09:00',
    status: 'closed',
    admins: ['user-2'],
    invitees: ['user-7', 'user-3', 'user-4'],
    createdAt: '2026-03-01T10:00:00+09:00',
    updatedAt: '2026-04-01T10:00:00+09:00',
    candidateSlots: [
      {
        slotId: 'slot-d8-1',
        timeStart: '2026-04-05T18:00:00+09:00',
        timeEnd: '2026-04-05T18:30:00+09:00'
      },
      {
        slotId: 'slot-d8-2',
        timeStart: '2026-04-05T18:30:00+09:00',
        timeEnd: '2026-04-05T19:00:00+09:00'
      },
      {
        slotId: 'slot-d8-3',
        timeStart: '2026-04-12T18:00:00+09:00',
        timeEnd: '2026-04-12T18:30:00+09:00'
      },
      {
        slotId: 'slot-d8-4',
        timeStart: '2026-04-12T18:30:00+09:00',
        timeEnd: '2026-04-12T19:00:00+09:00'
      }
    ],
    tags: [{ name: '歓迎会' }]
  },
  {
    draftEventId: 'draft-9',
    name: 'ハッカソン日程調整',
    description: '社内ハッカソンの開催日を決めます。2日間の予定です。',
    open: false,
    deadline: '2026-03-20T23:59:59+09:00',
    status: 'confirmed',
    admins: ['user-3'],
    invitees: [
      'user-7',
      'user-1',
      'user-2',
      'user-5'
    ],
    createdAt: '2026-02-20T08:00:00+09:00',
    updatedAt: '2026-03-25T15:00:00+09:00',
    candidateSlots: [
      {
        slotId: 'slot-d9-1',
        timeStart: '2026-04-04T10:00:00+09:00',
        timeEnd: '2026-04-04T10:30:00+09:00'
      },
      {
        slotId: 'slot-d9-2',
        timeStart: '2026-04-04T10:30:00+09:00',
        timeEnd: '2026-04-04T11:00:00+09:00'
      },
      {
        slotId: 'slot-d9-3',
        timeStart: '2026-04-11T10:00:00+09:00',
        timeEnd: '2026-04-11T10:30:00+09:00'
      },
      {
        slotId: 'slot-d9-4',
        timeStart: '2026-04-11T10:30:00+09:00',
        timeEnd: '2026-04-11T11:00:00+09:00'
      }
    ],
    tags: [{ name: 'ハッカソン' }]
  },
  {
    draftEventId: 'draft-10',
    name: 'LT大会 vol.5',
    description:
      '次回LT大会の日程調整です。発表希望者は早めに回答してください。',
    open: true,
    deadline: '2026-04-30T23:59:59+09:00',
    status: 'open',
    admins: ['1eea935c-0d3c-411b-a565-1b09565237f4'],
    invitees: ['user-1', 'user-2', 'user-3', 'user-5'],
    createdAt: '2026-04-15T10:00:00+09:00',
    updatedAt: '2026-04-15T10:00:00+09:00',
    candidateSlots: [
      {
        slotId: 'slot-d10-1',
        timeStart: '2026-05-08T14:00:00+09:00',
        timeEnd: '2026-05-08T14:30:00+09:00'
      },
      {
        slotId: 'slot-d10-2',
        timeStart: '2026-05-08T14:30:00+09:00',
        timeEnd: '2026-05-08T15:00:00+09:00'
      },
      {
        slotId: 'slot-d10-3',
        timeStart: '2026-05-09T14:00:00+09:00',
        timeEnd: '2026-05-09T14:30:00+09:00'
      },
      {
        slotId: 'slot-d10-4',
        timeStart: '2026-05-09T14:30:00+09:00',
        timeEnd: '2026-05-09T15:00:00+09:00'
      }
    ],
    tags: [{ name: 'LT' }]
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
    const now = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Tokyo' }).replace(' ', 'T') + '+09:00'
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

  // draftイベントを確定（status を 'confirmed' に変更し、確定時刻を記録）
  confirmDraftEvent: async (
    draftEventId: string,
    timeStart: string,
    timeEnd: string
  ): Promise<ResponseDraftEventDetail | null> => {
    await delay(200)
    const event = draftEventsStore.find((e) => e.draftEventId === draftEventId)
    if (!event) return null
    event.status = 'confirmed'
    event.confirmedTimeStart = timeStart
    event.confirmedTimeEnd = timeEnd
    event.updatedAt = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Tokyo' }).replace(' ', 'T') + '+09:00'
    return event
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

  // 日程調整結果を取得
  getSchedulingResults: async (
    draftEventId: string
  ): Promise<ResponseSchedulingResults> => {
    await delay(300)
    // availabilitiesStoreから動的に結果を計算
    const event = draftEventsStore.find((e) => e.draftEventId === draftEventId)
    if (!event) {
      return {
        draftEventId,
        results: [],
        respondents: [],
        nonRespondents: []
      }
    }

    const eventAvailabilities = availabilitiesStore.filter(
      (a) => a.draftEventId === draftEventId
    )
    const respondentUserIds = eventAvailabilities.map((a) => a.userId)
    const allInvolved = [
      ...new Set([...event.admins, ...event.invitees])
    ]
    const nonRespondents = allInvolved.filter(
      (id) => !respondentUserIds.includes(id)
    )

    const totalRespondents = eventAvailabilities.length
    const results = event.candidateSlots.map((slot) => {
      const availableUsers = eventAvailabilities
        .filter((a) => a.slotIds.includes(slot.slotId))
        .map((a) => a.userId)
      return {
        slotId: slot.slotId,
        availableCount: availableUsers.length,
        availableUsers,
        availabilityRate:
          totalRespondents > 0
            ? availableUsers.length / totalRespondents
            : 0
      }
    })

    const respondents: RespondentSummary[] = eventAvailabilities.map((a) => ({
      userId: a.userId,
      respondedAt: a.updatedAt,
      comment: a.comment
    }))

    return {
      draftEventId,
      results,
      respondents,
      nonRespondents
    }
  },

  // 参加可能時間を登録/更新
  saveAvailability: async (
    draftEventId: string,
    userId: string,
    data: { slotIds: string[]; comment?: string | null }
  ): Promise<ResponseAvailability> => {
    await delay(300)
    const now = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Tokyo' }).replace(' ', 'T') + '+09:00'
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
