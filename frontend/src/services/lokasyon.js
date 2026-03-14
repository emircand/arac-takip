import { api } from '../lib/apiClient'

export function fetchLokasyonAgac() {
  return api.get('/api/lokasyonlar/agac')
}

export function fetchBolgeler() {
  return api.get('/api/bolgeler')
}

export function fetchSubeler(bolgeId) {
  const qs = bolgeId != null ? `?bolge_id=${bolgeId}` : ''
  return api.get(`/api/subeler${qs}`)
}
