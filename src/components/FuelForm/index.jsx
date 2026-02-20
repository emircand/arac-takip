import { useState } from 'react'
import { createFuelEntry } from '../../services/fuel'

const today = () => new Date().toISOString().split('T')[0]

export default function FuelForm({ vehicles }) {
  const [form, setForm] = useState({
    arac_id: '',
    tarih: today(),
    litre: '',
    tutar: '',
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
    if (!form.arac_id || !form.tarih || !form.litre || !form.tutar) {
      setError('Lütfen zorunlu alanları doldurun.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await createFuelEntry({
        ...form,
        litre: Number(form.litre),
        tutar: Number(form.tutar),
      })
      setSuccess(true)
      setForm({ arac_id: form.arac_id, tarih: today(), litre: '', tutar: '', notlar: '' })
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
          className="w-full border border-gray-300 rounded-lg px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
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
          className="w-full border border-gray-300 rounded-lg px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Litre <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="litre"
            value={form.litre}
            onChange={handleChange}
            placeholder="0.0"
            step="0.1"
            min="0"
            className="w-full border border-gray-300 rounded-lg px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tutar (₺) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="tutar"
            value={form.tutar}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            min="0"
            className="w-full border border-gray-300 rounded-lg px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>
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
          className="w-full border border-gray-300 rounded-lg px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm font-medium">
          ✓ Yakıt girişi başarıyla kaydedildi!
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-3 rounded-lg text-base transition-colors"
      >
        {loading ? 'Kaydediliyor...' : 'Yakıt Kaydet'}
      </button>
    </form>
  )
}
