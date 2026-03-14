import { useState } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableBody, TableCell, TableHead, TableRow, Paper,
  Chip, CircularProgress, Alert, MenuItem, Select,
  FormControl, InputLabel, TextField, Checkbox, FormControlLabel,
  Autocomplete,
} from '@mui/material'
import { Wrench, Plus, X, ChevronRight, CheckCircle, AlertTriangle } from 'lucide-react'
import {
  useArizalar, useCreateAriza, useUpdateAriza, useDeleteAriza,
  useChangeArizaDurum, useTamamlaAriza, useArizaDetay,
  useAddArizaParca, useDeleteArizaParca,
} from '../../hooks/useArizalar'
import { useAraclar } from '../../hooks/useAraclar'
import { useSoforler } from '../../hooks/useSoforler'
import { useStokList } from '../../hooks/useStok'

// ─── Sabitler ────────────────────────────────────────────────────────────────
const DURUM_CONFIG = {
  acik:       { label: 'Açık',       color: 'primary' },
  devam:      { label: 'Devam',      color: 'warning' },
  tamamlandi: { label: 'Tamamlandı', color: 'success' },
  iptal:      { label: 'İptal',      color: 'default' },
}

const ISLEM_YAPAN = ['KADEME', 'SANAYİ', 'SERVİS', 'DEMİRALAY', 'AZİMLER OTO', 'CAN OTO', 'TEKMAR']

const TAMAMLANMA_NOTU = [
  'TAMİR EDİLDİ',
  'DEĞİŞİM YAPILDI',
  'BAKIM YAPILDI',
  'KONTROL EDİLDİ',
]

const BIRIMLER = ['ADET', 'LİTRE']

// ─── Yardımcılar ─────────────────────────────────────────────────────────────
function DurumBadge({ durum }) {
  const cfg = DURUM_CONFIG[durum] ?? { label: durum, color: 'default' }
  return <Chip label={cfg.label} color={cfg.color} size="small" />
}

const fmtDt = (s) =>
  s ? new Date(s).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' }) : '-'

// ISO string → datetime-local value (yerel saat)
const toLocalInput = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// datetime-local value → ISO string (UTC)
const fromLocalInput = (val) => val ? new Date(val).toISOString() : null

