import { BASE_URL } from './api'

export const fetcher = async (path: string) =>
  (await fetch(`${BASE_URL}${path}`, { credentials: 'include' })).json()
