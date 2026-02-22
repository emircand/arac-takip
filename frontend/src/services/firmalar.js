import { api } from '../lib/apiClient'

export function fetchFirmalar() {
  return api.get('/api/firmalar')
}
