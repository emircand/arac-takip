import { api } from '../lib/apiClient'

export function fetchLokasyonAgac() {
  return api.get('/api/lokasyonlar/agac')
}
