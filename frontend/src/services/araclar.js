import { api } from '../lib/apiClient'

export function fetchAraclar({ tur, aktif } = {}) {
  const params = new URLSearchParams()
  if (tur   !== undefined) params.set('tur',   tur)
  if (aktif !== undefined) params.set('aktif', aktif)
  const qs = params.toString()
  return api.get(`/api/araclar${qs ? `?${qs}` : ''}`)
}

export function fetchCekiciler(aktif) {
  const qs = aktif !== undefined ? `?aktif=${aktif}` : ''
  return api.get(`/api/araclar/cekiciler${qs}`)
}

export function fetchDorseler(aktif) {
  const qs = aktif !== undefined ? `?aktif=${aktif}` : ''
  return api.get(`/api/araclar/dorseler${qs}`)
}

export function fetchSefereKatilabilir() {
  return api.get('/api/araclar/sefere-katilabilir')
}

export function fetchAracTurleri() {
  return api.get('/api/arac-turleri')
}

export function createArac(payload) {
  return api.post('/api/araclar', payload)
}

export function updateArac(id, payload) {
  return api.put(`/api/araclar/${id}`, payload)
}

export function toggleAracAktif(id, aktif) {
  return api.patch(`/api/araclar/${id}/aktif`, { aktif })
}
