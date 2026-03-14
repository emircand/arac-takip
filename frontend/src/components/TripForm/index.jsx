import { useState, useEffect, useMemo } from 'react'
import { createTrip, updateTrip, fetchLastKm } from '../../services/trips'
import { fetchSubeler } from '../../services/lokasyon'
import SearchableSelect from '../SearchableSelect'

const today = () => new Date().toISOString().split('T')[0]

const EMPTY_FORM = {
  tarih: today(),
  bolge: '',
  sube_id: '',
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

export default function TripForm({ cekiciler, dorseler, soforler, bolgeler = [], editingTrip, onEditDone, onTripSaved }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [lastKm, setLastKm] = useState(null)
  const [lastKmLoaded, setLastKmLoaded] = useState(false)

  // İl/İlçe filtre state'leri
  const [selectedBolgeId, setSelectedBolgeId] = useState('')
  const [ilceler, setIlceler] = useState([])

  const isEditing = !!editingTrip

  // İl değişince ilçeleri yükle
  useEffect(() => {
    if (!selectedBolgeId) { setIlceler([]); return }
    fetchSubeler(selectedBolgeId)
      .then(setIlceler)
      .catch(() => setIlceler([]))
  }, [selectedBolgeId])

  // Filtreli listeler — arac/sofor.bolge.id üzerinden filtrele
  const filteredCekiciler = useMemo(() => {
    if (!selectedBolgeId) return cekiciler
    return cekiciler.filter(a => a.bolge?.id === selectedBolgeId)
  }, [cekiciler, selectedBolgeId])

  const filteredDorseler = useMemo(() => {
    if (!selectedBolgeId) return dorseler
    return dorseler.filter(a => a.bolge?.id === selectedBolgeId)
  }, [dorseler, selectedBolgeId])

  const filteredSoforler = useMemo(() => {
    if (!selectedBolgeId) return soforler
    return soforler.filter(s => s.bolge?.id === selectedBolgeId)
  }, [soforler, selectedBolgeId])

  // Düzenleme modunda form doldur
  useEffect(() => {
    if (editingTrip) {
      setForm({
        tarih: editingTrip.tarih || today(),
        bolge: editingTrip.bolge || '',
        sube_id: editingTrip.sube_id ?? '',
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
      const b = bolgeler.find(b => b.ad === editingTrip.bolge)
      setSelectedBolgeId(b ? b.id : '')
      setError(null)
      setSuccess(false)
    } else {
      setForm(EMPTY_FORM)
      setSelectedBolgeId('')
    }
  }, [editingTrip, bolgeler])

  useEffect(() => {
    if (isEditing || !form.cekici_id) {
      setLastKm(null)
      setLastKmLoaded(false)
      return
    }
    setLastKmLoaded(false)
    fetchLastKm(form.cekici_id)
      .then((data) => {
        const km = data?.donus_km ?? null
        setLastKm(km)
        setForm((prev) => ({ ...prev, cikis_km: km != null ? String(km) : '' }))
      })
      .catch(() => setLastKm(null))
      .finally(() => setLastKmLoaded(true))
  }, [form.cekici_id, isEditing])

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError(null)
    setSuccess(false)
  }

  function handleIlChange(e) {
    const bolgeId = e.target.value ? Number(e.target.value) : ''
    const bolge = bolgeler.find(b => b.id === bolgeId)
    setSelectedBolgeId(bolgeId)
    setForm(prev => ({
      ...prev,
      bolge: bolge ? bolge.ad : '',
      sube_id: '',
      // Seçili araç/şoför bu ile ait değilse temizle
      cekici_id: cekiciler.find(a => a.id === prev.cekici_id && a.bolge?.id === bolgeId) ? prev.cekici_id : '',
      dorse_id:  dorseler.find(a => a.id === prev.dorse_id   && a.bolge?.id === bolgeId) ? prev.dorse_id  : '',
      sofor_id:  soforler.find(s => s.id === prev.sofor_id   && s.bolge?.id === bolgeId) ? prev.sofor_id  : '',
    }))
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
      sube_id: form.sube_id ? Number(form.sube_id) : null,
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
        const savedCekiciId = form.cekici_id
        setForm((prev) => ({
          ...EMPTY_FORM,
          tarih: prev.tarih,
          bolge: prev.bolge,
          sube_id: prev.sube_id,
          cekici_id: savedCekiciId,
          dorse_id: prev.dorse_id,
          sofor_id: prev.sofor_id,
        }))
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

      {/* Tarih */}
      <div>
        <Label text="Tarih" required />
        <input type="date" name="tarih" value={form.tarih} onChange={handleChange} className={inputCls} required />
      </div>

      {/* İl + İlçe */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label text="İl" required />
          <select
            value={selectedBolgeId}
            onChange={handleIlChange}
            className={inputCls}
            required
          >
            <option value="">— İl seçin —</option>
            {bolgeler.map((b) => (
              <option key={b.id} value={b.id}>{b.ad}</option>
            ))}
          </select>
        </div>
        <div>
          <Label text="İlçe" />
          <select
            name="sube_id"
            value={form.sube_id}
            onChange={handleChange}
            className={inputCls}
            disabled={!selectedBolgeId}
          >
            <option value="">— Tümü —</option>
            {ilceler.map((s) => (
              <option key={s.id} value={s.id}>{s.ad}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── ARAÇ ─────────────────────────────────────── */}
      <Section label="Araç" />

      {!selectedBolgeId && (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          Araç ve şoför listesi için önce il seçin.
        </p>
      )}

      <div>
        <Label text="Çekici" required />
        <SearchableSelect
          name="cekici_id"
          value={form.cekici_id}
          onChange={handleChange}
          options={filteredCekiciler.map((c) => ({ id: c.id, label: c.plaka }))}
          placeholder={selectedBolgeId ? '— Çekici seçin —' : '— Önce il seçin —'}
          required
          disabled={!selectedBolgeId}
        />
        {selectedBolgeId && filteredCekiciler.length === 0 && (
          <p className="text-xs text-gray-400 mt-1 pl-1">Bu ilde aktif çekici yok.</p>
        )}
      </div>

      <div>
        <Label text="Dorse" required />
        <SearchableSelect
          name="dorse_id"
          value={form.dorse_id}
          onChange={handleChange}
          options={filteredDorseler.map((d) => ({ id: d.id, label: d.plaka }))}
          placeholder={selectedBolgeId ? '— Dorse seçin —' : '— Önce il seçin —'}
          required
          disabled={!selectedBolgeId}
        />
        {selectedBolgeId && filteredDorseler.length === 0 && (
          <p className="text-xs text-gray-400 mt-1 pl-1">Bu ilde aktif dorse yok.</p>
        )}
      </div>

      <div>
        <Label text="Şoför" required />
        <SearchableSelect
          name="sofor_id"
          value={form.sofor_id}
          onChange={handleChange}
          options={filteredSoforler.map((s) => ({ id: s.id, label: s.ad_soyad }))}
          placeholder={selectedBolgeId ? '— Şoför seçin —' : '— Önce il seçin —'}
          required
          disabled={!selectedBolgeId}
        />
        {selectedBolgeId && filteredSoforler.length === 0 && (
          <p className="text-xs text-gray-400 mt-1 pl-1">Bu ilde aktif şoför yok.</p>
        )}
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
            disabled={!isEditing && (!form.cekici_id || !lastKmLoaded || lastKm != null)}
            className={`${inputCls} ${!isEditing && (!form.cekici_id || !lastKmLoaded || lastKm != null) ? 'opacity-60 cursor-not-allowed' : ''}`}
            required
          />
          {!isEditing && lastKmLoaded && lastKm != null && (
            <p className="text-[11px] text-blue-500 mt-1 pl-1">Son sefer dönüş km'sinden otomatik dolduruldu</p>
          )}
          {!isEditing && lastKmLoaded && lastKm == null && form.cekici_id && (
            <p className="text-[11px] text-amber-500 mt-1 pl-1">Önceki dönüş km bulunamadı — manuel girin</p>
          )}
        </div>
        <div>
          <Label text="Dönüş KM" required />
          <input type="number" name="donus_km" value={form.donus_km} onChange={handleChange} placeholder="0" min="0" className={inputCls} required />
        </div>
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
