import { Configuration, EventsApi, UsersApi } from "./generated";

export const BASE_PATH = "/api";
const config = new Configuration({ basePath: BASE_PATH });

const usersApi = new UsersApi(config, "");
const eventsApi = new EventsApi(config, "");

const api = {
  users: usersApi,
  events: eventsApi,
};

export default api;
export * from "./generated";
