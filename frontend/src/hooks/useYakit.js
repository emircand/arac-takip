import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { uploadExcel, confirmYakit, fetchYakitList } from '../services/yakitService'

export const yakitKey = (aracId) => ['yakit', aracId ?? 'all']

export function useYakitList(aracId) {
  return useQuery({
    queryKey: yakitKey(aracId),
    queryFn: () => fetchYakitList(aracId),
  })
}

export function useUploadExcel() {
  return useMutation({ mutationFn: uploadExcel })
}

export function useConfirmYakit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: confirmYakit,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['yakit'] }),
  })
}
