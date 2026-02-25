import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchAraclar, fetchAracTurleri,
  createArac, updateArac, toggleAracAktif,
} from '../services/araclar'

export const ARACLAR_KEY = ['araclar']
export const ARAC_TURLERI_KEY = ['aracTurleri']

export function useAraclar() {
  return useQuery({ queryKey: ARACLAR_KEY, queryFn: () => fetchAraclar() })
}

export function useAracTurleri() {
  return useQuery({ queryKey: ARAC_TURLERI_KEY, queryFn: fetchAracTurleri, staleTime: Infinity })
}

export function useCreateArac() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createArac,
    onSuccess: () => qc.invalidateQueries({ queryKey: ARACLAR_KEY }),
  })
}

export function useUpdateArac() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }) => updateArac(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ARACLAR_KEY }),
  })
}

export function useToggleAracAktif() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, aktif }) => toggleAracAktif(id, aktif),
    onSuccess: () => qc.invalidateQueries({ queryKey: ARACLAR_KEY }),
  })
}
