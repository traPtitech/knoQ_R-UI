import { Configuration, EventsApi, UsersApi, GroupsApi, AuthenticationApi } from './generated'

export const BASE_PATH = 'http://localhost:6006/api'
const config = new Configuration({
  basePath: BASE_PATH,
  baseOptions: {
    withCredentials: true
  }
})

const usersApi = new UsersApi(config, '')
const eventsApi = new EventsApi(config, '')
const groupsApi = new GroupsApi(config, '')
const authApi = new AuthenticationApi(config, '')

const api = {
  users: usersApi,
  events: eventsApi,
  auth: authApi,
  groups: groupsApi
}

export default api
export * from './generated'
