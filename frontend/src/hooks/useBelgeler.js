import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchBelgeler, createBelge, updateBelge, deleteBelge,
} from '../services/aracBelgeler'

export const belgelerKey = (aracId) => ['belgeler', aracId]

export function useBelgeler(aracId) {
  return useQuery({
    queryKey: belgelerKey(aracId),
    queryFn: () => fetchBelgeler(aracId),
    enabled: !!aracId,
  })
}

export function useCreateBelge(aracId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createBelge,
    onSuccess: () => qc.invalidateQueries({ queryKey: belgelerKey(aracId) }),
  })
}

export function useUpdateBelge(aracId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }) => updateBelge(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: belgelerKey(aracId) }),
  })
}

export function useDeleteBelge(aracId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteBelge,
    onSuccess: () => qc.invalidateQueries({ queryKey: belgelerKey(aracId) }),
  })
}
