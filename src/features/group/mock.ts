import { paths } from '/@/lib/api'
import { mockApi } from '../../lib/mock'
import { Group } from './types'

const groups: Group[] = [
  {
    groupId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    name: 'room',
    description: 'Sysad班room開発グループ',
    open: true,
    isTraQGroup: false,
    members: ['48bf1ce8-3cf4-4470-8ac9-96a9d2fea3f4'],
    admins: ['48bf1ce8-3cf4-4470-8ac9-96a9d2fea3f4'],
    createdBy: '48bf1ce8-3cf4-4470-8ac9-96a9d2fea3f4',
    createdAt: '2006-01-02T15:04:05Z',
    updatedAt: '2006-01-02T15:04:05Z'
  }
]
const groupIds: string[] = groups.map((v) => v.groupId)

export const groupHandlers = [
  mockApi.get('/groups', (req, res, ctx) => {
    type Responses = paths['/groups']['get']['responses']
    return res(
      ctx.status(200),
      ctx.json<Responses[200]['content']['application/json']>(groups)
    )
  }),
  mockApi.get('/users/me/groups', (req, res, ctx) => {
    type Responses = paths['/users/me/groups']['get']['responses']
    return res(
      ctx.status(200),
      ctx.json<Responses[200]['content']['application/json']>(groupIds)
    )
  })
]
