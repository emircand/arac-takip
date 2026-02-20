import { useState, useEffect } from 'react'
import { fetchActiveVehicles } from '../../services/vehicles'
import TripForm from '../../components/TripForm'
import FuelForm from '../../components/FuelForm'

export default function FieldPage() {
  const [tab, setTab] = useState('trip')
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchActiveVehicles()
      .then(setVehicles)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-gray-900 mb-5">Saha Veri Girişi</h1>

      {/* Tab Switch */}
      <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
        <button
          onClick={() => setTab('trip')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
            tab === 'trip'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          🚛 Sefer Girişi
        </button>
        <button
          onClick={() => setTab('fuel')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
            tab === 'fuel'
              ? 'bg-white text-orange-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          ⛽ Yakıt Girişi
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Araçlar yükleniyor...</div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-4 text-sm">
          Araçlar yüklenemedi: {error}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          {tab === 'trip' ? (
            <TripForm vehicles={vehicles} />
          ) : (
            <FuelForm vehicles={vehicles} />
          )}
        </div>
      )}
    </div>
  )
}
