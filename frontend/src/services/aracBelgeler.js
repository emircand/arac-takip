import { api } from '../lib/apiClient'

export const BELGE_TURLERI = [
  { value: 'muayene',    label: 'Muayene' },
  { value: 'sigorta',    label: 'Sigorta' },
  { value: 'kasko',      label: 'Kasko' },
  { value: 'arvato_gps', label: 'Arvato GPS' },
  { value: 'diger',      label: 'Diğer' },
]

export const BELGE_DURUMLARI = {
  valid:    { label: 'Geçerli',  color: 'success' },
  warning:  { label: 'Uyarı',   color: 'warning' },
  critical: { label: 'Kritik',  color: 'error'   },
  expired:  { label: 'Süresi Dolmuş', color: 'default' },
}

export function fetchBelgeler(aracId) {
  return api.get(`/api/arac-belgeler?aracId=${aracId}`)
}

export function fetchBelgeGecmis(aracId, belgeTuru) {
  return api.get(`/api/arac-belgeler/gecmis?aracId=${aracId}&belgeTuru=${belgeTuru}`)
}

export function fetchBelgeById(id) {
  return api.get(`/api/arac-belgeler/${id}`)
}

export function fetchBelgeOzet(aracId) {
  return api.get(`/api/arac-belgeler/ozet/${aracId}`)
}

export function fetchUyarilar(gun = 30) {
  return api.get(`/api/arac-belgeler/uyarilar?gun=${gun}`)
}

export function fetchDashboardSayim() {
  return api.get('/api/arac-belgeler/dashboard/sayim')
}

export function createBelge(payload) {
  return api.post('/api/arac-belgeler', payload)
}

export function updateBelge(id, payload) {
  return api.put(`/api/arac-belgeler/${id}`, payload)
}

export function deleteBelge(id) {
  return api.del(`/api/arac-belgeler/${id}`)
}
