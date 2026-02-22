import { useState, useEffect, useCallback } from 'react'
import { fetchTripsForDashboard, fetchTodayStats } from '../../services/trips'
import SummaryCards from '../../components/SummaryCards'
import DashboardBelgeUyari from '../../components/DashboardBelgeUyari'
import {
  Container,
  Box,
  Typography,
  Alert,
  Paper,
  CircularProgress,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableFooter,
} from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'

const PRESETS = [
  { label: 'Bugün', value: 'today' },
  { label: 'Bu Hafta', value: 'week' },
  { label: 'Bu Ay', value: 'month' },
]

function getDateRange(preset) {
  const today = new Date()
  const fmt = (d) => d.toISOString().split('T')[0]
  if (preset === 'today') { const s = fmt(today); return { start: s, end: s } }
  if (preset === 'week') {
    const start = new Date(today); start.setDate(today.getDate() - today.getDay() + 1)
    return { start: fmt(start), end: fmt(today) }
  }
  if (preset === 'month') {
    return { start: fmt(new Date(today.getFullYear(), today.getMonth(), 1)), end: fmt(today) }
  }
  return { start: null, end: null }
}

function aggregateByBolge(trips) {
  const map = {}
  trips.forEach((t) => {
    const key = t.bolge || '—'
    if (!map[key]) map[key] = { bolge: key, count: 0, tonaj: 0, km: 0, yakit: 0 }
    map[key].count += 1
    map[key].tonaj += Number(t.tonaj) || 0
    map[key].km += Number(t.km) || 0
    map[key].yakit += Number(t.yakit) || 0
  })
  return Object.values(map).sort((a, b) => b.tonaj - a.tonaj)
}

function aggregateByCekici(trips) {
  const map = {}
  trips.forEach((t) => {
    const key = t.cekici_id
    if (!map[key]) map[key] = { cekici_id: key, plaka: t.cekici_plaka ?? '—', count: 0, tonaj: 0, km: 0, yakit: 0 }
    map[key].count += 1
    map[key].tonaj += Number(t.tonaj) || 0
    map[key].km += Number(t.km) || 0
    map[key].yakit += Number(t.yakit) || 0
  })
  return Object.values(map).sort((a, b) => b.tonaj - a.tonaj)
}

function aggregateBySofor(trips) {
  const map = {}
  trips.forEach((t) => {
    const key = t.sofor_id
    if (!map[key]) map[key] = { sofor_id: key, ad_soyad: t.sofor_ad_soyad ?? '—', count: 0, tonaj: 0, km: 0 }
    map[key].count += 1
    map[key].tonaj += Number(t.tonaj) || 0
    map[key].km += Number(t.km) || 0
  })
  return Object.values(map).sort((a, b) => b.tonaj - a.tonaj)
}

function EmptyOrLoading({ loading }) {
  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
      <CircularProgress />
    </Box>
  )
  return (
    <Box sx={{ textAlign: 'center', py: 7 }}>
      <Typography variant="h3" component="span" sx={{ display: 'block', mb: 1 }}>📭</Typography>
      <Typography variant="body2" color="text.secondary">Bu aralıkta kayıt bulunamadı.</Typography>
    </Box>
  )
}

