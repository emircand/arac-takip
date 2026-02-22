import { api } from '../lib/apiClient'

export function createTrip(payload) {
  return api.post('/api/seferler', payload)
}

export function updateTrip(id, payload) {
  return api.put(`/api/seferler/${id}`, payload)
}

export function deleteTrip(id) {
  return api.del(`/api/seferler/${id}`)
}

export function fetchRecentTrips() {
  return api.get('/api/seferler')
}

export function fetchTodayStats() {
  const today = new Date().toISOString().split('T')[0]
  return api.get(`/api/seferler?start=${today}&end=${today}`)
}

export function fetchLastKm(cekiciId) {
  return api.get(`/api/seferler/last-km?cekici_id=${cekiciId}`)
}

export function fetchTripsForDashboard(startDate, endDate) {
  const params = new URLSearchParams()
  if (startDate) params.set('start', startDate)
  if (endDate)   params.set('end',   endDate)
  const qs = params.toString()
  return api.get(`/api/seferler${qs ? `?${qs}` : ''}`)
}
