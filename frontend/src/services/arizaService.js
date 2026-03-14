import { api } from '../lib/apiClient'

export function fetchArizalar(aracId, durum) {
  const params = new URLSearchParams()
  if (aracId) params.set('aracId', aracId)
  if (durum) params.set('durum', durum)
  const qs = params.toString() ? `?${params}` : ''
  return api.get(`/api/arizalar${qs}`)
}

export function fetchArizaSayim() {
  return api.get('/api/arizalar/sayim')
}

export function fetchArizaDetay(id) {
  return api.get(`/api/arizalar/${id}`)
}

export function createAriza(data) {
  return api.post('/api/arizalar', data)
}

export function updateAriza(id, data) {
  return api.put(`/api/arizalar/${id}`, data)
}

export function deleteAriza(id) {
  return api.del(`/api/arizalar/${id}`)
}

export function changeArizaDurum(id, data) {
  return api.post(`/api/arizalar/${id}/durum`, data)
}

export function tamamlaAriza(id) {
  return api.post(`/api/arizalar/${id}/tamamla`, {})
}

export function addArizaParca(arizaId, data) {
  return api.post(`/api/arizalar/${arizaId}/parcalar`, data)
}

export function deleteArizaParca(arizaId, parcaId) {
  return api.del(`/api/arizalar/${arizaId}/parcalar/${parcaId}`)
}