export default function DashboardPage() {
  const [preset, setPreset] = useState('today')
  const [todayStats, setTodayStats] = useState([])
  const [trips, setTrips] = useState([])
  const [tableLoading, setTableLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tableView, setTableView] = useState('bolge')
  useEffect(() => {
    fetchTodayStats().then(setTodayStats).catch((e) => setError(e.message))
  }, [])

  const loadTrips = useCallback(() => {
    setTableLoading(true)
    const { start, end } = getDateRange(preset)
    fetchTripsForDashboard(start, end)
      .then(setTrips)
      .catch((e) => setError(e.message))
      .finally(() => setTableLoading(false))
  }, [preset])

  useEffect(() => { loadTrips() }, [loadTrips])

  const todayCount = todayStats.length
  const todayTonaj = todayStats.reduce((s, t) => s + (Number(t.tonaj) || 0), 0)
  const todayKm = todayStats.reduce((s, t) => s + (Number(t.km) || 0), 0)
  const todayYakit = todayStats.reduce((s, t) => s + (Number(t.yakit) || 0), 0)
  const todayKmUyari = todayStats.filter((t) => t.km_uyari).length

  const bolgeRows = aggregateByBolge(trips)
  const cekiciRows = aggregateByCekici(trips)
  const soforRows = aggregateBySofor(trips)

  const handlePresetChange = (event, newPreset) => {
    if (newPreset !== null) {
      setPreset(newPreset);
    }
  };

  const handleTableViewChange = (event, newView) => {
    if (newView !== null) {
      setTableView(newView);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Başlık */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h5" component="h1" fontWeight="bold" color="text.primary">
            Dashboard
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            Bugünün özeti ve dönemsel istatistikler
          </Typography>
        </Box>
        <Button
          onClick={loadTrips}
          startIcon={<RefreshIcon />}
          size="small"
          variant="outlined"
          sx={{ textTransform: 'none', borderRadius: 2 }}
        >
          Yenile
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Özet kartlar — her zaman bugün */}
      <SummaryCards
        tripCount={todayCount}
        totalTonaj={todayTonaj}
        totalKm={todayKm}
        totalYakit={todayYakit}
        kmUyariCount={todayKmUyari}
      />

      {/* Belge Uyarıları */}
      <DashboardBelgeUyari />

      {/* Dönem filtresi + tablolar */}
      <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        {/* Toolbar */}
        <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, justifyContent: 'space-between' }}>
          <ToggleButtonGroup
            value={preset}
            exclusive
            onChange={handlePresetChange}
            size="small"
            sx={{
              '& .MuiToggleButton-root': { px: 2, py: 0.5, textTransform: 'none', fontWeight: 600 },
            }}
          >
            {PRESETS.map((p) => (
              <ToggleButton key={p.value} value={p.value}>
                {p.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          <ToggleButtonGroup
            value={tableView}
            exclusive
            onChange={handleTableViewChange}
            size="small"
            sx={{
              '& .MuiToggleButton-root': { px: 2, py: 0.5, textTransform: 'none', fontWeight: 600 },
            }}
          >
            {[
              { id: 'bolge', label: '📍 Bölge' },
              { id: 'cekici', label: '🚛 Çekici' },
              { id: 'sofor', label: '👤 Şoför' }
            ].map((v) => (
              <ToggleButton key={v.id} value={v.id}>
                {v.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        {/* Tablolar */}
        {(tableLoading || (bolgeRows.length === 0 && cekiciRows.length === 0)) ? (
          <EmptyOrLoading loading={tableLoading} />
        ) : (
          <TableContainer>
            {/* Bölge tablosu */}
            {tableView === 'bolge' && (
              <Table size="small">
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Bölge</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Sefer</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Tonaj</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>KM</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Yakıt</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bolgeRows.map((r) => (
                    <TableRow key={r.bolge} hover>
                      <TableCell sx={{ fontWeight: 'medium' }}>{r.bolge}</TableCell>
                      <TableCell align="right">{r.count}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: '600', color: 'warning.main' }}>{r.tonaj.toLocaleString('tr-TR')} kg</TableCell>
                      <TableCell align="right">{r.km.toLocaleString('tr-TR')}</TableCell>
                      <TableCell align="right">{r.yakit > 0 ? `${r.yakit.toFixed(0)} L` : <Typography variant="body2" color="text.disabled" component="span">—</Typography>}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter sx={{ bgcolor: 'grey.50' }}>
                  <TableRow sx={{ '& td': { fontWeight: 'bold' } }}>
                    <TableCell>Toplam</TableCell>
                    <TableCell align="right">{bolgeRows.reduce((s, r) => s + r.count, 0)}</TableCell>
                    <TableCell align="right" sx={{ color: 'warning.main' }}>{bolgeRows.reduce((s, r) => s + r.tonaj, 0).toLocaleString('tr-TR')} kg</TableCell>
                    <TableCell align="right">{bolgeRows.reduce((s, r) => s + r.km, 0).toLocaleString('tr-TR')}</TableCell>
                    <TableCell align="right">{bolgeRows.reduce((s, r) => s + r.yakit, 0).toFixed(0)} L</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            )}

            {/* Çekici tablosu */}
            {tableView === 'cekici' && (
              <Table size="small">
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Plaka</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Sefer</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Tonaj</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>KM</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Yakıt</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>L/100km</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cekiciRows.map((r) => {
                    const lper100 = r.km > 0 && r.yakit > 0 ? ((r.yakit / r.km) * 100).toFixed(1) : null
                    return (
                      <TableRow key={r.cekici_id} hover>
                        <TableCell>
                          <Typography
                            variant="caption"
                            sx={{
                              fontFamily: 'monospace',
                              fontWeight: 'bold',
                              color: 'primary.dark',
                              bgcolor: '#eff6ff',
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                            }}
                          >
                            {r.plaka}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">{r.count}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: '600', color: 'warning.main' }}>{r.tonaj.toLocaleString('tr-TR')} kg</TableCell>
                        <TableCell align="right">{r.km.toLocaleString('tr-TR')}</TableCell>
                        <TableCell align="right">{r.yakit > 0 ? `${r.yakit.toFixed(0)} L` : <Typography variant="body2" color="text.disabled" component="span">—</Typography>}</TableCell>
                        <TableCell align="right">{lper100 ? `${lper100}` : <Typography variant="body2" color="text.disabled" component="span">—</Typography>}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
                <TableFooter sx={{ bgcolor: 'grey.50' }}>
                  <TableRow sx={{ '& td': { fontWeight: 'bold' } }}>
                    <TableCell>Toplam</TableCell>
                    <TableCell align="right">{cekiciRows.reduce((s, r) => s + r.count, 0)}</TableCell>
                    <TableCell align="right" sx={{ color: 'warning.main' }}>{cekiciRows.reduce((s, r) => s + r.tonaj, 0).toLocaleString('tr-TR')} kg</TableCell>
                    <TableCell align="right">{cekiciRows.reduce((s, r) => s + r.km, 0).toLocaleString('tr-TR')}</TableCell>
                    <TableCell align="right">{cekiciRows.reduce((s, r) => s + r.yakit, 0).toFixed(0)} L</TableCell>
                    <TableCell align="right" />
                  </TableRow>
                </TableFooter>
              </Table>
            )}

            {/* Şoför tablosu */}
            {tableView === 'sofor' && (
              <Table size="small">
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Şoför</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Sefer</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Tonaj</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>KM</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {soforRows.map((r) => (
                    <TableRow key={r.sofor_id} hover>
                      <TableCell sx={{ fontWeight: 'medium' }}>{r.ad_soyad}</TableCell>
                      <TableCell align="right">{r.count}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: '600', color: 'warning.main' }}>{r.tonaj.toLocaleString('tr-TR')} kg</TableCell>
                      <TableCell align="right">{r.km.toLocaleString('tr-TR')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter sx={{ bgcolor: 'grey.50' }}>
                  <TableRow sx={{ '& td': { fontWeight: 'bold' } }}>
                    <TableCell>Toplam</TableCell>
                    <TableCell align="right">{soforRows.reduce((s, r) => s + r.count, 0)}</TableCell>
                    <TableCell align="right" sx={{ color: 'warning.main' }}>{soforRows.reduce((s, r) => s + r.tonaj, 0).toLocaleString('tr-TR')} kg</TableCell>
                    <TableCell align="right">{soforRows.reduce((s, r) => s + r.km, 0).toLocaleString('tr-TR')}</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            )}
          </TableContainer>
        )}
      </Paper>
    </Container>
  )
}
