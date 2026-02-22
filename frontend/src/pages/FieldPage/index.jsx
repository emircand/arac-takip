import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchCekiciler, fetchDorseler } from '../../services/araclar'
import { fetchActiveSoforler } from '../../services/soforler'
import { fetchRecentTrips, deleteTrip } from '../../services/trips'
import TripForm from '../../components/TripForm'
import RecentTripsList from '../../components/RecentTripsList'

export default function FieldPage() {
  const [cekiciler, setCekiciler] = useState([])
  const [dorseler, setDorseler]   = useState([])
  const [soforler, setSoforler]   = useState([])
  const [trips, setTrips]         = useState([])
  const [loadingData, setLoadingData]   = useState(true)
  const [loadingTrips, setLoadingTrips] = useState(true)
  const [error, setError]         = useState(null)
  const [editingTrip, setEditingTrip]   = useState(null)
  const [deletingId, setDeletingId]     = useState(null)
  const formRef = useRef(null)

  useEffect(() => {
    Promise.all([fetchCekiciler(true), fetchDorseler(true), fetchActiveSoforler()])
      .then(([c, d, s]) => { setCekiciler(c); setDorseler(d); setSoforler(s) })
      .catch((err) => setError(err.message))
      .finally(() => setLoadingData(false))
  }, [])

  const refreshTrips = useCallback(() => {
    setLoadingTrips(true)
    fetchRecentTrips()
      .then(setTrips)
      .catch((err) => setError(err.message))
      .finally(() => setLoadingTrips(false))
  }, [])

  useEffect(() => { refreshTrips() }, [refreshTrips])

  function handleEdit(trip) {
    setEditingTrip(trip)
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function handleEditDone() {
    setEditingTrip(null)
    refreshTrips()
  }

  async function handleDelete(id) {
    if (!window.confirm('Bu sefer kaydı silinecek. Emin misiniz?')) return
    setDeletingId(id)
    try {
      await deleteTrip(id)
      setTrips((prev) => prev.filter((t) => t.id !== id))
    } catch (err) {
      setError(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-5 space-y-5">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Sefer Girişi</h1>
          <p className="text-xs text-gray-400 mt-0.5">Yeni sefer ekle veya mevcut seferi düzenle</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-sm">
          <span>⚠</span> {error}
        </div>
      )}

      <div ref={formRef} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        {loadingData ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-gray-400">Araç listesi yükleniyor...</span>
          </div>
        ) : (
          <TripForm
            cekiciler={cekiciler}
            dorseler={dorseler}
            soforler={soforler}
            editingTrip={editingTrip}
            onEditDone={handleEditDone}
            onTripSaved={refreshTrips}
          />
        )}
      </div>

      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="text-sm font-bold text-gray-700">Son Seferler</h2>
          {!loadingTrips && trips.length > 0 && (
            <p className="text-xs text-gray-400">{trips.length} kayıt gösteriliyor</p>
          )}
        </div>
        <button
          onClick={refreshTrips}
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
        >
          ↻ Yenile
        </button>
      </div>

      <RecentTripsList
        trips={trips}
        loading={loadingTrips}
        onEdit={handleEdit}
        onDelete={handleDelete}
        deletingId={deletingId}
      />
    </div>
  )
}
