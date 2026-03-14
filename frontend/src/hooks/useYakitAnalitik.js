import { useQuery } from '@tanstack/react-query'
import {
  fetchTrend, fetchKarsilastirma, fetchAnomaliler, fetchYakitOzet, fetchYakitRisk,
} from '../services/yakitAnalitikService'

export function useYakitTrend(params = {}) {
  return useQuery({
    queryKey: ['yakit-trend', params],
    queryFn: () => fetchTrend(params),
    staleTime: 120_000,
  })
}

export function useYakitKarsilastirma(donem) {
  return useQuery({
    queryKey: ['yakit-karsilastirma', donem ?? ''],
    queryFn: () => fetchKarsilastirma(donem),
    staleTime: 120_000,
  })
}

export function useYakitAnomaliler(gun = 90) {
  return useQuery({
    queryKey: ['yakit-anomaliler', gun],
    queryFn: () => fetchAnomaliler(gun),
    staleTime: 60_000,
  })
}

export function useYakitOzet(aracId) {
  return useQuery({
    queryKey: ['yakit-ozet', aracId],
    queryFn: () => fetchYakitOzet(aracId),
    enabled: !!aracId,
    staleTime: 120_000,
  })
}

export function useYakitRisk() {
  return useQuery({
    queryKey: ['yakit-risk'],
    queryFn: fetchYakitRisk,
    staleTime: 120_000,
  })
}
