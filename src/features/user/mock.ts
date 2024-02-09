import { rest } from 'msw'
import { User } from './types'
import { mockApi } from '../../lib/mock'

const users: User[] = [
  {
    userId: '48bf1ce8-3cf4-4470-8ac9-96a9d2fea3f4',
    name: 'itt',
    displayName: 'itt',
    icon: 'https://q.trap.jp/api/v3/public/icon/itt',
    privileged: true,
    state: 1
  },
  {
    userId: '36ece538-f7c1-4a37-871d-65ca4937444f',
    name: 'Kamijo',
    displayName: 'かみじ☕',
    icon: 'https://q.trap.jp/api/v3/public/icon/Kamijo',
    privileged: false,
    state: 1
  }
]

const me: User = users[0]

export const userHandlers = [
  mockApi.get('/users', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(users))
  }),
  mockApi.get('/users/me', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(me))
  })
]
