import { useState } from 'react'
import {
  Container, Box, Typography, Paper, Tabs, Tab, Divider,
  FormControl, InputLabel, Select, MenuItem, TextField,
  CircularProgress, Chip,
} from '@mui/material'
import { Fuel, TrendingUp, BarChart3, AlertTriangle, ShieldAlert } from 'lucide-react'
import TrendGrafik from './TrendGrafik'
import TonajScatter from './TonajScatter'
import FiloVerimliligiBar from './FiloVerimliligiBar'
import AnomalilerTablosu from './AnomalilerTablosu'
import RiskTablosu from './RiskTablosu'
import { useYakitTrend, useYakitAnomaliler } from '../../hooks/useYakitAnalitik'
import ExportButton from '../../components/ExportButton'

// ── Ay listesi yardımcısı ──────────────────────────────────────────────────────
function ayListesi(sonNAy = 24) {
  const aylar = []
  const bugun = new Date()
  for (let i = 0; i < sonNAy; i++) {
    const d = new Date(bugun.getFullYear(), bugun.getMonth() - i, 1)
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleString('tr-TR', { year: 'numeric', month: 'long' })
    aylar.push({ val, label })
  }
  return aylar
}

const AYLAR = ayListesi()
const BU_AY = AYLAR[0].val

// ── Özet kartları ─────────────────────────────────────────────────────────────
function OzetKartlari({ baslangic, bitis }) {
  const { data: trend, isLoading } = useYakitTrend({ baslangic, bitis })
  const { data: anomaliler } = useYakitAnomaliler(90)

  if (isLoading) return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4].map(i => (
        <Paper key={i} elevation={0} sx={{ flex: 1, p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <CircularProgress size={20} />
        </Paper>
      ))}
    </Box>
  )

  // Tüm araç + dönem verilerini düzleştir
  const tumVeri = trend?.flatMap(t => t.data) ?? []
  const ltValues = tumVeri.filter(d => d.lt_per_100km != null).map(d => Number(d.lt_per_100km))
  const ortLt = ltValues.length
    ? (ltValues.reduce((s, v) => s + v, 0) / ltValues.length).toFixed(1)
    : null

  // En verimsiz araç (son dönem bazlı)
  const sonDonemVeri = trend?.map(t => ({
    plaka: t.plaka,
    lt: t.data[0]?.lt_per_100km != null ? Number(t.data[0].lt_per_100km) : null,
  })).filter(x => x.lt != null) ?? []
  const enVerimsiz = sonDonemVeri.sort((a, b) => b.lt - a.lt)[0]

  const anomaliSayi = anomaliler?.length ?? 0
  const toplamLt = tumVeri.reduce((s, d) => s + (Number(d.toplam_lt) || 0), 0)

  const kartlar = [
    { label: 'Ort. lt/100km', value: ortLt ? `${ortLt}` : '—', unit: 'lt/100km', color: '#2563eb' },
    { label: 'En Verimsiz Araç', value: enVerimsiz?.plaka ?? '—', unit: enVerimsiz ? `${enVerimsiz.lt.toFixed(1)} lt/100km` : '', color: '#dc2626' },
    { label: 'Anomali (90 gün)', value: anomaliSayi, unit: 'kayıt', color: anomaliSayi > 0 ? '#d97706' : '#16a34a' },
    { label: 'Toplam Yakıt', value: toplamLt > 0 ? toplamLt.toLocaleString('tr-TR', { maximumFractionDigits: 0 }) : '—', unit: 'litre', color: '#7c3aed' },
  ]

  return (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      {kartlar.map(k => (
        <Paper key={k.label} elevation={0} sx={{
          flex: '1 1 160px', p: 2, borderRadius: 3,
          border: '1px solid', borderColor: 'divider',
        }}>
          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
            {k.label}
          </Typography>
          <Typography variant="h5" fontWeight={700} sx={{ color: k.color, lineHeight: 1.2 }}>
            {k.value}
          </Typography>
          {k.unit && (
            <Typography variant="caption" color="text.disabled">{k.unit}</Typography>
          )}
        </Paper>
      ))}
    </Box>
  )
}

// ── Ana Sayfa ─────────────────────────────────────────────────────────────────
export default function YakitAnalitikPage() {
  const [tab, setTab]           = useState(0)
  const [baslangic, setBaslangic] = useState(AYLAR[11]?.val ?? '')  // 12 ay önce
  const [bitis, setBitis]       = useState(BU_AY)
  const [karsilastirmaAy, setKarsilastirmaAy] = useState(BU_AY)

  return (
    <Container maxWidth="lg" sx={{ py: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Başlık */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Fuel size={28} className="text-blue-600" />
          <Box>
            <Typography variant="h5" fontWeight="bold">Yakıt Analitik</Typography>
            <Typography variant="caption" color="text.secondary">
              Araç başına tüketim, tonaj-tüketim korelasyonu ve anomali tespiti
            </Typography>
          </Box>
        </Box>
        <ExportButton
          rapor="yakit-analiz"
          params={baslangic ? { baslangic, bitis } : {}}
          label="Analiz Raporu"
        />
      </Box>

      {/* Özet kartlar */}
      <OzetKartlari baslangic={baslangic} bitis={bitis} />

      {/* Sekme paneli */}
      <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        <Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: 13 } }}
          >
            <Tab icon={<TrendingUp size={15} />} iconPosition="start" label="Trend" />
            <Tab icon={<span style={{ fontSize: 15 }}>⊹</span>} iconPosition="start" label="Tonaj-Tüketim" />
            <Tab icon={<BarChart3 size={15} />} iconPosition="start" label="Filo Karşılaştırma" />
            <Tab icon={<AlertTriangle size={15} />} iconPosition="start" label="Anomaliler" />
            <Tab icon={<ShieldAlert size={15} />} iconPosition="start" label="Risk Tablosu" />
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          {/* Dönem filtresi — Tab 0,1 için */}
          {(tab === 0 || tab === 1) && (
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
              <FormControl size="small" sx={{ minWidth: 170 }}>
                <InputLabel>Başlangıç</InputLabel>
                <Select value={baslangic} label="Başlangıç" onChange={e => setBaslangic(e.target.value)}>
                  {AYLAR.map(a => <MenuItem key={a.val} value={a.val}>{a.label}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 170 }}>
                <InputLabel>Bitiş</InputLabel>
                <Select value={bitis} label="Bitiş" onChange={e => setBitis(e.target.value)}>
                  {AYLAR.map(a => <MenuItem key={a.val} value={a.val}>{a.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
          )}

          {/* Dönem seçici — Tab 2 için */}
          {tab === 2 && (
            <Box sx={{ mb: 3 }}>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Dönem</InputLabel>
                <Select value={karsilastirmaAy} label="Dönem" onChange={e => setKarsilastirmaAy(e.target.value)}>
                  {AYLAR.map(a => <MenuItem key={a.val} value={a.val}>{a.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
          )}

          {tab === 0 && <TrendGrafik baslangic={baslangic} bitis={bitis} />}
          {tab === 1 && <TonajScatter baslangic={baslangic} bitis={bitis} />}
          {tab === 2 && <FiloVerimliligiBar donem={karsilastirmaAy} />}
          {tab === 3 && <AnomalilerTablosu />}
          {tab === 4 && <RiskTablosu />}
        </Box>
      </Paper>
    </Container>
  )
}
