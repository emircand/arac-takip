import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ZAxis,
} from 'recharts'
import { CircularProgress, Typography, Box } from '@mui/material'
import { useYakitTrend } from '../../hooks/useYakitAnalitik'

// Renk: lt/100km değerine göre yeşil → sarı → kırmızı
function renkHesapla(value, min, max) {
  if (value == null || max === min) return '#94a3b8'
  const oran = Math.min(1, Math.max(0, (value - min) / (max - min)))
  const r = Math.round(22 + oran * (220 - 22))
  const g = Math.round(163 - oran * (163 - 60))
  const b = Math.round(74 - oran * (74 - 60))
  return `rgb(${r},${g},${b})`
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
      <strong>{d.plaka}</strong><br />
      Dönem: {d.donem}<br />
      Ort. Tonaj: {d.ort_tonaj ? `${d.ort_tonaj} kg` : '—'}<br />
      lt/100km: {d.lt_per_100km != null ? Number(d.lt_per_100km).toFixed(1) : '—'}<br />
      Toplam km: {d.toplam_km?.toLocaleString('tr-TR')}
    </div>
  )
}

export default function TonajScatter({ baslangic, bitis }) {
  const { data: trend, isLoading } = useYakitTrend({ baslangic, bitis })

  if (isLoading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
      <CircularProgress />
    </Box>
  )

  const noktalar = trend?.flatMap(t =>
    t.data
      .filter(d => d.ort_tonaj && d.lt_per_100km != null)
      .map(d => ({ plaka: t.plaka, donem: d.donem, ort_tonaj: d.ort_tonaj, lt_per_100km: d.lt_per_100km, toplam_km: d.toplam_km }))
  ) ?? []

  if (!noktalar.length) return (
    <Typography variant="body2" color="text.disabled" sx={{ textAlign: 'center', py: 6 }}>
      Bu dönemde tonaj+yakıt verisi olan kayıt yok.
    </Typography>
  )

  const values = noktalar.map(n => Number(n.lt_per_100km))
  const min = Math.min(...values)
  const max = Math.max(...values)

  const withColor = noktalar.map(n => ({
    ...n,
    fill: renkHesapla(Number(n.lt_per_100km), min, max),
  }))

  return (
    <ResponsiveContainer width="100%" height={320}>
      <ScatterChart margin={{ top: 8, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="ort_tonaj" name="Ort. Tonaj"
          label={{ value: 'Ort. Tonaj (kg)', position: 'insideBottom', offset: -2, style: { fontSize: 11 } }}
          tick={{ fontSize: 11 }}
        />
        <YAxis
          dataKey="lt_per_100km" name="lt/100km"
          label={{ value: 'lt/100km', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }}
          tick={{ fontSize: 11 }}
          domain={['auto', 'auto']}
        />
        <ZAxis range={[40, 40]} />
        <Tooltip content={<CustomTooltip />} />
        <Scatter
          data={withColor}
          shape={(props) => {
            const { cx, cy, payload } = props
            return <circle cx={cx} cy={cy} r={6} fill={payload.fill} fillOpacity={0.8} stroke="#fff" strokeWidth={1} />
          }}
        />
      </ScatterChart>
    </ResponsiveContainer>
  )
}
