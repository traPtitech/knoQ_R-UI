import type { components } from '/@/lib/api/schema'

export type Room = components['schemas']['ResponseRoom']
export type KnoqEvent = components['schemas']['ResponseEvent']

export type RoomWithEvents = Room & {
  events: KnoqEvent[]
}
