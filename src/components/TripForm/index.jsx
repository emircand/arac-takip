import { useState } from 'react'
import { createTrip } from '../../services/trips'

const today = () => new Date().toISOString().split('T')[0]

export default function TripForm({ vehicles }) {
  const [form, setForm] = useState({
    arac_id: '',
    tarih: today(),
    tonaj: '',
    rota: '',
    notlar: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError(null)
    setSuccess(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.arac_id || !form.tarih || !form.tonaj || !form.rota) {
      setError('Lütfen zorunlu alanları doldurun.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await createTrip({ ...form, tonaj: Number(form.tonaj) })
      setSuccess(true)
      setForm({ arac_id: form.arac_id, tarih: today(), tonaj: '', rota: '', notlar: '' })
    } catch (err) {
      setError(err.message || 'Kayıt sırasında bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Araç <span className="text-red-500">*</span>
        </label>
        <select
          name="arac_id"
          value={form.arac_id}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">-- Araç seçin --</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.plaka} — {v.sofor_adi}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tarih <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          name="tarih"
          value={form.tarih}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tonaj (ton) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          name="tonaj"
          value={form.tonaj}
          onChange={handleChange}
          placeholder="0.0"
          step="0.1"
          min="0"
          className="w-full border border-gray-300 rounded-lg px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Rota / Bölge <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="rota"
          value={form.rota}
          onChange={handleChange}
          placeholder="örn. Kadıköy Güney"
          className="w-full border border-gray-300 rounded-lg px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notlar
        </label>
        <textarea
          name="notlar"
          value={form.notlar}
          onChange={handleChange}
          placeholder="İsteğe bağlı not..."
          rows={2}
          className="w-full border border-gray-300 rounded-lg px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm font-medium">
          ✓ Sefer başarıyla kaydedildi!
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 rounded-lg text-base transition-colors"
      >
        {loading ? 'Kaydediliyor...' : 'Sefer Kaydet'}
      </button>
    </form>
  )
}
