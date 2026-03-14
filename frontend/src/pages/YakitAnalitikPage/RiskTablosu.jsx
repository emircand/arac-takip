import {
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
  Chip, CircularProgress, Typography, Box,
} from '@mui/material'
import { useYakitRisk } from '../../hooks/useYakitAnalitik'

const RISK_RENK = {
  NORMAL:  { color: 'success', label: 'Normal' },
  DIKKAT:  { color: 'warning', label: 'Dikkat' },
  SUPHE:   { color: 'error',   label: 'Şüphe'  },
  KRITIK:  { color: 'error',   label: 'Kritik' },
}

function RiskChip({ seviye }) {
  const r = RISK_RENK[seviye] ?? { color: 'default', label: seviye }
  return (
    <Chip
      label={r.label}
      color={r.color}
      size="small"
      variant={seviye === 'KRITIK' ? 'filled' : 'outlined'}
      sx={{ fontWeight: 700, minWidth: 64 }}
    />
  )
}

export default function RiskTablosu() {
  const { data: rows, isLoading } = useYakitRisk()

  if (isLoading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
      <CircularProgress />
    </Box>
  )

  if (!rows?.length) return (
    <Typography variant="body2" color="text.disabled" sx={{ textAlign: 'center', py: 6 }}>
      Henüz yeterli veri yok (en az 2 aylık yakıt + sefer verisi gerekli).
    </Typography>
  )

  return (
    <TableContainer>
      <Table size="small">
        <TableHead sx={{ bgcolor: 'grey.50' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Plaka</TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Dönem</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>lt/100km</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Baseline (3ay)</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Sapma %</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Z-Skoru</TableCell>
            <TableCell align="center" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Risk</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map(r => (
            <TableRow key={r.arac_id} hover>
              <TableCell>
                <Typography variant="caption"
                  sx={{ fontFamily: 'monospace', fontWeight: 'bold', color: 'primary.dark',
                        bgcolor: '#eff6ff', px: 1, py: 0.5, borderRadius: 1 }}>
                  {r.plaka}
                </Typography>
              </TableCell>
              <TableCell sx={{ fontSize: 12 }}>
                {r.donem ? new Date(r.donem).toLocaleString('tr-TR', { year: 'numeric', month: 'long' }) : '—'}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                {r.lt_per_100km != null ? Number(r.lt_per_100km).toFixed(1) : '—'}
              </TableCell>
              <TableCell align="right" sx={{ color: 'text.secondary' }}>
                {r.baseline_3ay != null ? Number(r.baseline_3ay).toFixed(1) : '—'}
              </TableCell>
              <TableCell align="right" sx={{
                fontWeight: 600,
                color: r.sapma_pct > 25 ? 'error.main' : r.sapma_pct > 10 ? 'warning.main' : 'success.main'
              }}>
                {r.sapma_pct != null ? `${Number(r.sapma_pct) > 0 ? '+' : ''}${Number(r.sapma_pct).toFixed(1)}%` : '—'}
              </TableCell>
              <TableCell align="right" sx={{ fontFamily: 'monospace', fontSize: 12 }}>
                {r.z_skoru != null ? Number(r.z_skoru).toFixed(2) : '—'}
              </TableCell>
              <TableCell align="center">
                <RiskChip seviye={r.risk_seviyesi} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
