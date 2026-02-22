import { useState, useEffect } from 'react'
import { createBelge, updateBelge, BELGE_TURLERI } from '../../services/aracBelgeler'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Stack, Typography, Box, IconButton,
  Alert, Grid,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

const EMPTY = {
  baslangicTarihi: '',
  bitisTarihi: '',
  policeNo: '',
  kurum: '',
  tutar: '',
  notlar: '',
}

export default function BelgeFormModal({ open, onClose, aracId, aracPlaka, belgeTuru, belge, onSaved }) {
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState(null)

  useEffect(() => {
    if (open) {
      setErr(null)
      if (belge) {
        setForm({
          baslangicTarihi: belge.baslangic_tarihi ?? belge.baslangicTarihi ?? '',
          bitisTarihi:     belge.bitis_tarihi ?? belge.bitisTarihi ?? '',
          policeNo:        belge.police_no ?? belge.policeNo ?? '',
          kurum:           belge.kurum ?? '',
          tutar:           belge.tutar?.toString() ?? '',
          notlar:          belge.notlar ?? '',
        })
      } else {
        setForm(EMPTY)
      }
    }
  }, [belge, open])

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const turLabel = BELGE_TURLERI.find(t => t.value === belgeTuru)?.label ?? belgeTuru

  const handleSave = async () => {
    setSaving(true)
    setErr(null)
    try {
      const payload = {
        arac_id:          aracId,
        belge_turu:       belgeTuru,
        baslangic_tarihi: form.baslangicTarihi || null,
        bitis_tarihi:     form.bitisTarihi,
        police_no:        form.policeNo || null,
        kurum:            form.kurum || null,
        tutar:            form.tutar ? Number(form.tutar) : null,
        notlar:           form.notlar || null,
      }
      if (belge?.id) {
        await updateBelge(belge.id, payload)
      } else {
        await createBelge(payload)
      }
      onSaved()
    } catch (e) {
      setErr(e.message ?? 'Kayıt başarısız')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box>
          <Typography variant="subtitle1" fontWeight={700}>
            {turLabel} Belgesi {belge?.id ? 'Güncelle' : 'Ekle'}
          </Typography>
          {aracPlaka && (
            <Typography variant="caption" color="text.secondary">{aracPlaka}</Typography>
          )}
        </Box>
        <IconButton size="small" onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {err && <Alert severity="error">{err}</Alert>}
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth size="small" label="Başlangıç Tarihi" type="date"
                value={form.baslangicTarihi} onChange={set('baslangicTarihi')}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth size="small" label="Bitiş Tarihi" type="date"
                value={form.bitisTarihi} onChange={set('bitisTarihi')}
                InputLabelProps={{ shrink: true }} required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth size="small" label="Poliçe / Belge No" value={form.policeNo} onChange={set('policeNo')} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth size="small" label="Kurum" value={form.kurum} onChange={set('kurum')} />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth size="small" label="Tutar (₺)" type="number"
                inputProps={{ step: '0.01', min: 0 }}
                value={form.tutar} onChange={set('tutar')}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Notlar" value={form.notlar} onChange={set('notlar')} multiline rows={2} />
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit" disabled={saving}>İptal</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving || !form.bitisTarihi}
        >
          {saving ? 'Kaydediliyor...' : (belge?.id ? 'Güncelle' : 'Ekle')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
