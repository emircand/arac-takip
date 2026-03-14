import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { CircularProgress, Typography, Box } from '@mui/material'
import { useYakitTrend } from '../../hooks/useYakitAnalitik'

// Araç başına sabit renk dizisi
const RENKLER = ['#2563eb', '#dc2626', '#16a34a', '#d97706', '#7c3aed', '#0891b2', '#be185d', '#92400e']

const fmtDonem = (d) => {
  if (!d) return ''
  const [y, m] = d.split('-')
  return `${m}/${y?.slice(2)}`
}

export default function TrendGrafik({ baslangic, bitis }) {
  const { data: trend, isLoading } = useYakitTrend({ baslangic, bitis })

  if (isLoading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
      <CircularProgress />
    </Box>
  )

  if (!trend?.length) return (
    <Typography variant="body2" color="text.disabled" sx={{ textAlign: 'center', py: 6 }}>
      Bu dönemde veri yok.
    </Typography>
  )

  // Tüm dönemleri topla ve birleştir
  const donemSet = new Set()
  trend.forEach(t => t.data.forEach(d => donemSet.add(d.donem)))
  const donemler = [...donemSet].sort()

  // Her dönem için araç verilerini birleştir (grafik için düz dizi)
  const chartData = donemler.map(donem => {
    const row = { donem: fmtDonem(donem) }
    trend.forEach(t => {
      const d = t.data.find(x => x.donem === donem)
      row[t.plaka] = d?.lt_per_100km ?? null
    })
    return row
  })

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={chartData} margin={{ top: 8, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="donem" tick={{ fontSize: 11 }} />
        <YAxis
          label={{ value: 'lt/100km', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }}
          tick={{ fontSize: 11 }}
          domain={['auto', 'auto']}
        />
        <Tooltip
          formatter={(value, name) => [value != null ? `${Number(value).toFixed(1)} lt/100km` : '—', name]}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {trend.map((t, i) => (
          <Line
            key={t.arac_id}
            type="monotone"
            dataKey={t.plaka}
            stroke={RENKLER[i % RENKLER.length]}
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
