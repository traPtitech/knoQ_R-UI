import {
  Configuration,
  RoomsApi,
  EventsApi,
  GroupsApi,
  UsersApi,
  TagsApi,
  AuthenticationApi,
  ICalApi,
  PublicApi
} from './generated'

export const BASE_PATH =
  process.env.NODE_ENV === 'development' ? 'http://localhost:6006/api' : '/api'
const config = new Configuration({
  basePath: BASE_PATH,
  baseOptions: {
    withCredentials: true
  }
})

const api = {
  rooms: new RoomsApi(config),
  events: new EventsApi(config),
  groups: new GroupsApi(config),
  users: new UsersApi(config),
  tags: new TagsApi(config),
  auth: new AuthenticationApi(config),
  ical: new ICalApi(config),
  public: new PublicApi(config)
}

export default api
export * from './generated'
