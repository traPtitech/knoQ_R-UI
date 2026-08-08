import { components } from '/@/lib/api'

export type KnoqEvent = components['schemas']['ResponseEvent']
export type KnoqEventDetail = components['schemas']['ResponseEventDetail']
export type Schedule = components['schemas']['RequestSchedule']['schedule']

// SchedulePoll コンポーネント用の仮置き型。
// 日程調整ポーリング機能を見越したプロトタイプ実装で、現行 API には対応フィールドが無い。
// バックエンドが追従した時点で components['schemas'] 由来の型に置き換える。
export type SchedulePollScheduleStatus = 'attending' | 'absent' | 'pending'

export interface SchedulePollScheduleOption {
  startAt: string
  endAt: string
}

export interface SchedulePollAttendeeSchedule
  extends SchedulePollScheduleOption {
  status: SchedulePollScheduleStatus
}

export interface SchedulePollAttendee {
  user: { userId: string }
  schedule: SchedulePollAttendeeSchedule[]
}

export interface SchedulePollEvent {
  schedules?: SchedulePollScheduleOption[]
  attendees?: SchedulePollAttendee[]
}
