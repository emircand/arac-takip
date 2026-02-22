import { api } from '../lib/apiClient'

export function fetchAllSoforler() {
  return api.get('/api/soforler')
}

export function fetchActiveSoforler() {
  return api.get('/api/soforler?aktif=true')
}

export function createSofor(payload) {
  return api.post('/api/soforler', payload)
}

export function updateSofor(id, payload) {
  return api.put(`/api/soforler/${id}`, payload)
}

export function toggleSoforActive(id, aktif) {
  return api.patch(`/api/soforler/${id}/aktif`, { aktif })
}
