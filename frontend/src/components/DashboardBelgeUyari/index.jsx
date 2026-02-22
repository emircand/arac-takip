import { useState, useEffect, useCallback } from 'react'
import {
  fetchDashboardSayim, fetchYaklasanBelgeler, BELGE_TURLERI,
} from '../../services/aracBelgeler'
import { fetchLokasyonAgac } from '../../services/lokasyon'
import BelgeDurumBadge from '../BelgeDurumBadge'
import {
  Paper, Box, Typography, Chip, Collapse, Divider,
  FormControl, InputLabel, Select, MenuItem,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
  CircularProgress,
} from '@mui/material'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'

const SIRALAMA = [
  { value: 'bitis_tarihi_asc', label: 'Tarihe Göre' },
  { value: 'belge_turu',       label: 'Belge Türüne Göre' },
  { value: 'bolge',            label: 'Bölgeye Göre' },
]

export default function DashboardBelgeUyari() {
  const [acik, setAcik] = useState(false)
  const [sayim, setSayim] = useState(null)
  const [agac, setAgac] = useState([])
  const [belgeler, setBelgeler] = useState([])
  const [loading, setLoading] = useState(false)

  const [belgeTuru, setBelgeTuru] = useState('')
  const [bolgeId, setBolgeId] = useState('')
  const [subeId, setSubeId] = useState('')
  const [siralama, setSiralama] = useState('bitis_tarihi_asc')

  useEffect(() => {
    fetchDashboardSayim().then(setSayim).catch(() => {})
    fetchLokasyonAgac().then(setAgac).catch(() => {})
  }, [])

  const load = useCallback(() => {
    setLoading(true)
    fetchYaklasanBelgeler({
      gun: 60,
      belgeTuru: belgeTuru || undefined,
      bolgeId: bolgeId || undefined,
      subeId: subeId || undefined,
      siralama,
    })
      .then(setBelgeler)
      .catch(() => setBelgeler([]))
      .finally(() => setLoading(false))
  }, [belgeTuru, bolgeId, subeId, siralama])

  useEffect(() => {
    if (acik) load()
  }, [acik, load])

  const handleBolgeChange = (id) => {
    setBolgeId(id)
    setSubeId('')
  }

  const allBolgeler = agac.flatMap(d => d.bolgeler ?? [])
  const subeler = bolgeId
    ? allBolgeler.find(b => b.id === Number(bolgeId))?.subeler ?? []
    : []

  const turSayim = BELGE_TURLERI.map(t => ({
    ...t,
    sayi: belgeler.filter(b => b.belge_turu === t.value).length,
  }))

  return (
    <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
      {/* Header */}
      <Box
        onClick={() => setAcik(v => !v)}
        sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', userSelect: 'none', '&:hover': { bgcolor: 'action.hover' } }}
      >
        <WarningAmberIcon color="warning" />
        <Typography variant="subtitle1" fontWeight={700} sx={{ flex: 1 }}>
          Belge Uyarıları
        </Typography>
        {sayim && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {sayim.critical > 0 && (
              <Chip label={`${sayim.critical} Kritik`} color="error" size="small" sx={{ fontWeight: 700 }} />
            )}
            {sayim.warning > 0 && (
              <Chip label={`${sayim.warning} Uyarı`} color="warning" size="small" sx={{ fontWeight: 700 }} />
            )}
            {sayim.expired > 0 && (
              <Chip label={`${sayim.expired} Süresi Dolmuş`} color="default" size="small" sx={{ fontWeight: 700 }} />
            )}
            {sayim.critical === 0 && sayim.warning === 0 && sayim.expired === 0 && (
              <Chip label="Tümü Geçerli" color="success" size="small" sx={{ fontWeight: 700 }} />
            )}
          </Box>
        )}
        {acik ? <KeyboardArrowUpIcon fontSize="small" color="action" /> : <KeyboardArrowDownIcon fontSize="small" color="action" />}
      </Box>

      <Collapse in={acik}>
        <Divider />

        {/* Filters */}
        <Box sx={{ px: 3, py: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', bgcolor: 'grey.50' }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Tür</InputLabel>
            <Select value={belgeTuru} label="Tür" onChange={e => setBelgeTuru(e.target.value)}>
              <MenuItem value="">Tümü</MenuItem>
              {BELGE_TURLERI.map(t => (
                <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Bölge</InputLabel>
            <Select value={bolgeId} label="Bölge" onChange={e => handleBolgeChange(e.target.value)}>
              <MenuItem value="">Tümü</MenuItem>
              {allBolgeler.map(b => (
                <MenuItem key={b.id} value={b.id}>{b.ad}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }} disabled={!bolgeId}>
            <InputLabel>Şube</InputLabel>
            <Select value={subeId} label="Şube" onChange={e => setSubeId(e.target.value)}>
              <MenuItem value="">Tümü</MenuItem>
              {subeler.map(s => (
                <MenuItem key={s.id} value={s.id}>{s.ad}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 170 }}>
            <InputLabel>Sıralama</InputLabel>
            <Select value={siralama} label="Sıralama" onChange={e => setSiralama(e.target.value)}>
              {SIRALAMA.map(s => (
                <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Divider />

        {/* Table */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        ) : belgeler.length === 0 ? (
          <Typography variant="body2" color="text.disabled" sx={{ textAlign: 'center', py: 4 }}>
            60 gün içinde dolacak belge yok.
          </Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Plaka</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Tür</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Bitiş Tarihi</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Durum</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Bölge</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Şube</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Firma</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {belgeler.map(b => {
                  const turLabel = BELGE_TURLERI.find(t => t.value === b.belge_turu)?.label ?? b.belge_turu
                  return (
                    <TableRow key={b.belge_id} hover>
                      <TableCell>
                        <Typography
                          variant="caption"
                          sx={{ fontFamily: 'monospace', fontWeight: 'bold', color: 'primary.dark', bgcolor: '#eff6ff', px: 1, py: 0.5, borderRadius: 1 }}
                        >
                          {b.arac_plaka}
                        </Typography>
                      </TableCell>
                      <TableCell>{turLabel}</TableCell>
                      <TableCell>{b.bitis_tarihi}</TableCell>
                      <TableCell>
                        <BelgeDurumBadge durum={b.durum} kalanGun={b.kalan_gun} />
                      </TableCell>
                      <TableCell>{b.bolge ?? '—'}</TableCell>
                      <TableCell>{b.sube ?? '—'}</TableCell>
                      <TableCell>{b.firma ?? '—'}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Footer özet sayaç */}
        {belgeler.length > 0 && (
          <>
            <Divider />
            <Box sx={{ px: 3, py: 1.5, display: 'flex', gap: 2, flexWrap: 'wrap', bgcolor: 'grey.50', alignItems: 'center' }}>
              {turSayim.filter(t => t.sayi > 0).map(t => (
                <Typography key={t.value} variant="caption" color="text.secondary">
                  {t.label}: <strong>{t.sayi}</strong>
                </Typography>
              ))}
              <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                Toplam: <strong>{belgeler.length}</strong>
              </Typography>
            </Box>
          </>
        )}
      </Collapse>
    </Paper>
  )
}
