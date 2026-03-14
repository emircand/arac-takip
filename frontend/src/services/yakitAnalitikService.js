import { api } from '../lib/apiClient'

export function fetchTrend({ aracId, baslangic, bitis } = {}) {
  const params = new URLSearchParams()
  if (aracId)    params.set('aracId', aracId)
  if (baslangic) params.set('baslangic', baslangic)
  if (bitis)     params.set('bitis', bitis)
  const qs = params.toString()
  return api.get(`/api/dashboard/yakit/trend${qs ? '?' + qs : ''}`)
}

export function fetchKarsilastirma(donem) {
  const qs = donem ? `?donem=${donem}` : ''
  return api.get(`/api/dashboard/yakit/karsilastirma${qs}`)
}

export function fetchAnomaliler(gun = 90) {
  return api.get(`/api/dashboard/yakit/anomaliler?gun=${gun}`)
}

export function fetchYakitOzet(aracId) {
  return api.get(`/api/dashboard/yakit/ozet/${aracId}`)
}

export function fetchYakitRisk() {
  return api.get('/api/dashboard/yakit/risk')
}
