import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchStokList, createStok, updateStok, stokGiris, fetchKritikStok } from '../services/stokService'

const STOK_KEY = 'stok'

export function useStokList(ara) {
  return useQuery({
    queryKey: [STOK_KEY, ara ?? ''],
    queryFn: () => fetchStokList(ara),
    staleTime: 60_000,
  })
}

function useInvalidate() {
  const qc = useQueryClient()
  return () => qc.invalidateQueries({ queryKey: [STOK_KEY] })
}

export function useCreateStok() {
  const invalidate = useInvalidate()
  return useMutation({ mutationFn: createStok, onSuccess: invalidate })
}

export function useUpdateStok() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: ({ id, data }) => updateStok(id, data),
    onSuccess: invalidate,
  })
}

export function useStokGiris() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: ({ id, data }) => stokGiris(id, data),
    onSuccess: invalidate,
  })
}

export function useKritikStok(esik = 5) {
  return useQuery({
    queryKey: [STOK_KEY, 'kritik', esik],
    queryFn: () => fetchKritikStok(esik),
    staleTime: 60_000,
  })
}
