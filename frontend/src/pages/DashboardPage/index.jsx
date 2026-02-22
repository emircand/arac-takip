import { useState, useEffect, useCallback } from 'react'
import { fetchTripsForDashboard, fetchTodayStats } from '../../services/trips'
import SummaryCards from '../../components/SummaryCards'

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
    <div className="flex justify-center py-16">
      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  return (
    <div className="text-center py-14">
      <span className="text-3xl">📭</span>
      <p className="text-gray-400 text-sm mt-2">Bu aralıkta kayıt bulunamadı.</p>
    </div>
  )
}

const th = 'px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider'
const thR = 'px-4 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-wider'
const td = 'px-4 py-3 text-sm text-gray-700'
const tdR = 'px-4 py-3 text-sm text-right text-gray-700'
const tfL = 'px-4 py-3 text-sm font-bold text-gray-900'
const tfR = 'px-4 py-3 text-sm font-bold text-right text-gray-900'

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

  return (
    <div className="max-w-6xl mx-auto px-4 py-5 space-y-6">

      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-xs text-gray-400 mt-0.5">Bugünün özeti ve dönemsel istatistikler</p>
        </div>
        <button
          onClick={loadTrips}
          className="text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
        >
          ↻ Yenile
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-sm">
          <span>⚠</span> {error}
        </div>
      )}

      {/* Özet kartlar — her zaman bugün */}
      <SummaryCards
        tripCount={todayCount}
        totalTonaj={todayTonaj}
        totalKm={todayKm}
        totalYakit={todayYakit}
        kmUyariCount={todayKmUyari}
      />

      {/* Dönem filtresi + tablolar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center gap-3 justify-between">
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {PRESETS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPreset(p.value)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  preset === p.value
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {[['bolge', '📍 Bölge'], ['cekici', '🚛 Çekici'], ['sofor', '👤 Şoför']].map(([id, label]) => (
              <button
                key={id}
                onClick={() => setTableView(id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  tableView === id
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Tablolar */}
        {(tableLoading || (bolgeRows.length === 0 && cekiciRows.length === 0)) ? (
          <EmptyOrLoading loading={tableLoading} />
        ) : (
          <div className="overflow-x-auto">
            {/* Bölge tablosu */}
            {tableView === 'bolge' && (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className={th}>Bölge</th>
                    <th className={thR}>Sefer</th>
                    <th className={thR}>Tonaj</th>
                    <th className={thR}>KM</th>
                    <th className={thR}>Yakıt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {bolgeRows.map((r) => (
                    <tr key={r.bolge} className="hover:bg-gray-50 transition-colors">
                      <td className={td}><span className="font-medium">{r.bolge}</span></td>
                      <td className={tdR}>{r.count}</td>
                      <td className={`${tdR} font-semibold text-orange-600`}>{r.tonaj.toFixed(1)} t</td>
                      <td className={tdR}>{r.km.toLocaleString('tr-TR')}</td>
                      <td className={tdR}>{r.yakit > 0 ? `${r.yakit.toFixed(0)} L` : <span className="text-gray-300">—</span>}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                  <tr>
                    <td className={tfL}>Toplam</td>
                    <td className={tfR}>{bolgeRows.reduce((s, r) => s + r.count, 0)}</td>
                    <td className={`${tfR} text-orange-600`}>{bolgeRows.reduce((s, r) => s + r.tonaj, 0).toFixed(1)} t</td>
                    <td className={tfR}>{bolgeRows.reduce((s, r) => s + r.km, 0).toLocaleString('tr-TR')}</td>
                    <td className={tfR}>{bolgeRows.reduce((s, r) => s + r.yakit, 0).toFixed(0)} L</td>
                  </tr>
                </tfoot>
              </table>
            )}

            {/* Çekici tablosu */}
            {tableView === 'cekici' && (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className={th}>Plaka</th>
                    <th className={thR}>Sefer</th>
                    <th className={thR}>Tonaj</th>
                    <th className={thR}>KM</th>
                    <th className={thR}>Yakıt</th>
                    <th className={thR}>L/100km</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {cekiciRows.map((r) => {
                    const lper100 = r.km > 0 && r.yakit > 0
                      ? ((r.yakit / r.km) * 100).toFixed(1)
                      : null
                    return (
                      <tr key={r.cekici_id} className="hover:bg-gray-50 transition-colors">
                        <td className={td}>
                          <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md text-xs">
                            {r.plaka}
                          </span>
                        </td>
                        <td className={tdR}>{r.count}</td>
                        <td className={`${tdR} font-semibold text-orange-600`}>{r.tonaj.toFixed(1)} t</td>
                        <td className={tdR}>{r.km.toLocaleString('tr-TR')}</td>
                        <td className={tdR}>{r.yakit > 0 ? `${r.yakit.toFixed(0)} L` : <span className="text-gray-300">—</span>}</td>
                        <td className={tdR}>{lper100 ? `${lper100}` : <span className="text-gray-300">—</span>}</td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                  <tr>
                    <td className={tfL}>Toplam</td>
                    <td className={tfR}>{cekiciRows.reduce((s, r) => s + r.count, 0)}</td>
                    <td className={`${tfR} text-orange-600`}>{cekiciRows.reduce((s, r) => s + r.tonaj, 0).toFixed(1)} t</td>
                    <td className={tfR}>{cekiciRows.reduce((s, r) => s + r.km, 0).toLocaleString('tr-TR')}</td>
                    <td className={tfR}>{cekiciRows.reduce((s, r) => s + r.yakit, 0).toFixed(0)} L</td>
                    <td className={tfR} />
                  </tr>
                </tfoot>
              </table>
            )}

            {/* Şoför tablosu */}
            {tableView === 'sofor' && (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className={th}>Şoför</th>
                    <th className={thR}>Sefer</th>
                    <th className={thR}>Tonaj</th>
                    <th className={thR}>KM</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {soforRows.map((r) => (
                    <tr key={r.sofor_id} className="hover:bg-gray-50 transition-colors">
                      <td className={td}><span className="font-medium">{r.ad_soyad}</span></td>
                      <td className={tdR}>{r.count}</td>
                      <td className={`${tdR} font-semibold text-orange-600`}>{r.tonaj.toFixed(1)} t</td>
                      <td className={tdR}>{r.km.toLocaleString('tr-TR')}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                  <tr>
                    <td className={tfL}>Toplam</td>
                    <td className={tfR}>{soforRows.reduce((s, r) => s + r.count, 0)}</td>
                    <td className={`${tfR} text-orange-600`}>{soforRows.reduce((s, r) => s + r.tonaj, 0).toFixed(1)} t</td>
                    <td className={tfR}>{soforRows.reduce((s, r) => s + r.km, 0).toLocaleString('tr-TR')}</td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
