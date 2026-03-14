import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchArizalar, fetchArizaSayim, fetchArizaDetay,
  createAriza, updateAriza, deleteAriza,
  changeArizaDurum, tamamlaAriza,
  addArizaParca, deleteArizaParca,
} from '../services/arizaService'

const ARIZA_KEY = 'arizalar'

export function useArizalar(aracId, durum) {
  return useQuery({
    queryKey: [ARIZA_KEY, aracId ?? 'all', durum ?? 'all'],
    queryFn: () => fetchArizalar(aracId, durum),
  })
}

export function useArizaSayim() {
  return useQuery({
    queryKey: [ARIZA_KEY, 'sayim'],
    queryFn: fetchArizaSayim,
  })
}

export function useArizaDetay(id) {
  return useQuery({
    queryKey: [ARIZA_KEY, id],
    queryFn: () => fetchArizaDetay(id),
    enabled: !!id,
  })
}

function useInvalidate() {
  const qc = useQueryClient()
  return () => qc.invalidateQueries({ queryKey: [ARIZA_KEY] })
}

export function useCreateAriza() {
  const invalidate = useInvalidate()
  return useMutation({ mutationFn: createAriza, onSuccess: invalidate })
}

export function useUpdateAriza() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: ({ id, data }) => updateAriza(id, data),
    onSuccess: invalidate,
  })
}

export function useDeleteAriza() {
  const invalidate = useInvalidate()
  return useMutation({ mutationFn: deleteAriza, onSuccess: invalidate })
}

export function useChangeArizaDurum() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: ({ id, data }) => changeArizaDurum(id, data),
    onSuccess: invalidate,
  })
}

export function useTamamlaAriza() {
  const invalidate = useInvalidate()
  return useMutation({ mutationFn: tamamlaAriza, onSuccess: invalidate })
}

export function useAddArizaParca() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: ({ arizaId, data }) => addArizaParca(arizaId, data),
    onSuccess: invalidate,
  })
}

export function useDeleteArizaParca() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: ({ arizaId, parcaId }) => deleteArizaParca(arizaId, parcaId),
    onSuccess: invalidate,
  })
}
