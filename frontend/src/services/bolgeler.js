import { api } from '../lib/apiClient'

export function fetchBolgeler() {
  return api.get('/api/bolgeler')
}
