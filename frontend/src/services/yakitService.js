const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

function getToken() {
  return localStorage.getItem('filo_token')
}

/** Multipart upload — Content-Type header set by browser */
export async function uploadExcel(file) {
  const form = new FormData()
  form.append('file', file)

  const res = await fetch(`${BASE}/api/yakit/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` },
    body: form,
  })
  const json = await res.json()
  if (!res.ok || !json.success) throw new Error(json.message ?? `HTTP ${res.status}`)
  return json.data // { matched: [...], unmatched: [...] }
}

/** JSON confirm */
import { api } from '../lib/apiClient'

export function confirmYakit(rows) {
  return api.post('/api/yakit/confirm', rows)
}

export function fetchYakitList(aracId) {
  const qs = aracId ? `?aracId=${aracId}` : ''
  return api.get(`/api/yakit${qs}`)
}
