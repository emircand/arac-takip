import { useState } from 'react'
import { useKritikStok } from '../../hooks/useStok'
import {
  Paper, Box, Typography, Chip, Collapse, Divider,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
  CircularProgress,
} from '@mui/material'
import { Package, ChevronDown, ChevronUp } from 'lucide-react'

const fmtSayi = (n) => (n != null ? Number(n).toLocaleString('tr-TR', { maximumFractionDigits: 2 }) : '—')

const bakiyeChip = (b) => {
  const val = Number(b)
  const color = val <= 0 ? 'error' : 'warning'
  return (
    <Chip
      label={fmtSayi(b)}
      color={color}
      size="small"
      variant="outlined"
      sx={{ fontWeight: 700, minWidth: 56 }}
    />
  )
}

export default function DashboardKritikStok() {
  const [acik, setAcik] = useState(false)
  const { data: kritikler, isLoading } = useKritikStok()

  const tukenmisSayi = kritikler?.filter(k => Number(k.bakiye) <= 0).length ?? 0
  const azSayi = kritikler?.filter(k => Number(k.bakiye) > 0 && Number(k.bakiye) <= 5).length ?? 0
  const toplamSayi = kritikler?.length ?? 0

  return (
    <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
      {/* Header */}
      <Box
        onClick={() => setAcik(v => !v)}
        sx={{
          px: 3, py: 2,
          display: 'flex', alignItems: 'center', gap: 1.5,
          cursor: 'pointer', userSelect: 'none',
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        <Package size={18} className="text-blue-600" />
        <Typography variant="subtitle1" fontWeight={700} sx={{ flex: 1 }}>
          Kritik Stok
        </Typography>
        {isLoading ? (
          <CircularProgress size={16} />
        ) : (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {tukenmisSayi > 0 && (
              <Chip label={`${tukenmisSayi} Tükendi`} color="error" size="small" sx={{ fontWeight: 700 }} />
            )}
            {azSayi > 0 && (
              <Chip label={`${azSayi} Az Kaldı`} color="warning" size="small" sx={{ fontWeight: 700 }} />
            )}
            {toplamSayi === 0 && !isLoading && (
              <Chip label="Stok Yeterli" color="success" size="small" sx={{ fontWeight: 700 }} />
            )}
          </Box>
        )}
        {acik ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
      </Box>

      <Collapse in={acik}>
        <Divider />
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        ) : toplamSayi === 0 ? (
          <Typography variant="body2" color="text.disabled" sx={{ textAlign: 'center', py: 4 }}>
            Kritik stok kalemi yok.
          </Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Stok Adı</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Kod</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Birim</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Devir</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Giriş</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Çıkış</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Bakiye</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {kritikler.map(k => (
                  <TableRow key={k.id} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{k.stok_adi}</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>{k.kodu ?? '—'}</TableCell>
                    <TableCell>{k.birim}</TableCell>
                    <TableCell align="right">{fmtSayi(k.devir)}</TableCell>
                    <TableCell align="right">{fmtSayi(k.giris)}</TableCell>
                    <TableCell align="right">{fmtSayi(k.cikis)}</TableCell>
                    <TableCell align="right">{bakiyeChip(k.bakiye)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Collapse>
    </Paper>
  )
}
