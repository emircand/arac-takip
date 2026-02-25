import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchAllSoforler, createSofor, updateSofor, toggleSoforActive,
} from '../services/soforler'

export const SOFORLER_KEY = ['soforler']

export function useSoforler() {
  return useQuery({ queryKey: SOFORLER_KEY, queryFn: fetchAllSoforler })
}

export function useCreateSofor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createSofor,
    onSuccess: () => qc.invalidateQueries({ queryKey: SOFORLER_KEY }),
  })
}

export function useUpdateSofor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }) => updateSofor(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: SOFORLER_KEY }),
  })
}

export function useToggleSoforActive() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, aktif }) => toggleSoforActive(id, aktif),
    onSuccess: () => qc.invalidateQueries({ queryKey: SOFORLER_KEY }),
  })
}