// ─── Arıza Form Modal ─────────────────────────────────────────────────────────
function ArizaFormModal({ open, onClose, araclar, soforler, initial }) {
  const isEdit = !!initial
  const createMut = useCreateAriza()
  const updateMut = useUpdateAriza()

  const [form, setForm] = useState(initial ?? {
    arac_id: '', sofor_id: '', baslik: '', aciklama: '',
    calisalamaz: false, bildirim_zamani: '', islem_yapan: '',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = () => {
    const payload = {
      arac_id:         form.arac_id || null,
      sofor_id:        form.sofor_id || null,
      baslik:          form.baslik,
      aciklama:        form.aciklama || null,
      calisalamaz:     form.calisalamaz,
      bildirim_zamani: form.calisalamaz ? fromLocalInput(form.bildirim_zamani) : null,
      islem_yapan:     form.islem_yapan || null,
    }
    if (isEdit) {
      updateMut.mutate({ id: initial.id, data: payload }, { onSuccess: onClose })
    } else {
      createMut.mutate(payload, { onSuccess: onClose })
    }
  }

  const mut = isEdit ? updateMut : createMut

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Arıza Düzenle' : 'Yeni Arıza'}</DialogTitle>
      <DialogContent className="space-y-4 pt-2">
        {mut.isError && <Alert severity="error">{mut.error?.message}</Alert>}

        <FormControl fullWidth size="small" required>
          <InputLabel>Araç</InputLabel>
          <Select value={form.arac_id} label="Araç" onChange={e => set('arac_id', e.target.value)}>
            {araclar?.map(a => (
              <MenuItem key={a.id} value={a.id}>{a.plaka}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small">
          <InputLabel>Şoför (isteğe bağlı)</InputLabel>
          <Select value={form.sofor_id} label="Şoför (isteğe bağlı)" onChange={e => set('sofor_id', e.target.value)}>
            <MenuItem value="">— Yok —</MenuItem>
            {soforler?.map(s => (
              <MenuItem key={s.id} value={s.id}>{s.ad_soyad}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Başlık" required fullWidth size="small"
          value={form.baslik} onChange={e => set('baslik', e.target.value)}
        />

        <TextField
          label="Açıklama" fullWidth size="small" multiline rows={2}
          value={form.aciklama} onChange={e => set('aciklama', e.target.value)}
        />

        <FormControl fullWidth size="small">
          <InputLabel>İşlemi Yapan</InputLabel>
          <Select value={form.islem_yapan} label="İşlemi Yapan" onChange={e => set('islem_yapan', e.target.value)}>
            <MenuItem value="">— Seç —</MenuItem>
            {ISLEM_YAPAN.map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
          </Select>
        </FormControl>

        {/* Çalışamaz bildirimi */}
        <div className="border border-orange-200 rounded-xl p-3 bg-orange-50 space-y-3">
          <FormControlLabel
            control={
              <Checkbox
                checked={form.calisalamaz}
                onChange={e => set('calisalamaz', e.target.checked)}
                color="warning"
              />
            }
            label={
              <span className="flex items-center gap-2 font-medium text-orange-800">
                <AlertTriangle size={16} /> Araç çalışamaz durumda
              </span>
            }
          />
          {form.calisalamaz && (
            <TextField
              label="Bildirim saati" type="datetime-local" size="small" fullWidth required
              value={form.bildirim_zamani}
              onChange={e => set('bildirim_zamani', e.target.value)}
              InputLabelProps={{ shrink: true }}
              helperText="Aracın çalışamaz duruma düştüğü saat:dakika"
            />
          )}
        </div>
      </DialogContent>
      <DialogActions>
        <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">İptal</button>
        <button
          onClick={handleSave}
          disabled={!form.arac_id || !form.baslik || (form.calisalamaz && !form.bildirim_zamani) || mut.isPending}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
        >
          {mut.isPending && <CircularProgress size={14} sx={{ color: 'white' }} />}
          {isEdit ? 'Kaydet' : 'Oluştur'}
        </button>
      </DialogActions>
    </Dialog>
  )
}

// ─── Arıza Detay Dialog ───────────────────────────────────────────────────────
function ArizaDetayDialog({ id, onClose }) {
  const { data, isLoading, error } = useArizaDetay(id)
  const { data: stokList } = useStokList()
  const addParcaMut = useAddArizaParca()
  const deleteParcaMut = useDeleteArizaParca()
  const changeDurumMut = useChangeArizaDurum()
  const tamamlaMut = useTamamlaAriza()

  const [yeniParca, setYeniParca] = useState({ parca_adi: '', miktar: '1', birim: 'ADET', stok_id: null })
  const [durumForm, setDurumForm] = useState({ durum: '', aciklama: '', tamamlanma_notu: '', islem_yapan: '' })

  if (isLoading) return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth>
      <DialogContent className="flex justify-center py-8"><CircularProgress /></DialogContent>
    </Dialog>
  )
  if (error || !data) return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth>
      <DialogContent><Alert severity="error">{error?.message ?? 'Yüklenemedi'}</Alert></DialogContent>
    </Dialog>
  )

  const handleAddParca = () => {
    if (!yeniParca.parca_adi && !yeniParca.stok_id) return
    addParcaMut.mutate(
      {
        arizaId: id,
        data: {
          parca_adi:  yeniParca.parca_adi || null,
          miktar:     parseFloat(yeniParca.miktar) || 1,
          birim:      yeniParca.birim,
          stok_id:    yeniParca.stok_id || null,
        },
      },
      { onSuccess: () => setYeniParca({ parca_adi: '', miktar: '1', birim: 'ADET', stok_id: null }) }
    )
  }

  const handleChangeDurum = () => {
    if (!durumForm.durum) return
    changeDurumMut.mutate(
      { id, data: { durum: durumForm.durum, aciklama: durumForm.aciklama || null,
                    tamamlanma_notu: durumForm.tamamlanma_notu || null,
                    islem_yapan: durumForm.islem_yapan || null } },
      { onSuccess: () => setDurumForm({ durum: '', aciklama: '', tamamlanma_notu: '', islem_yapan: '' }) }
    )
  }

  const bitti = data.durum === 'tamamlandi' || data.durum === 'iptal'
  const stokOptions = stokList ?? []

  return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono font-bold text-blue-700">{data.plaka}</span>
          <span className="text-gray-400">–</span>
          <span className="font-semibold">{data.baslik}</span>
          <DurumBadge durum={data.durum} />
          {data.calisalamaz && (
            <Chip
              icon={<AlertTriangle size={13} />}
              label={`Çalışamaz — ${fmtDt(data.bildirim_zamani)}`}
              color="error" size="small" variant="outlined"
            />
          )}
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
      </DialogTitle>

      <DialogContent className="space-y-6">
        {/* Meta bilgiler */}
        <div className="grid grid-cols-2 gap-2 text-sm bg-gray-50 rounded-xl p-3">
          {data.sofor_ad && <div><span className="text-gray-400">Şoför:</span> {data.sofor_ad}</div>}
          {data.islem_yapan && <div><span className="text-gray-400">İşlemi Yapan:</span> {data.islem_yapan}</div>}
          {data.tamamlanma_notu && <div><span className="text-gray-400">Sonuç:</span> {data.tamamlanma_notu}</div>}
          {data.aciklama && <div className="col-span-2"><span className="text-gray-400">Açıklama:</span> {data.aciklama}</div>}
        </div>

        {/* ── Parçalar ─────────────────────────────── */}
        <div>
          <h3 className="font-semibold text-gray-700 mb-2">Kullanılan Parçalar / Malzemeler</h3>
          {data.parcalar.length === 0
            ? <p className="text-sm text-gray-400">Henüz parça eklenmedi.</p>
            : (
              <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', mb: 2 }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: 'grey.50' }}>
                    <TableRow>
                      <TableCell><b>Parça / Stok</b></TableCell>
                      <TableCell align="right"><b>Miktar</b></TableCell>
                      <TableCell><b>Birim</b></TableCell>
                      <TableCell><b>Durum</b></TableCell>
                      <TableCell />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.parcalar.map(p => (
                      <TableRow key={p.id} hover>
                        <TableCell>
                          <div>
                            <div className="font-medium">{p.parca_adi}</div>
                            {p.stok_adi && p.stok_adi !== p.parca_adi && (
                              <div className="text-xs text-gray-400">{p.stok_adi}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell align="right">{p.miktar}</TableCell>
                        <TableCell>{p.birim}</TableCell>
                        <TableCell>
                          {p.kullanildi
                            ? <Chip label="Kullanıldı" color="success" size="small" />
                            : <Chip label="Bekliyor" color="default" size="small" />}
                        </TableCell>
                        <TableCell align="right">
                          {!p.kullanildi && (
                            <button
                              onClick={() => deleteParcaMut.mutate({ arizaId: id, parcaId: p.id })}
                              disabled={deleteParcaMut.isPending}
                              className="text-red-400 hover:text-red-600 text-xs"
                            >Sil</button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            )
          }

          {!bitti && (
            <div className="space-y-2">
              <div className="flex gap-2 items-end flex-wrap">
                {/* Stok autocomplete */}
                <Autocomplete
                  options={stokOptions}
                  getOptionLabel={o => o.stok_adi}
                  size="small"
                  sx={{ minWidth: 220 }}
                  onChange={(_, val) => {
                    setYeniParca(f => ({
                      ...f,
                      stok_id:   val?.id ?? null,
                      parca_adi: val?.stok_adi ?? f.parca_adi,
                      birim:     val?.birim ?? f.birim,
                    }))
                  }}
                  renderInput={(params) => <TextField {...params} label="Stoktan seç" />}
                />
                <TextField
                  label="veya Parça Adı" size="small" sx={{ minWidth: 160 }}
                  value={yeniParca.parca_adi}
                  onChange={e => setYeniParca(f => ({ ...f, parca_adi: e.target.value }))}
                />
                <TextField
                  label="Miktar" size="small" sx={{ width: 80 }} type="number"
                  value={yeniParca.miktar}
                  onChange={e => setYeniParca(f => ({ ...f, miktar: e.target.value }))}
                />
                <FormControl size="small" sx={{ width: 90 }}>
                  <InputLabel>Birim</InputLabel>
                  <Select value={yeniParca.birim} label="Birim"
                    onChange={e => setYeniParca(f => ({ ...f, birim: e.target.value }))}>
                    {BIRIMLER.map(b => <MenuItem key={b} value={b}>{b}</MenuItem>)}
                  </Select>
                </FormControl>
                <button
                  onClick={handleAddParca}
                  disabled={(!yeniParca.parca_adi && !yeniParca.stok_id) || addParcaMut.isPending}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-900 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1"
                >
                  <Plus size={14} /> Ekle
                </button>
              </div>
              {addParcaMut.isError && <Alert severity="error">{addParcaMut.error?.message}</Alert>}
            </div>
          )}
        </div>

        {/* ── Durum Geçmişi ─────────────────────────── */}
        <div>
          <h3 className="font-semibold text-gray-700 mb-2">Durum Geçmişi</h3>
          <div className="space-y-2">
            {data.hareketler.map(h => (
              <div key={h.id} className="flex items-start gap-3 text-sm">
                <div className="flex items-center gap-1 shrink-0 mt-0.5">
                  {h.eski_durum && <DurumBadge durum={h.eski_durum} />}
                  {h.eski_durum && <ChevronRight size={14} className="text-gray-400" />}
                  <DurumBadge durum={h.yeni_durum} />
                </div>
                <div className="flex-1">
                  {h.aciklama && <p className="text-gray-600">{h.aciklama}</p>}
                  <p className="text-xs text-gray-400">{fmtDt(h.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Durum Değiştir ──────────────────────────── */}
        {!bitti && (
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <h3 className="font-semibold text-gray-700">Durum Değiştir</h3>
            <div className="flex gap-2 items-end flex-wrap">
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Yeni Durum</InputLabel>
                <Select value={durumForm.durum} label="Yeni Durum"
                  onChange={e => setDurumForm(f => ({ ...f, durum: e.target.value }))}>
                  {Object.entries(DURUM_CONFIG)
                    .filter(([k]) => k !== data.durum)
                    .map(([k, v]) => <MenuItem key={k} value={k}>{v.label}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Tamamlanma Notu</InputLabel>
                <Select value={durumForm.tamamlanma_notu} label="Tamamlanma Notu"
                  onChange={e => setDurumForm(f => ({ ...f, tamamlanma_notu: e.target.value }))}>
                  <MenuItem value="">— Seç —</MenuItem>
                  {TAMAMLANMA_NOTU.map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 130 }}>
                <InputLabel>İşlemi Yapan</InputLabel>
                <Select value={durumForm.islem_yapan} label="İşlemi Yapan"
                  onChange={e => setDurumForm(f => ({ ...f, islem_yapan: e.target.value }))}>
                  <MenuItem value="">— Seç —</MenuItem>
                  {ISLEM_YAPAN.map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField
                label="Not" size="small" className="flex-1"
                value={durumForm.aciklama}
                onChange={e => setDurumForm(f => ({ ...f, aciklama: e.target.value }))}
              />
              <button
                onClick={handleChangeDurum}
                disabled={!durumForm.durum || changeDurumMut.isPending}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Güncelle
              </button>
            </div>
            {changeDurumMut.isError && <Alert severity="error">{changeDurumMut.error?.message}</Alert>}
          </div>
        )}
      </DialogContent>

      <DialogActions className="px-6 pb-4">
        <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Kapat</button>
        {!bitti && (
          <button
            onClick={() => tamamlaMut.mutate(id)}
            disabled={tamamlaMut.isPending}
            className="px-5 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
          >
            {tamamlaMut.isPending ? <CircularProgress size={14} sx={{ color: 'white' }} /> : <CheckCircle size={14} />}
            Tamamla
          </button>
        )}
      </DialogActions>
    </Dialog>
  )
}

// ─── Ana Sayfa ────────────────────────────────────────────────────────────────
export default function ArizalarPage() {
  const [aramaPlaka, setAramaPlaka] = useState('')
  const [durumFilter, setDurumFilter] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [detayId, setDetayId] = useState(null)

  const { data: araclar } = useAraclar()
  const { data: soforler } = useSoforler()
  const { data: arizalar, isLoading, error } = useArizalar(null, durumFilter || null)
  const deleteMut = useDeleteAriza()
  const tamamlaMut = useTamamlaAriza()
  const changeDurumMut = useChangeArizaDurum()

  const filtered = (arizalar ?? []).filter(a =>
    !aramaPlaka || a.plaka?.toLowerCase().includes(aramaPlaka.toLowerCase())
  )

  const handleEdit = (a) => {
    setEditItem({
      id:              a.id,
      arac_id:         a.arac_id,
      sofor_id:        a.sofor_id ?? '',
      baslik:          a.baslik,
      aciklama:        a.aciklama ?? '',
      calisalamaz:     a.calisalamaz ?? false,
      bildirim_zamani: toLocalInput(a.bildirim_zamani),
      islem_yapan:     a.islem_yapan ?? '',
    })
    setFormOpen(true)
  }

  const handleDelete = (id) => {
    if (!window.confirm('Bu arızayı silmek istediğinizden emin misiniz?')) return
    deleteMut.mutate(id)
  }

  const handleIptal = (id) => {
    if (!window.confirm('Bu arızayı iptal etmek istediğinizden emin misiniz?')) return
    changeDurumMut.mutate({ id, data: { durum: 'iptal', aciklama: 'İptal edildi' } })
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Wrench size={28} className="text-blue-600" />
        <div>
          <h1 className="text-xl font-bold text-gray-900">Arızalar</h1>
          <p className="text-sm text-gray-500">Araç arıza ve bakım takip sistemi</p>
        </div>
      </div>

      {/* Filtreler */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-wrap gap-3 items-end">
        <TextField
          label="Plaka Ara" size="small" sx={{ minWidth: 160 }}
          value={aramaPlaka} onChange={e => setAramaPlaka(e.target.value)}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Durum</InputLabel>
          <Select value={durumFilter} label="Durum" onChange={e => setDurumFilter(e.target.value)}>
            <MenuItem value="">Tümü</MenuItem>
            {Object.entries(DURUM_CONFIG).map(([k, v]) => (
              <MenuItem key={k} value={k}>{v.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <div className="ml-auto">
          <button
            onClick={() => { setEditItem(null); setFormOpen(true) }}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <Plus size={16} /> Yeni Arıza
          </button>
        </div>
      </div>

      {/* Liste */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {isLoading && <div className="flex justify-center py-12"><CircularProgress /></div>}
        {error && <Alert severity="error" className="m-4">{error.message}</Alert>}
        {!isLoading && !error && filtered.length === 0 && (
          <p className="text-center text-gray-400 py-12">Arıza kaydı bulunamadı.</p>
        )}
        {!isLoading && filtered.length > 0 && (
          <div className="overflow-x-auto">
            <Table>
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell><b>Plaka</b></TableCell>
                  <TableCell><b>Başlık</b></TableCell>
                  <TableCell><b>Durum</b></TableCell>
                  <TableCell><b>Bildirim</b></TableCell>
                  <TableCell><b>İşlemi Yapan</b></TableCell>
                  <TableCell><b>Tarih</b></TableCell>
                  <TableCell align="right"><b>İşlemler</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map(a => (
                  <TableRow key={a.id} hover sx={a.calisalamaz ? { bgcolor: 'error.50' } : undefined}>
                    <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                      <div className="flex items-center gap-1">
                        {a.calisalamaz && <AlertTriangle size={14} className="text-red-500 shrink-0" />}
                        {a.plaka}
                      </div>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {a.baslik}
                    </TableCell>
                    <TableCell><DurumBadge durum={a.durum} /></TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', fontSize: 12 }}>
                      {a.calisalamaz ? fmtDt(a.bildirim_zamani) : '—'}
                    </TableCell>
                    <TableCell>{a.islem_yapan ?? '—'}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', fontSize: 12 }}>{fmtDt(a.created_at)}</TableCell>
                    <TableCell align="right">
                      <div className="flex gap-1 justify-end flex-wrap">
                        <button
                          onClick={() => setDetayId(a.id)}
                          className="px-3 py-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium transition-colors"
                        >Detay</button>
                        {(a.durum === 'acik' || a.durum === 'devam') && (
                          <button
                            onClick={() => tamamlaMut.mutate(a.id)}
                            disabled={tamamlaMut.isPending}
                            className="px-3 py-1 text-xs bg-green-50 hover:bg-green-100 text-green-700 rounded-lg font-medium transition-colors disabled:opacity-50"
                          >Tamamla</button>
                        )}
                        {a.durum === 'acik' && (
                          <>
                            <button
                              onClick={() => handleEdit(a)}
                              className="px-3 py-1 text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg font-medium transition-colors"
                            >Düzenle</button>
                            <button
                              onClick={() => handleIptal(a.id)}
                              disabled={changeDurumMut.isPending}
                              className="px-3 py-1 text-xs bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg font-medium transition-colors"
                            >İptal</button>
                            <button
                              onClick={() => handleDelete(a.id)}
                              disabled={deleteMut.isPending}
                              className="px-3 py-1 text-xs bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-medium transition-colors"
                            >Sil</button>
                          </>
                        )}
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
        <ArizaFormModal
          open={formOpen}
          onClose={() => { setFormOpen(false); setEditItem(null) }}
          araclar={araclar}
          soforler={soforler}
          initial={editItem}
        />
      )}
      {detayId && <ArizaDetayDialog id={detayId} onClose={() => setDetayId(null)} />}
    </div>
  )
}

