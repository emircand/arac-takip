function Card({ title, value, icon, bg, text }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
      <div className={`${bg} rounded-xl w-11 h-11 flex items-center justify-center text-xl shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide truncate">{title}</p>
        <p className={`text-xl font-bold mt-0.5 ${text}`}>{value}</p>
      </div>
    </div>
  )
}

export default function SummaryCards({ tripCount, totalTonaj, totalKm, totalYakit }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Card
        title="Sefer"
        value={tripCount}
        icon="🚛"
        bg="bg-emerald-50"
        text="text-emerald-700"
      />
      <Card
        title="Tonaj"
        value={`${totalTonaj.toFixed(1)} t`}
        icon="⚖️"
        bg="bg-orange-50"
        text="text-orange-600"
      />
      <Card
        title="KM"
        value={totalKm.toLocaleString('tr-TR')}
        icon="📍"
        bg="bg-blue-50"
        text="text-blue-700"
      />
      <Card
        title="Yakıt"
        value={totalYakit > 0 ? `${totalYakit.toFixed(0)} L` : '—'}
        icon="⛽"
        bg="bg-violet-50"
        text="text-violet-700"
      />
    </div>
  )
}
