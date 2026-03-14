import { api } from '../lib/apiClient'

export function fetchLokasyonAgac() {
  return api.get('/api/lokasyonlar/agac')
}

export function fetchBolgeler() {
  return api.get('/api/bolgeler')
}
