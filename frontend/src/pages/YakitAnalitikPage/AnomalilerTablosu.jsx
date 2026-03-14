import {
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
  Chip, CircularProgress, Typography, Box,
  FormControl, InputLabel, Select, MenuItem, TextField,
} from '@mui/material'
import { useYakitAnomaliler } from '../../hooks/useYakitAnalitik'
import { useState } from 'react'

const TIPLER = [
  { value: 'hayalet_yakit',  label: 'Hayalet Yakıt',   color: 'error' },
  { value: 'hizli_dolum',    label: 'Hızlı Dolum',     color: 'warning' },
  { value: 'mesai_disi',     label: 'Mesai Dışı',      color: 'info' },
  { value: 'guzergah_disi',  label: 'Güzergah Dışı',   color: 'secondary' },
]

const GUN_SECENEK = [30, 60, 90, 180, 365]

function tipChip(tipi) {
  const t = TIPLER.find(x => x.value === tipi)
  if (!t) return <Chip label={tipi} size="small" />
  return <Chip label={t.label} color={t.color} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
}

export default function AnomalilerTablosu() {
  const [gun, setGun]   = useState(90)
  const [tip, setTip]   = useState('')
  const [ara, setAra]   = useState('')

  const { data: anomaliler, isLoading } = useYakitAnomaliler(gun)

  const filtered = (anomaliler ?? [])
    .filter(r => !tip || r.anomali_tipi === tip)
    .filter(r => !ara || r.plaka?.includes(ara.toUpperCase().trim()))

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Filtreler */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Son</InputLabel>
          <Select value={gun} label="Son" onChange={e => setGun(e.target.value)}>
            {GUN_SECENEK.map(g => (
              <MenuItem key={g} value={g}>{g} Gün</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Anomali Tipi</InputLabel>
          <Select value={tip} label="Anomali Tipi" onChange={e => setTip(e.target.value)}>
            <MenuItem value="">Tümü</MenuItem>
            {TIPLER.map(t => (
              <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField label="Plaka" size="small" sx={{ minWidth: 130 }}
          value={ara} onChange={e => setAra(e.target.value)} />
        <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
          {filtered.length} kayıt
        </Typography>
      </Box>

      {/* Tablo */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : filtered.length === 0 ? (
        <Typography variant="body2" color="text.disabled" sx={{ textAlign: 'center', py: 4 }}>
          Anomali kaydı bulunamadı.
        </Typography>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Tarih</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Plaka</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Tip</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Miktar (lt)</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>İstasyon</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>İl</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map(r => (
                <TableRow key={r.yakit_id} hover>
                  <TableCell sx={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                    {r.tarih ? new Date(r.tarih).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption"
                      sx={{ fontFamily: 'monospace', fontWeight: 'bold', color: 'primary.dark',
                            bgcolor: '#eff6ff', px: 1, py: 0.5, borderRadius: 1 }}>
                      {r.plaka}
                    </Typography>
                  </TableCell>
                  <TableCell>{tipChip(r.anomali_tipi)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    {r.miktar_lt != null ? Number(r.miktar_lt).toFixed(1) : '—'}
                  </TableCell>
                  <TableCell sx={{ fontSize: 12 }}>{r.istasyon ?? '—'}</TableCell>
                  <TableCell sx={{ fontSize: 12 }}>{r.istasyon_ili ?? '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}
