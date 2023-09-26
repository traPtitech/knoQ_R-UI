export const fetcher = async (path: string) =>
  (await fetch(`http://localhost:6006/api${path}`, { credentials: 'include' })).json()
