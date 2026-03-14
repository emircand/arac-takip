import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { CircularProgress, Typography, Box } from '@mui/material'
import { useYakitKarsilastirma } from '../../hooks/useYakitAnalitik'

function renk(lt) {
  if (lt == null) return '#94a3b8'
  if (lt > 45)  return '#dc2626'
  if (lt > 38)  return '#f59e0b'
  return '#16a34a'
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
      <strong>{d.plaka}</strong><br />
      lt/100km: {d.lt_per_100km != null ? Number(d.lt_per_100km).toFixed(1) : '—'}<br />
      Toplam km: {d.toplam_km?.toLocaleString('tr-TR')}<br />
      Toplam lt: {d.toplam_lt != null ? Number(d.toplam_lt).toFixed(0) : '—'}<br />
      Yakıt Dengesi: {d.yakit_denge_lt != null ? `${Number(d.yakit_denge_lt).toFixed(0)} lt` : '—'}
    </div>
  )
}

export default function FiloVerimliligiBar({ donem }) {
  const { data: rows, isLoading } = useYakitKarsilastirma(donem)

  if (isLoading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
      <CircularProgress />
    </Box>
  )

  if (!rows?.length) return (
    <Typography variant="body2" color="text.disabled" sx={{ textAlign: 'center', py: 6 }}>
      Bu dönemde veri yok.
    </Typography>
  )

  // Filo ortalaması (referans çizgisi)
  const ort = rows.reduce((s, r) => s + (Number(r.lt_per_100km) || 0), 0) / rows.length

  return (
    <ResponsiveContainer width="100%" height={Math.max(200, rows.length * 32)}>
      <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 40, left: 20, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
        <XAxis
          type="number"
          tick={{ fontSize: 11 }}
          label={{ value: 'lt/100km', position: 'insideBottom', offset: -2, style: { fontSize: 11 } }}
          domain={[0, 'auto']}
        />
        <YAxis type="category" dataKey="plaka" tick={{ fontSize: 11, fontFamily: 'monospace' }} width={90} />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine x={ort} stroke="#6366f1" strokeDasharray="4 4"
          label={{ value: `Ort: ${ort.toFixed(1)}`, position: 'insideTopRight', fontSize: 11, fill: '#6366f1' }} />
        <Bar dataKey="lt_per_100km" radius={[0, 4, 4, 0]}>
          {rows.map((r, i) => (
            <Cell key={i} fill={renk(r.lt_per_100km)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
