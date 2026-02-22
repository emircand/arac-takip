import { useState, useEffect } from 'react'
import { createTrip, updateTrip, fetchLastKm } from '../../services/trips'
import SearchableSelect from '../SearchableSelect'

const today = () => new Date().toISOString().split('T')[0]

const EMPTY_FORM = {
  tarih: today(),
  bolge: '',
  cekici_id: '',
  dorse_id: '',
  sofor_id: '',
  cikis_saati: '',
  donus_saati: '',
  tonaj: '',
  cikis_km: '',
  donus_km: '',
  sfr_srs: '1',
  yakit: '',
  alinan_yakit: '',
  notlar: '',
}

const inputCls =
  'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'

function Label({ text, required }) {
  return (
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
      {text} {required && <span className="text-red-400 normal-case tracking-normal">*</span>}
    </label>
  )
}

function Section({ label }) {
  return (
    <div className="flex items-center gap-3 pt-3 pb-1">
      <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  )
}

export default function TripForm({ cekiciler, dorseler, soforler, editingTrip, onEditDone, onTripSaved }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [lastKm, setLastKm] = useState(null)

  const isEditing = !!editingTrip

  useEffect(() => {
    if (editingTrip) {
      setForm({
        tarih: editingTrip.tarih || today(),
        bolge: editingTrip.bolge || '',
        cekici_id: editingTrip.cekici_id || '',
        dorse_id: editingTrip.dorse_id || '',
        sofor_id: editingTrip.sofor_id || '',
        cikis_saati: editingTrip.cikis_saati?.substring(0, 5) || '',
        donus_saati: editingTrip.donus_saati?.substring(0, 5) || '',
        tonaj: editingTrip.tonaj?.toString() || '',
        cikis_km: editingTrip.cikis_km?.toString() || '',
        donus_km: editingTrip.donus_km?.toString() || '',
        sfr_srs: editingTrip.sfr_srs?.toString() || '1',
        yakit: editingTrip.yakit?.toString() || '',
        alinan_yakit: editingTrip.alinan_yakit?.toString() || '',
        notlar: editingTrip.notlar || '',
      })
      setError(null)
      setSuccess(false)
    } else {
      setForm(EMPTY_FORM)
    }
  }, [editingTrip])

  useEffect(() => {
    if (isEditing || !form.cekici_id) {
      setLastKm(null)
      return
    }
    fetchLastKm(form.cekici_id)
      .then((data) => {
        const km = data?.donus_km ?? null
        setLastKm(km)
        setForm((prev) => ({ ...prev, cikis_km: km != null ? String(km) : '' }))
      })
      .catch(() => setLastKm(null))
  }, [form.cekici_id, isEditing])

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError(null)
    setSuccess(false)
  }

  function validate() {
    const { tarih, bolge, cekici_id, dorse_id, sofor_id, cikis_saati, donus_saati, tonaj, cikis_km, donus_km } = form
    if (!tarih || !bolge || !cekici_id || !dorse_id || !sofor_id || !cikis_saati || !donus_saati || !tonaj || !cikis_km || !donus_km) {
      return 'Lütfen tüm zorunlu alanları doldurun.'
    }
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }
    setLoading(true)
    setError(null)

    const payload = {
      tarih: form.tarih,
      bolge: form.bolge,
      cekici_id: form.cekici_id,
      dorse_id: form.dorse_id,
      sofor_id: form.sofor_id,
      cikis_saati: form.cikis_saati,
      donus_saati: form.donus_saati,
      tonaj: Math.round(Number(form.tonaj)),
      cikis_km: Number(form.cikis_km),
      donus_km: Number(form.donus_km),
      sfr_srs: Number(form.sfr_srs) || 1,
      sfr: 1,
      yakit: form.yakit ? Number(form.yakit) : null,
      alinan_yakit: form.alinan_yakit ? Number(form.alinan_yakit) : null,
      notlar: form.notlar || null,
    }

    try {
      if (isEditing) {
        await updateTrip(editingTrip.id, payload)
        onEditDone?.()
      } else {
        await createTrip(payload)
        setSuccess(true)
        // Form sıfırla, cekici_id koru — useEffect cikis_km'i otomatik güncelleyecek
        const savedCekiciId = form.cekici_id
        setForm((prev) => ({
          ...EMPTY_FORM,
          tarih: prev.tarih,
          cekici_id: savedCekiciId,
          dorse_id: prev.dorse_id,
          sofor_id: prev.sofor_id,
        }))
        // useEffect cekici_id değişmediğinde tetiklenmez → manuel refetch
        fetchLastKm(savedCekiciId)
          .then((data) => {
            const km = data?.donus_km ?? null
            setLastKm(km)
            setForm((prev) => ({ ...prev, cikis_km: km != null ? String(km) : '' }))
          })
          .catch(() => {})
        onTripSaved?.()
      }
    } catch (err) {
      setError(err.message || 'Kayıt sırasında bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {isEditing && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-2.5 text-sm">
          <span className="text-base">✏️</span>
          <span>
            <b>{editingTrip.tarih}</b> tarihli sefer düzenleniyor
          </span>
        </div>
      )}

      {/* ── GÜZERGAH ─────────────────────────────────── */}
      <Section label="Güzergah" />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label text="Tarih" required />
          <input type="date" name="tarih" value={form.tarih} onChange={handleChange} className={inputCls} required />
        </div>
        <div>
          <Label text="Bölge" required />
          <input type="text" name="bolge" value={form.bolge} onChange={handleChange} placeholder="Kadıköy" className={inputCls} required />
        </div>
      </div>

      {/* ── ARAÇ ─────────────────────────────────────── */}
      <Section label="Araç" />
      <div>
        <Label text="Çekici" required />
        <SearchableSelect
          name="cekici_id"
          value={form.cekici_id}
          onChange={handleChange}
          options={cekiciler.map((c) => ({ id: c.id, label: c.plaka }))}
          placeholder="— Çekici seçin —"
          required
        />
      </div>
      <div>
        <Label text="Dorse" required />
        <SearchableSelect
          name="dorse_id"
          value={form.dorse_id}
          onChange={handleChange}
          options={dorseler.map((d) => ({ id: d.id, label: d.plaka }))}
          placeholder="— Dorse seçin —"
          required
        />
      </div>
      <div>
        <Label text="Şoför" required />
        <SearchableSelect
          name="sofor_id"
          value={form.sofor_id}
          onChange={handleChange}
          options={soforler.map((s) => ({ id: s.id, label: s.ad_soyad }))}
          placeholder="— Şoför seçin —"
          required
        />
      </div>

      {/* ── SAAT ─────────────────────────────────────── */}
      <Section label="Saat" />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label text="Çıkış" required />
          <input type="time" name="cikis_saati" value={form.cikis_saati} onChange={handleChange} className={inputCls} required />
        </div>
        <div>
          <Label text="Dönüş" required />
          <input type="time" name="donus_saati" value={form.donus_saati} onChange={handleChange} className={inputCls} required />
        </div>
      </div>

      {/* ── YÜK & KM ─────────────────────────────────── */}
      <Section label="Yük & KM" />
      <div>
        <Label text="Tonaj (kg)" required />
        <input type="number" name="tonaj" value={form.tonaj} onChange={handleChange} placeholder="0" step="1" min="0" className={inputCls} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label text="Çıkış KM" required />
          <input
            type="number"
            name="cikis_km"
            value={form.cikis_km}
            onChange={handleChange}
            placeholder="0"
            min="0"
            disabled={!isEditing}
            className={`${inputCls} ${!isEditing ? 'opacity-60 cursor-not-allowed' : ''}`}
            required
          />
          {!isEditing && lastKm != null && (
            <p className="text-[11px] text-blue-500 mt-1 pl-1">Son sefer dönüş km'sinden otomatik dolduruldu</p>
          )}
        </div>
        <div>
          <Label text="Dönüş KM" required />
          <input type="number" name="donus_km" value={form.donus_km} onChange={handleChange} placeholder="0" min="0" className={inputCls} required />
        </div>
      </div>

      {/* ── EK BİLGİ ─────────────────────────────────── */}
      <Section label="Ek Bilgi" />
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label text="Sefer Sırası" />
          <input type="number" name="sfr_srs" value={form.sfr_srs} onChange={handleChange} min="1" className={inputCls} />
        </div>
        <div>
          <Label text="Yakıt (litre)" />
          <input type="number" name="yakit" value={form.yakit} onChange={handleChange} placeholder="—" step="0.01" min="0" className={inputCls} />
        </div>
        <div>
          <Label text="Alınan Yakıt (lt)" />
          <input type="number" name="alinan_yakit" value={form.alinan_yakit} onChange={handleChange} placeholder="—" step="0.01" min="0" className={inputCls} />
        </div>
      </div>
      <div>
        <Label text="Notlar" />
        <textarea name="notlar" value={form.notlar} onChange={handleChange} placeholder="İsteğe bağlı not..." rows={2} className={`${inputCls} resize-none`} />
      </div>

      {/* Geri bildirimler */}
      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-sm">
          <span className="mt-0.5">⚠</span> {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl px-4 py-3 text-sm font-medium">
          <span>✓</span> Sefer başarıyla kaydedildi!
        </div>
      )}

      {/* Butonlar */}
      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-300 text-white font-semibold rounded-xl text-sm transition-colors"
        >
          {loading ? 'Kaydediliyor...' : isEditing ? '✓ Güncelle' : 'Sefer Kaydet'}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={() => onEditDone?.()}
            className="px-5 py-3.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 font-medium text-sm transition-colors"
          >
            İptal
          </button>
        )}
      </div>
    </form>
  )
}
