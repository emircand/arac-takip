export default function VehicleTable({ rows, loading }) {
  if (loading) {
    return (
      <div className="text-center py-10 text-gray-400 text-sm">Yükleniyor...</div>
    )
  }

  if (rows.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400 text-sm">
        Bu tarih aralığında sefer kaydı bulunamadı.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wide">
            <th className="text-left px-4 py-3 font-semibold">Plaka</th>
            <th className="text-left px-4 py-3 font-semibold">Şoför</th>
            <th className="text-left px-4 py-3 font-semibold hidden sm:table-cell">İlçe</th>
            <th className="text-right px-4 py-3 font-semibold">Sefer</th>
            <th className="text-right px-4 py-3 font-semibold">Tonaj (t)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row) => (
            <tr key={row.arac_id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-mono font-semibold text-blue-700">
                {row.plaka}
              </td>
              <td className="px-4 py-3 text-gray-700">{row.sofor_adi}</td>
              <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{row.ilce}</td>
              <td className="px-4 py-3 text-right font-semibold text-gray-800">
                {row.tripCount}
              </td>
              <td className="px-4 py-3 text-right font-semibold text-orange-600">
                {row.totalTonaj.toFixed(1)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-gray-50 font-semibold text-gray-700 border-t border-gray-200">
            <td className="px-4 py-3" colSpan={3}>Toplam</td>
            <td className="px-4 py-3 text-right">
              {rows.reduce((s, r) => s + r.tripCount, 0)}
            </td>
            <td className="px-4 py-3 text-right text-orange-600">
              {rows.reduce((s, r) => s + r.totalTonaj, 0).toFixed(1)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
