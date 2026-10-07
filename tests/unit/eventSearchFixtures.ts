import type { KnoqEvent } from '/@/features/event/types'

export const now = new Date('2026-09-09T12:00:00+09:00')
export const ids = {
  tag: '00000000-0000-4000-8000-000000000001',
  user: '00000000-0000-4000-8000-000000000002',
  group: '00000000-0000-4000-8000-000000000003'
}
export const event = (overrides: Partial<KnoqEvent> = {}): KnoqEvent => ({
  eventId: '00000000-0000-4000-8000-000000000004',
  name: 'Vue勉強会',
  description: 'TypeScriptの相談会',
  timeStart: '2026-09-09T11:00:00+09:00',
  timeEnd: '2026-09-09T13:00:00+09:00',
  place: 'S516',
  roomId: '',
  groupId: ids.group,
  sharedRoom: true,
  open: true,
  admins: [],
  tags: [{ tagId: ids.tag, name: 'Vue' }],
  attendees: [ids.user],
  createdBy: ids.user,
  createdAt: '2026-09-01T00:00:00Z',
  updatedAt: '2026-09-01T00:00:00Z',
  ...overrides
})
