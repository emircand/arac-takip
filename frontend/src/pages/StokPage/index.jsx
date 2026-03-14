import { useState } from 'react'
import ExportButton from '../../components/ExportButton'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableBody, TableCell, TableHead, TableRow, Paper,
  Chip, CircularProgress, Alert, MenuItem, Select,
  FormControl, InputLabel, TextField,
} from '@mui/material'
import { Package, Plus, TrendingUp } from 'lucide-react'
import { useStokList, useCreateStok, useUpdateStok, useStokGiris } from '../../hooks/useStok'

const BIRIMLER = ['ADET', 'LİTRE']

const fmtSayi = (n) => (n != null ? Number(n).toLocaleString('tr-TR', { maximumFractionDigits: 2 }) : '—')

const bakiyeColor = (b) => {
  if (b <= 0) return 'error'
  if (b <= 5) return 'warning'
  return 'success'
}

// ─── Stok Form Modal ──────────────────────────────────────────────────────────
function StokFormModal({ open, onClose, initial }) {
  const isEdit = !!initial
  const createMut = useCreateStok()
  const updateMut = useUpdateStok()

  const [form, setForm] = useState(initial ?? {
    stok_adi: '', kodu: '', birim: 'ADET', devir: '0', giris: '0',
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = () => {
    const payload = {
      stok_adi: form.stok_adi,
      kodu:     form.kodu || null,
      birim:    form.birim,
      devir:    parseFloat(form.devir) || 0,
      giris:    parseFloat(form.giris) || 0,
    }
    if (isEdit) {
      updateMut.mutate({ id: initial.id, data: payload }, { onSuccess: onClose })
    } else {
      createMut.mutate(payload, { onSuccess: onClose })
    }
  }

  const mut = isEdit ? updateMut : createMut

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{isEdit ? 'Stok Düzenle' : 'Yeni Stok Kalemi'}</DialogTitle>
      <DialogContent className="space-y-4 pt-2">
        {mut.isError && <Alert severity="error">{mut.error?.message}</Alert>}
        <TextField label="Stok Adı" required fullWidth size="small"
          value={form.stok_adi} onChange={e => set('stok_adi', e.target.value)} />
        <TextField label="Stok Kodu" fullWidth size="small"
          value={form.kodu} onChange={e => set('kodu', e.target.value)} />
        <FormControl fullWidth size="small">
          <InputLabel>Birim</InputLabel>
          <Select value={form.birim} label="Birim" onChange={e => set('birim', e.target.value)}>
            {BIRIMLER.map(b => <MenuItem key={b} value={b}>{b}</MenuItem>)}
          </Select>
        </FormControl>
        <TextField label="Devir (Açılış Bakiyesi)" fullWidth size="small" type="number"
          value={form.devir} onChange={e => set('devir', e.target.value)} />
        <TextField label="Giriş" fullWidth size="small" type="number"
          value={form.giris} onChange={e => set('giris', e.target.value)} />
      </DialogContent>
      <DialogActions>
        <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">İptal</button>
        <button
          onClick={handleSave}
          disabled={!form.stok_adi || mut.isPending}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
        >
          {mut.isPending && <CircularProgress size={14} sx={{ color: 'white' }} />}
          {isEdit ? 'Kaydet' : 'Ekle'}
        </button>
      </DialogActions>
    </Dialog>
  )
}

// ─── Stok Giriş Modal ─────────────────────────────────────────────────────────
function GirisModal({ open, onClose, kalem }) {
  const girusMut = useStokGiris()
  const [form, setForm] = useState({ miktar: '', aciklama: '' })

  const handleSave = () => {
    girusMut.mutate(
      { id: kalem.id, data: { miktar: parseFloat(form.miktar), aciklama: form.aciklama || null } },
      { onSuccess: onClose }
    )
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Stok Girişi — {kalem?.stok_adi}</DialogTitle>
      <DialogContent className="space-y-4 pt-2">
        {girusMut.isError && <Alert severity="error">{girusMut.error?.message}</Alert>}
        <TextField label={`Miktar (${kalem?.birim})`} required fullWidth size="small" type="number"
          value={form.miktar} onChange={e => setForm(f => ({ ...f, miktar: e.target.value }))} />
        <TextField label="Açıklama" fullWidth size="small"
          value={form.aciklama} onChange={e => setForm(f => ({ ...f, aciklama: e.target.value }))} />
      </DialogContent>
      <DialogActions>
        <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600">İptal</button>
        <button
          onClick={handleSave}
          disabled={!form.miktar || parseFloat(form.miktar) <= 0 || girusMut.isPending}
          className="px-5 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
        >
          {girusMut.isPending && <CircularProgress size={14} sx={{ color: 'white' }} />}
          Giriş Yap
        </button>
      </DialogActions>
    </Dialog>
  )
}

// ─── Ana Sayfa ────────────────────────────────────────────────────────────────
export default function StokPage() {
  const [ara, setAra] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [girisItem, setGirisItem] = useState(null)

  const { data: stoklar, isLoading, error } = useStokList(ara || undefined)

  const handleEdit = (k) => {
    setEditItem({
      id: k.id, stok_adi: k.stok_adi, kodu: k.kodu ?? '', birim: k.birim,
      devir: String(k.devir), giris: String(k.giris),
    })
    setFormOpen(true)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Package size={28} className="text-blue-600" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">Stok Yönetimi</h1>
            <p className="text-sm text-gray-500">Parça ve malzeme envanteri</p>
          </div>
        </div>
        <ExportButton rapor="stok" label="Dışa Aktar" />
      </div>

      {/* Arama + Yeni */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-wrap gap-3 items-end">
        <TextField
          label="Stok Adı Ara" size="small" sx={{ minWidth: 250 }}
          value={ara} onChange={e => setAra(e.target.value)}
        />
        <div className="ml-auto">
          <button
            onClick={() => { setEditItem(null); setFormOpen(true) }}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <Plus size={16} /> Yeni Kalem
          </button>
        </div>
      </div>

      {/* Tablo */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {isLoading && <div className="flex justify-center py-12"><CircularProgress /></div>}
        {error && <Alert severity="error" className="m-4">{error.message}</Alert>}
        {!isLoading && !error && (!stoklar || stoklar.length === 0) && (
          <p className="text-center text-gray-400 py-12">Stok kalemi bulunamadı.</p>
        )}
        {!isLoading && stoklar?.length > 0 && (
          <div className="overflow-x-auto">
            <Table>
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell><b>Stok Adı</b></TableCell>
                  <TableCell><b>Kod</b></TableCell>
                  <TableCell><b>Birim</b></TableCell>
                  <TableCell align="right"><b>Devir</b></TableCell>
                  <TableCell align="right"><b>Giriş</b></TableCell>
                  <TableCell align="right"><b>Çıkış</b></TableCell>
                  <TableCell align="right"><b>Bakiye</b></TableCell>
                  <TableCell align="right"><b>İşlem</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stoklar.map(k => (
                  <TableRow key={k.id} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{k.stok_adi}</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>{k.kodu ?? '—'}</TableCell>
                    <TableCell>{k.birim}</TableCell>
                    <TableCell align="right">{fmtSayi(k.devir)}</TableCell>
                    <TableCell align="right">{fmtSayi(k.giris)}</TableCell>
                    <TableCell align="right">{fmtSayi(k.cikis)}</TableCell>
                    <TableCell align="right">
                      <Chip
                        label={fmtSayi(k.bakiye)}
                        color={bakiyeColor(k.bakiye)}
                        size="small" variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <div className="flex gap-1 justify-end">
                        <button
                          onClick={() => setGirisItem(k)}
                          className="flex items-center gap-1 px-3 py-1 text-xs bg-green-50 hover:bg-green-100 text-green-700 rounded-lg font-medium transition-colors"
                        >
                          <TrendingUp size={12} /> Giriş
                        </button>
                        <button
                          onClick={() => handleEdit(k)}
                          className="px-3 py-1 text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg font-medium transition-colors"
                        >
                          Düzenle
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {formOpen && (
        <StokFormModal
          open={formOpen}
          onClose={() => { setFormOpen(false); setEditItem(null) }}
          initial={editItem}
        />
      )}
      {girisItem && (
        <GirisModal
          open={!!girisItem}
          onClose={() => setGirisItem(null)}
          kalem={girisItem}
        />
      )}
    </div>
  )
}
