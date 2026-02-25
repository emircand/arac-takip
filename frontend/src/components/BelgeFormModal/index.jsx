import { useState, useEffect } from 'react'
import { useCreateBelge, useUpdateBelge } from '../../hooks/useBelgeler'
import { BELGE_TURLERI } from '../../services/aracBelgeler'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Stack, Typography, Box, IconButton, Alert,
} from '@mui/material'
import { X } from 'lucide-react'

const EMPTY = { bitisTarihi: '', cihazNo: '' }

export default function BelgeFormModal({ open, onClose, aracId, aracPlaka, belgeTuru, belge, onSaved }) {
  const [form, setForm] = useState(EMPTY)

  const createMut = useCreateBelge(aracId)
  const updateMut = useUpdateBelge(aracId)
  const isPending  = createMut.isPending || updateMut.isPending
  const err        = createMut.error?.message ?? updateMut.error?.message ?? null

  useEffect(() => {
    if (open) {
      createMut.reset()
      updateMut.reset()
      setForm(belge ? {
        bitisTarihi: belge.bitis_tarihi ?? belge.bitisTarihi ?? '',
        cihazNo:     belge.cihaz_no ?? belge.cihazNo ?? '',
      } : EMPTY)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [belge, open])

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))
  const turLabel = BELGE_TURLERI.find(t => t.value === belgeTuru)?.label ?? belgeTuru

  const handleSave = () => {
    const payload = {
      arac_id:      aracId,
      belge_turu:   belgeTuru,
      bitis_tarihi: form.bitisTarihi,
      cihaz_no:     belgeTuru === 'arvato_gps' ? (form.cihazNo || null) : null,
    }
    if (belge?.id) {
      updateMut.mutate({ id: belge.id, payload }, { onSuccess: onSaved })
    } else {
      createMut.mutate(payload, { onSuccess: onSaved })
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box>
          <Typography variant="subtitle1" fontWeight={700}>
            {turLabel} {belge?.id ? 'Güncelle' : 'Ekle'}
          </Typography>
          {aracPlaka && (
            <Typography variant="caption" color="text.secondary">{aracPlaka}</Typography>
          )}
        </Box>
        <IconButton size="small" onClick={onClose}><X size={16} /></IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {err && <Alert severity="error">{err}</Alert>}
          <TextField
            fullWidth size="small" label="Bitiş Tarihi" type="date"
            value={form.bitisTarihi} onChange={set('bitisTarihi')}
            InputLabelProps={{ shrink: true }} required
          />
          {belgeTuru === 'arvato_gps' && (
            <TextField
              fullWidth size="small" label="Cihaz Numarası"
              value={form.cihazNo} onChange={set('cihazNo')}
              placeholder="Arvento cihaz no"
            />
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit" disabled={isPending}>İptal</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isPending || !form.bitisTarihi}
        >
          {isPending ? 'Kaydediliyor...' : (belge?.id ? 'Güncelle' : 'Ekle')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
