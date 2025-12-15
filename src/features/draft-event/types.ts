export type DraftEventStatus = 'open' | 'closed' | 'confirmed'

export interface RequestCandidateSlot {
  timeStart: string // ISO8601
  timeEnd: string // ISO8601
}

export interface ResponseCandidateSlot {
  slotId: string
  timeStart: string // ISO8601
  timeEnd: string // ISO8601
}

export interface RequestDraftEvent {
  name: string
  description?: string
  open?: boolean
  deadline: string
  candidateSlots: RequestCandidateSlot[]
  admins: string[]
  invitees?: string[]
  tags?: { name: string }[]
}

// draftイベント更新リクエスト
export interface RequestDraftEventUpdate {
  name?: string
  description?: string
  open?: boolean
  deadline?: string
  additionalCandidateSlots?: RequestCandidateSlot[]
  invitees?: string[]
}

export interface RequestAvailability {
  slotIds: string[]
  comment?: string | null
}

export interface ResponseDraftEvent {
  draftEventId: string
  name: string
  description?: string
  open: boolean
  deadline: string
  status: DraftEventStatus
  admins: string[]
  invitees: string[]
  createdAt: string
  updatedAt: string
}

export interface ResponseDraftEventDetail extends ResponseDraftEvent {
  candidateSlots: ResponseCandidateSlot[]
  tags: { name: string }[]
}

export interface ResponseAvailability {
  userId: string
  draftEventId: string
  slotIds: string[]
  comment?: string | null
  updatedAt: string
}

export interface SlotResult {
  slotId: string
  availableCount: number
  availableUsers: string[]
  availabilityRate: number
}

export interface RespondentSummary {
  userId: string
  respondedAt: string
  comment?: string | null
}

export interface ResponseSchedulingResults {
  draftEventId: string
  results: SlotResult[]
  respondents: RespondentSummary[]
  nonRespondents: string[]
}
