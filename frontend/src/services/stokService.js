import { api } from '../lib/apiClient'

export function fetchStokList(ara) {
  const qs = ara ? `?ara=${encodeURIComponent(ara)}` : ''
  return api.get(`/api/stok${qs}`)
}

export function createStok(data) {
  return api.post('/api/stok', data)
}

export function updateStok(id, data) {
  return api.put(`/api/stok/${id}`, data)
}

export function stokGiris(id, data) {
  return api.post(`/api/stok/${id}/giris`, data)
}
