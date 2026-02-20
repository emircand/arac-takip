function Card({ title, value, sub, color }) {
  const colors = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
  }
  return (
    <div className={`border rounded-xl p-4 ${colors[color]}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{title}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
      {sub && <p className="text-xs mt-1 opacity-60">{sub}</p>}
    </div>
  )
}

export default function SummaryCards({ vehicleCount, todayTripCount, todayTotalTonaj }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card
        title="Aktif Araç"
        value={vehicleCount}
        sub="toplam filodaki araç"
        color="blue"
      />
      <Card
        title="Bugünkü Sefer"
        value={todayTripCount}
        sub="bugün yapılan sefer sayısı"
        color="green"
      />
      <Card
        title="Bugünkü Tonaj"
        value={`${todayTotalTonaj.toFixed(1)} t`}
        sub="bugün toplam taşınan"
        color="orange"
      />
    </div>
  )
}
