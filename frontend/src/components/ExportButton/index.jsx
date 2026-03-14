import { useState } from 'react'
import {
  Button, ButtonGroup, CircularProgress, Menu, MenuItem, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack,
} from '@mui/material'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

/**
 * ExportButton — XLSX veya PDF indirme düğmesi.
 *
 * Props:
 *   rapor         — string  — rapor adı: araclar|soforler|seferler|yakitlar|arizalar|stok|belgeler|yakit-analiz
 *   params        — object  — opsiyonel filtre parametreleri { key: value }
 *   label         — string  — düğme etiketi (default: "Dışa Aktar")
 *   size          — "small"|"medium" (default "small")
 *   withDateRange — bool    — true → indirmeden önce tarih aralığı seçim dialogu açar
 */
export default function ExportButton({ rapor, params = {}, label = 'Dışa Aktar', size = 'small', withDateRange = false }) {
  const [loading, setLoading] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)

  // Tarih aralığı dialog state
  const [dateDialog, setDateDialog] = useState(null)   // null | 'xlsx' | 'pdf'
  const today = new Date().toISOString().slice(0, 10)
  const firstOfMonth = today.slice(0, 8) + '01'
  const [baslangic, setBaslangic] = useState(firstOfMonth)
  const [bitis, setBitis] = useState(today)

  const menuOpen = Boolean(anchorEl)

  async function indir(format, extraParams = {}) {
    setLoading(true)
    try {
      const token = localStorage.getItem('filo_token')
      const allParams = { ...params, ...extraParams }
      // boş değerleri at
      Object.keys(allParams).forEach(k => { if (!allParams[k]) delete allParams[k] })
      const qs = new URLSearchParams({ format, ...allParams }).toString()
      const res = await fetch(`${BASE}/api/export/${rapor}?${qs}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const cd = res.headers.get('Content-Disposition') ?? ''
      const match = cd.match(/filename="?([^";]+)"?/)
      a.download = match ? match[1] : `${rapor}.${format}`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Export hatası:', err)
      alert('Dışa aktarma başarısız: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleClick(format) {
    setAnchorEl(null)
    if (withDateRange) {
      setDateDialog(format)
    } else {
      indir(format)
    }
  }

  function handleDateConfirm() {
    const fmt = dateDialog
    setDateDialog(null)
    indir(fmt, { baslangic, bitis })
  }

  return (
    <>
      <ButtonGroup variant="outlined" size={size} disabled={loading}>
        <Tooltip title="Excel indir">
          <Button
            startIcon={loading ? <CircularProgress size={14} /> : <FileDownloadIcon />}
            onClick={() => handleClick('xlsx')}
          >
            {label}
          </Button>
        </Tooltip>
        <Button size={size} onClick={(e) => setAnchorEl(e.currentTarget)}>
          <ArrowDropDownIcon fontSize="small" />
        </Button>
      </ButtonGroup>

      <Menu anchorEl={anchorEl} open={menuOpen} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={() => handleClick('xlsx')}>Excel (.xlsx)</MenuItem>
        <MenuItem onClick={() => handleClick('pdf')}>PDF (.pdf)</MenuItem>
      </Menu>

      {/* Tarih aralığı seçim dialogu */}
      <Dialog open={Boolean(dateDialog)} onClose={() => setDateDialog(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Tarih Aralığı Seç</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Başlangıç"
              type="date"
              size="small"
              value={baslangic}
              onChange={e => setBaslangic(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Bitiş"
              type="date"
              size="small"
              value={bitis}
              onChange={e => setBitis(e.target.value)}
              inputProps={{ min: baslangic }}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDateDialog(null)}>İptal</Button>
          <Button
            variant="contained"
            disabled={!baslangic || !bitis}
            onClick={handleDateConfirm}
            startIcon={<FileDownloadIcon />}
          >
            {dateDialog === 'pdf' ? 'PDF İndir' : 'Excel İndir'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
