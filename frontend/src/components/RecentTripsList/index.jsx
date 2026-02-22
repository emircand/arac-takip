function StatChip({ value }) {
  return <span className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md">{value}</span>
}

export default function RecentTripsList({ trips, loading, onEdit, onDelete, deletingId }) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 h-20 animate-pulse" />
        ))}
      </div>
    )
  }

  if (trips.length === 0) {
    return (
      <div className="text-center py-12">
        <span className="text-4xl">🚛</span>
        <p className="text-gray-400 text-sm mt-3">Henüz sefer kaydı yok.</p>
        <p className="text-gray-300 text-xs mt-1">Yukarıdaki formu doldurun.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2.5">
      {trips.map((trip) => (
        <div
          key={trip.id}
          className={`rounded-2xl border shadow-sm overflow-hidden ${
            trip.km_uyari
              ? 'bg-yellow-50 border-yellow-200'
              : 'bg-white border-gray-100'
          }`}
        >
          <div className={`h-0.5 bg-gradient-to-r ${trip.km_uyari ? 'from-yellow-400 to-orange-400' : 'from-blue-500 to-blue-400'}`} />

          <div className="px-4 pt-3 pb-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="font-mono font-bold text-blue-700 text-xs bg-blue-50 px-2 py-1 rounded-lg shrink-0">
                  {trip.cekici_plaka ?? '—'}
                </span>
                <span className="text-sm font-semibold text-gray-800 truncate">{trip.bolge}</span>
              </div>
              <span className="text-xs text-gray-300 shrink-0 pt-0.5">{trip.tarih}</span>
            </div>

            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-xs text-gray-500 shrink-0">
                {trip.sofor_ad_soyad ?? '—'}
              </span>
              <span className="text-gray-200">•</span>
              {trip.tonaj != null && (
                <StatChip value={`${Number(trip.tonaj).toFixed(3)} t`} />
              )}
              {trip.km != null && <StatChip value={`${trip.km} km`} />}
              {trip.yakit != null && <StatChip value={`${Number(trip.yakit).toFixed(0)} L`} />}
              {trip.sfr_srs != null && (
                <span className="text-[10px] text-gray-300">#{trip.sfr_srs}</span>
              )}

              {trip.km_uyari && (
                <span title={trip.km_uyari_aciklama} className="text-[10px] font-semibold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-md cursor-help">
                  ⚠ KM
                </span>
              )}

              <div className="flex items-center gap-1 ml-auto shrink-0">
                <button
                  onClick={() => onEdit(trip)}
                  className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  Düzenle
                </button>
                <button
                  onClick={() => onDelete(trip.id)}
                  disabled={deletingId === trip.id}
                  className="px-3 py-1.5 text-xs font-semibold text-red-400 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-40"
                >
                  {deletingId === trip.id ? '...' : 'Sil'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
