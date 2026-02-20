import { useState, useEffect, useCallback } from 'react'
import { fetchAllVehicles } from '../../services/vehicles'
import { fetchTripsWithVehicles, fetchTodayTrips } from '../../services/trips'
import SummaryCards from '../../components/SummaryCards'
import VehicleTable from '../../components/VehicleTable'

const PRESETS = [
  { label: 'Bugün', value: 'today' },
  { label: 'Bu Hafta', value: 'week' },
  { label: 'Bu Ay', value: 'month' },
]

function getDateRange(preset) {
  const today = new Date()
  const fmt = (d) => d.toISOString().split('T')[0]

  if (preset === 'today') {
    const s = fmt(today)
    return { start: s, end: s }
  }
  if (preset === 'week') {
    const start = new Date(today)
    start.setDate(today.getDate() - today.getDay() + 1)
    return { start: fmt(start), end: fmt(today) }
  }
  if (preset === 'month') {
    const start = new Date(today.getFullYear(), today.getMonth(), 1)
    return { start: fmt(start), end: fmt(today) }
  }
  return { start: null, end: null }
}

function aggregateByVehicle(trips) {
  const map = {}
  trips.forEach((trip) => {
    const key = trip.arac_id
    if (!map[key]) {
      map[key] = {
        arac_id: key,
        plaka: trip.araclar?.plaka ?? '—',
        sofor_adi: trip.araclar?.sofor_adi ?? '—',
        ilce: trip.araclar?.ilce ?? '—',
        tripCount: 0,
        totalTonaj: 0,
      }
    }
    map[key].tripCount += 1
    map[key].totalTonaj += Number(trip.tonaj) || 0
  })
  return Object.values(map).sort((a, b) => b.totalTonaj - a.totalTonaj)
}

export default function DashboardPage() {
  const [preset, setPreset] = useState('today')
  const [vehicles, setVehicles] = useState([])
  const [trips, setTrips] = useState([])
  const [todayTrips, setTodayTrips] = useState([])
  const [tableLoading, setTableLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load vehicles and today's summary once
  useEffect(() => {
    fetchAllVehicles()
      .then(setVehicles)
      .catch((err) => setError(err.message))

    fetchTodayTrips()
      .then(setTodayTrips)
      .catch((err) => setError(err.message))
  }, [])

  const loadTrips = useCallback(() => {
    setTableLoading(true)
    const { start, end } = getDateRange(preset)
    fetchTripsWithVehicles(start, end)
      .then(setTrips)
      .catch((err) => setError(err.message))
      .finally(() => setTableLoading(false))
  }, [preset])

  useEffect(() => {
    loadTrips()
  }, [loadTrips])

  const activeVehicleCount = vehicles.filter((v) => v.aktif).length
  const todayTripCount = todayTrips.length
  const todayTotalTonaj = todayTrips.reduce((s, t) => s + (Number(t.tonaj) || 0), 0)
  const tableRows = aggregateByVehicle(trips)

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Yönetici Dashboard</h1>
        <button
          onClick={loadTrips}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          ↻ Yenile
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          Hata: {error}
        </div>
      )}

      {/* Summary Cards — always show today's data */}
      <SummaryCards
        vehicleCount={activeVehicleCount}
        todayTripCount={todayTripCount}
        todayTotalTonaj={todayTotalTonaj}
      />

      {/* Date filter */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Araç Bazlı Sefer Özeti
        </h2>
        <div className="flex gap-2 mb-4">
          {PRESETS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPreset(p.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                preset === p.value
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <VehicleTable rows={tableRows} loading={tableLoading} />
      </div>
    </div>
  )
}
