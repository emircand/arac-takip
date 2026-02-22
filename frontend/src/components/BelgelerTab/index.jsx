import { useState, useEffect, useCallback } from 'react'
import {
  Box, Typography, Select, MenuItem, FormControl, InputLabel,
  Grid, Card, CardContent, CardActions, Button, Divider,
  TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  List, ListItem, ListItemText, CircularProgress, Alert,
  IconButton, Tooltip,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import HistoryIcon from '@mui/icons-material/History'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { fetchAraclar } from '../../services/araclar'
import {
  fetchBelgeOzet, fetchBelgeGecmis, createBelge, updateBelge, deleteBelge,
  BELGE_TURLERI,
} from '../../services/aracBelgeler'
import BelgeDurumBadge from '../BelgeDurumBadge'

const EMPTY_FORM = {
  belgeTuru: 'sigorta',
  baslangicTarihi: '',
  bitisTarihi: '',
  policeNo: '',
  kurum: '',
  tutar: '',
  notlar: '',
}

// ─── Belge Form Dialog ────────────────────────────────────────────────────────
function BelgeFormDialog({ open, aracId, initial, onSave, onClose }) {
  const [form, setForm]   = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState(null)

  useEffect(() => {
    if (open) {
      setError(null)
      setForm(
        initial
          ? {
              belgeTuru:       initial.belge_turu ?? initial.belgeTuru ?? 'sigorta',
              baslangicTarihi: initial.baslangic_tarihi ?? initial.baslangicTarihi ?? '',
              bitisTarihi:     initial.bitis_tarihi ?? initial.bitisTarihi ?? '',
              policeNo:        initial.police_no ?? initial.policeNo ?? '',
              kurum:           initial.kurum ?? '',
              tutar:           initial.tutar ?? '',
              notlar:          initial.notlar ?? '',
            }
          : EMPTY_FORM
      )
    }
  }, [open, initial])

  function set(field) {
    return (e) => setForm((p) => ({ ...p, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const payload = {
        arac_id:          aracId,
        belge_turu:       form.belgeTuru,
        baslangic_tarihi: form.baslangicTarihi || null,
        bitis_tarihi:     form.bitisTarihi,
        police_no:        form.policeNo || null,
        kurum:            form.kurum || null,
        tutar:            form.tutar ? Number(form.tutar) : null,
        notlar:           form.notlar || null,
      }
      if (initial?.id) {
        await updateBelge(initial.id, payload)
      } else {
        await createBelge(payload)
      }
      onSave()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {initial?.id ? 'Belge Düzenle' : 'Yeni Belge Ekle'}
        </DialogTitle>

        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <FormControl fullWidth size="small" required>
                <InputLabel>Belge Türü</InputLabel>
                <Select value={form.belgeTuru} label="Belge Türü" onChange={set('belgeTuru')}>
                  {BELGE_TURLERI.map((t) => (
                    <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth size="small" label="Kurum" value={form.kurum} onChange={set('kurum')} placeholder="Sigorta şirketi vb." />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth size="small" label="Başlangıç Tarihi" type="date" value={form.baslangicTarihi} onChange={set('baslangicTarihi')} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth size="small" label="Bitiş Tarihi *" type="date" value={form.bitisTarihi} onChange={set('bitisTarihi')} InputLabelProps={{ shrink: true }} required />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth size="small" label="Poliçe No" value={form.policeNo} onChange={set('policeNo')} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth size="small" label="Tutar (₺)" type="number" inputProps={{ step: '0.01', min: 0 }} value={form.tutar} onChange={set('tutar')} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Notlar" value={form.notlar} onChange={set('notlar')} multiline rows={2} />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} color="inherit">İptal</Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? 'Kaydediliyor...' : (initial?.id ? 'Güncelle' : 'Ekle')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

// ─── Geçmiş Dialog ────────────────────────────────────────────────────────────
function GecmisDialog({ open, aracId, belgeTuru, onClose }) {
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && aracId && belgeTuru) {
      setLoading(true)
      fetchBelgeGecmis(aracId, belgeTuru)
        .then(setItems)
        .finally(() => setLoading(false))
    }
  }, [open, aracId, belgeTuru])

  const turLabel = BELGE_TURLERI.find((t) => t.value === belgeTuru)?.label ?? belgeTuru

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>{turLabel} — Geçmiş</DialogTitle>
      <DialogContent dividers sx={{ p: 0, minHeight: 120 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        ) : items.length === 0 ? (
          <Typography variant="body2" color="text.disabled" sx={{ textAlign: 'center', py: 4 }}>
            Kayıt bulunamadı.
          </Typography>
        ) : (
          <List dense disablePadding>
            {items.map((b, i) => (
              <Box key={b.id}>
                <ListItem sx={{ px: 3, py: 1.5 }}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" fontWeight={600}>
                          {b.bitisTarihi}
                        </Typography>
                        <BelgeDurumBadge durum={b.durum} kalanGun={b.kalanGun} />
                      </Box>
                    }
                    secondary={[
                      b.baslangicTarihi && `Başlangıç: ${b.baslangicTarihi}`,
                      b.kurum,
                      b.policeNo && `Poliçe: ${b.policeNo}`,
                      b.tutar && `₺${Number(b.tutar).toLocaleString('tr-TR')}`,
                    ].filter(Boolean).join(' · ')}
                  />
                </ListItem>
                {i < items.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">Kapat</Button>
      </DialogActions>
    </Dialog>
  )
}

// ─── Özet Kart ────────────────────────────────────────────────────────────────
function BelgeKart({ belge, onEdit, onYeni, onGecmis, onDelete }) {
  const turLabel = BELGE_TURLERI.find((t) => t.value === belge.belgeTuru)?.label ?? belge.belgeTuru

  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="subtitle2" fontWeight={700}>{turLabel}</Typography>
          <BelgeDurumBadge durum={belge.durum} kalanGun={belge.kalanGun} />
        </Box>
        <Typography variant="body2" color="text.secondary">
          Bitiş: <strong>{belge.bitisTarihi}</strong>
        </Typography>
        {belge.kurum && (
          <Typography variant="caption" color="text.disabled" display="block">{belge.kurum}</Typography>
        )}
        {belge.policeNo && (
          <Typography variant="caption" color="text.disabled" display="block">Poliçe: {belge.policeNo}</Typography>
        )}
      </CardContent>
      <CardActions sx={{ px: 2, pb: 1.5, pt: 0, gap: 0.5 }}>
        <Button size="small" startIcon={<AddIcon />} onClick={onYeni} sx={{ textTransform: 'none' }}>
          Yenile
        </Button>
        <Tooltip title="Düzenle">
          <IconButton size="small" onClick={onEdit}><EditIcon fontSize="small" /></IconButton>
        </Tooltip>
        <Tooltip title="Geçmiş">
          <IconButton size="small" onClick={onGecmis}><HistoryIcon fontSize="small" /></IconButton>
        </Tooltip>
        <Tooltip title="Sil">
          <IconButton size="small" color="error" onClick={onDelete}><DeleteIcon fontSize="small" /></IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  )
}

// ─── BelgelerTab (ana bileşen) ────────────────────────────────────────────────
export default function BelgelerTab() {
  const [araclar, setAraclar]       = useState([])
  const [aracId, setAracId]         = useState('')
  const [ozet, setOzet]             = useState([])
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState(null)
  const [formOpen, setFormOpen]     = useState(false)
  const [editingBelge, setEditingBelge] = useState(null)
  const [gecmisOpen, setGecmisOpen] = useState(false)
  const [gecmisTur, setGecmisTur]   = useState(null)

  useEffect(() => {
    fetchAraclar()
      .then(setAraclar)
      .catch((e) => setError(e.message))
  }, [])

  const loadOzet = useCallback(() => {
    if (!aracId) return
    setLoading(true)
    fetchBelgeOzet(aracId)
      .then(setOzet)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [aracId])

  useEffect(() => { setOzet([]); loadOzet() }, [loadOzet])

  async function handleDelete(belge) {
    if (!window.confirm(`"${BELGE_TURLERI.find((t) => t.value === belge.belgeTuru)?.label}" belgesi silinecek. Emin misiniz?`)) return
    try {
      await deleteBelge(belge.id)
      loadOzet()
    } catch (e) {
      setError(e.message)
    }
  }

  function openAdd(belgeTuruDefault) {
    setEditingBelge(belgeTuruDefault ? { belgeTuru: belgeTuruDefault } : null)
    setFormOpen(true)
  }

  function openEdit(belge) {
    setEditingBelge(belge)
    setFormOpen(true)
  }

  function openGecmis(belgeTuru) {
    setGecmisTur(belgeTuru)
    setGecmisOpen(true)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}

      {/* Araç Seçici */}
      <FormControl size="small" sx={{ maxWidth: 320 }}>
        <InputLabel>Araç seçin</InputLabel>
        <Select
          value={aracId}
          label="Araç seçin"
          onChange={(e) => setAracId(e.target.value)}
        >
          <MenuItem value=""><em>— Araç seçin —</em></MenuItem>
          {araclar.filter((a) => a.aktif).map((a) => (
            <MenuItem key={a.id} value={a.id}>
              {a.plaka} <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>({a.tur?.ad})</Typography>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {!aracId ? (
        <Typography variant="body2" color="text.disabled" sx={{ py: 2 }}>
          Belge durumunu görmek için bir araç seçin.
        </Typography>
      ) : loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <>
          {/* Yeni Belge Ekle butonu */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={() => openAdd()} sx={{ textTransform: 'none', borderRadius: 2 }}>
              Yeni Belge Ekle
            </Button>
          </Box>

          {/* Güncel belgeler */}
          {ozet.length === 0 ? (
            <Typography variant="body2" color="text.disabled" sx={{ textAlign: 'center', py: 4 }}>
              Bu araç için henüz belge eklenmemiş.
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {ozet.map((belge) => (
                <Grid item xs={12} sm={6} key={belge.id}>
                  <BelgeKart
                    belge={belge}
                    onEdit={() => openEdit(belge)}
                    onYeni={() => openAdd(belge.belgeTuru)}
                    onGecmis={() => openGecmis(belge.belgeTuru)}
                    onDelete={() => handleDelete(belge)}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {/* Form Dialog */}
      <BelgeFormDialog
        open={formOpen}
        aracId={aracId}
        initial={editingBelge}
        onSave={() => { setFormOpen(false); loadOzet() }}
        onClose={() => setFormOpen(false)}
      />

      {/* Geçmiş Dialog */}
      <GecmisDialog
        open={gecmisOpen}
        aracId={aracId}
        belgeTuru={gecmisTur}
        onClose={() => setGecmisOpen(false)}
      />
    </Box>
  )
}
