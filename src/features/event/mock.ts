import { KnoqEvent, KnoqEventDetail } from '.'
import { paths } from '../../api/schema'
import { mockApi } from '../../lib/mock'

const eventDetails: KnoqEventDetail[] = [
  {
    eventId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    name: '第n回進捗回',
    description: '第n回の進捗会です。',
    sharedRoom: true,
    timeStart: '2006-01-02T15:04:05Z',
    timeEnd: '2006-01-02T15:04:05Z',
    place: 'S516',
    groupName: 'room',
    open: true,
    room: {
      roomId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      place: 'S516',
      timeStart: '2006-01-02T15:04:05Z',
      timeEnd: '2006-01-02T15:04:05Z',
      verified: true,
      freeTimes: [
        {
          timeStart: '2006-01-02T15:04:05Z',
          timeEnd: '2006-01-02T15:04:05Z'
        }
      ],
      sharedTimes: [
        {
          timeStart: '2006-01-02T15:04:05Z',
          timeEnd: '2006-01-02T15:04:05Z'
        }
      ],
      admins: ['3fa85f64-5717-4562-b3fc-2c963f66afa6'],
      createdBy: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      createdAt: '2006-01-02T15:04:05Z',
      updatedAt: '2006-01-02T15:04:05Z'
    },
    group: {
      groupId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      name: 'room',
      description: 'Sysad班room開発グループ',
      open: true,
      isTraQGroup: false,
      members: ['3fa85f64-5717-4562-b3fc-2c963f66afa6'],
      admins: ['3fa85f64-5717-4562-b3fc-2c963f66afa6'],
      createdBy: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      createdAt: '2006-01-02T15:04:05Z',
      updatedAt: '2006-01-02T15:04:05Z'
    },
    admins: ['3fa85f64-5717-4562-b3fc-2c963f66afa6'],
    tags: [
      {
        tagId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        name: 'Vue',
        locked: true
      }
    ],
    attendees: [
      {
        userId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        schedule: 'pending'
      }
    ],
    createdBy: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    createdAt: '2006-01-02T15:04:05Z',
    updatedAt: '2006-01-02T15:04:05Z'
  }
]
const events: KnoqEvent[] = eventDetails.map((v) => {
  return { ...v, roomId: v.room.roomId, groupId: v.group.groupId }
})

export const eventHandlers = [
  mockApi.get('/events', (req, res, ctx) => {
    type Responses = paths['/events']['get']['responses']
    return res(ctx.status(200), ctx.json<Responses[200]['content']['application/json']>(events))
  }),
  mockApi.post('/events', (req, res, ctx) => {
    type Responses = paths['/events']['post']['responses']
    return res(
      ctx.status(201),
      ctx.json<Responses[201]['content']['application/json']>(eventDetails[0])
    )
  }),
  mockApi.get('/events/{eventID}', (req, res, ctx) => {
    type Responses = paths['/events/{eventID}']['get']['responses']
    const id = req.params.id as string
    return res(
      ctx.status(200),
      ctx.json<Responses[200]['content']['application/json']>({ ...eventDetails[0], eventId: id })
    )
  }),
  mockApi.get('/users/me/events', (req, res, ctx) => {
    type Responses = paths['/users/me/events']['get']['responses']
    return res(ctx.status(200), ctx.json<Responses[200]['content']['application/json']>(events))
  })
]
