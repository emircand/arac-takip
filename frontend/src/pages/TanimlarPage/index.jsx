import { useState, useEffect, useCallback } from 'react'
import {
  fetchAllSoforler, createSofor, updateSofor, toggleSoforActive,
} from '../../services/soforler'
import {
  fetchAraclar, fetchAracTurleri, createArac, updateArac, toggleAracAktif,
} from '../../services/araclar'
import BelgelerTab from '../../components/BelgelerTab'

const inputCls =
  'w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'

function Badge({ aktif }) {
  return (
    <span
      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
        aktif ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'
      }`}
    >
      {aktif ? 'Aktif' : 'Pasif'}
    </span>
  )
}

function TurBadge({ ad }) {
  const colors = {
    cekici: 'bg-blue-100 text-blue-700',
    dorse:  'bg-orange-100 text-orange-700',
    pikap:  'bg-purple-100 text-purple-700',
  }
  return (
    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full capitalize ${colors[ad] ?? 'bg-gray-100 text-gray-600'}`}>
      {ad}
    </span>
  )
}

// ─── Şoförler ────────────────────────────────────────────────────────────────
function SoforlerSection() {
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState({ ad_soyad: '', telefon: '' })
  const [editId, setEditId]   = useState(null)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    fetchAllSoforler()
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  async function handleAdd(e) {
    e.preventDefault()
    if (!addForm.ad_soyad.trim()) return
    setSaving(true)
    try {
      await createSofor({ ad_soyad: addForm.ad_soyad.trim(), telefon: addForm.telefon.trim() || null, aktif: true })
      setAddForm({ ad_soyad: '', telefon: '' })
      setShowAdd(false)
      load()
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }

  async function handleUpdate(id) {
    setSaving(true)
    try {
      await updateSofor(id, { ad_soyad: editForm.ad_soyad.trim(), telefon: editForm.telefon?.trim() || null })
      setEditId(null)
      load()
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }

  async function handleToggle(id, aktif) {
    try { await toggleSoforActive(id, !aktif); load() }
    catch (err) { setError(err.message) }
  }

  return (
    <section className="space-y-3">
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</div>
      )}

      {!showAdd ? (
        <button
          onClick={() => setShowAdd(true)}
          className="w-full py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm font-semibold text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors"
        >
          + Yeni Şoför Ekle
        </button>
      ) : (
        <form onSubmit={handleAdd} className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-3">
          <p className="text-xs font-bold text-blue-700 uppercase tracking-wide">Yeni Şoför</p>
          <div className="grid grid-cols-2 gap-2">
            <input value={addForm.ad_soyad} onChange={(e) => setAddForm((p) => ({ ...p, ad_soyad: e.target.value }))}
              placeholder="Ad Soyad *" className={inputCls} required autoFocus />
            <input value={addForm.telefon} onChange={(e) => setAddForm((p) => ({ ...p, telefon: e.target.value }))}
              placeholder="Telefon" className={inputCls} />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-semibold rounded-xl transition-colors">
              {saving ? 'Ekleniyor...' : 'Ekle'}
            </button>
            <button type="button" onClick={() => setShowAdd(false)}
              className="px-4 py-2 text-sm text-gray-500 hover:bg-white rounded-xl transition-colors border border-gray-200">
              İptal
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-10 text-gray-300 text-sm">Henüz şoför eklenmedi.</div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              {editId === item.id ? (
                <div className="p-4 space-y-3 bg-gray-50">
                  <div className="grid grid-cols-2 gap-2">
                    <input value={editForm.ad_soyad}
                      onChange={(e) => setEditForm((p) => ({ ...p, ad_soyad: e.target.value }))}
                      className={inputCls} autoFocus />
                    <input value={editForm.telefon || ''}
                      onChange={(e) => setEditForm((p) => ({ ...p, telefon: e.target.value }))}
                      placeholder="Telefon" className={inputCls} />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleUpdate(item.id)} disabled={saving}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-semibold rounded-xl transition-colors">
                      {saving ? '...' : 'Kaydet'}
                    </button>
                    <button onClick={() => setEditId(null)}
                      className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-white transition-colors">
                      İptal
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center px-4 py-3 gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{item.ad_soyad}</p>
                    {item.telefon && <p className="text-xs text-gray-400 mt-0.5">{item.telefon}</p>}
                  </div>
                  <Badge aktif={item.aktif} />
                  <div className="flex gap-1">
                    <button onClick={() => { setEditId(item.id); setEditForm({ ad_soyad: item.ad_soyad, telefon: item.telefon || '' }) }}
                      className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                      Düzenle
                    </button>
                    <button onClick={() => handleToggle(item.id, item.aktif)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                        item.aktif ? 'text-gray-500 bg-gray-50 hover:bg-gray-100' : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                      }`}>
                      {item.aktif ? 'Pasif' : 'Aktif'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

// ─── Araçlar (cekici + dorse + pikap — tek sekme, tür filtreli) ───────────────
function AraclarSection() {
  const [items, setItems]         = useState([])
  const [turler, setTurler]       = useState([])
  const [filterTur, setFilterTur] = useState('hepsi')
  const [loading, setLoading]     = useState(true)
  const [showAdd, setShowAdd]     = useState(false)
  const [addForm, setAddForm]     = useState({ plaka: '', tur_id: '' })
  const [editId, setEditId]       = useState(null)
  const [editForm, setEditForm]   = useState({})
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    fetchAraclar()
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchAracTurleri().then((data) => {
      setTurler(data)
      if (data.length > 0 && !addForm.tur_id) {
        setAddForm((p) => ({ ...p, tur_id: data[0].id }))
      }
    }).catch((e) => setError(e.message))
    load()
  }, [load])

  const visible = filterTur === 'hepsi'
    ? items
    : items.filter((a) => a.tur?.ad === filterTur)

  async function handleAdd(e) {
    e.preventDefault()
    if (!addForm.plaka.trim() || !addForm.tur_id) return
    setSaving(true)
    try {
      await createArac({ plaka: addForm.plaka.trim().toUpperCase(), tur_id: addForm.tur_id, aktif: true })
      setAddForm((p) => ({ ...p, plaka: '' }))
      setShowAdd(false)
      load()
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }

  async function handleUpdate(id) {
    setSaving(true)
    try {
      await updateArac(id, { plaka: editForm.plaka.trim().toUpperCase(), tur_id: editForm.tur_id })
      setEditId(null)
      load()
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }

  async function handleToggle(id, aktif) {
    try { await toggleAracAktif(id, !aktif); load() }
    catch (err) { setError(err.message) }
  }

  return (
    <section className="space-y-3">
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</div>
      )}

      {/* Tür filtresi */}
      <div className="flex gap-1.5 flex-wrap">
        {[{ id: 'hepsi', label: 'Tümü' }, ...turler.map((t) => ({ id: t.ad, label: t.ad.charAt(0).toUpperCase() + t.ad.slice(1) }))].map((opt) => (
          <button
            key={opt.id}
            onClick={() => setFilterTur(opt.id)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filterTur === opt.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {!showAdd ? (
        <button onClick={() => setShowAdd(true)}
          className="w-full py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm font-semibold text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors">
          + Yeni Araç Ekle
        </button>
      ) : (
        <form onSubmit={handleAdd} className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-3">
          <p className="text-xs font-bold text-blue-700 uppercase tracking-wide">Yeni Araç</p>
          <div className="grid grid-cols-2 gap-2">
            <input
              value={addForm.plaka}
              onChange={(e) => setAddForm((p) => ({ ...p, plaka: e.target.value.toUpperCase() }))}
              placeholder="Plaka *" className={inputCls} required autoFocus
            />
            <select
              value={addForm.tur_id}
              onChange={(e) => setAddForm((p) => ({ ...p, tur_id: e.target.value }))}
              className={inputCls} required
            >
              <option value="">— Tür seçin —</option>
              {turler.map((t) => (
                <option key={t.id} value={t.id}>{t.ad.charAt(0).toUpperCase() + t.ad.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-semibold rounded-xl transition-colors">
              {saving ? 'Ekleniyor...' : 'Ekle'}
            </button>
            <button type="button" onClick={() => setShowAdd(false)}
              className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-white transition-colors">
              İptal
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : visible.length === 0 ? (
        <div className="text-center py-10 text-gray-300 text-sm">Bu türde araç bulunamadı.</div>
      ) : (
        <div className="space-y-2">
          {visible.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              {editId === item.id ? (
                <div className="p-4 space-y-3 bg-gray-50">
                  <div className="grid grid-cols-2 gap-2">
                    <input value={editForm.plaka}
                      onChange={(e) => setEditForm((p) => ({ ...p, plaka: e.target.value.toUpperCase() }))}
                      className={inputCls} autoFocus />
                    <select
                      value={editForm.tur_id}
                      onChange={(e) => setEditForm((p) => ({ ...p, tur_id: e.target.value }))}
                      className={inputCls}
                    >
                      {turler.map((t) => (
                        <option key={t.id} value={t.id}>{t.ad.charAt(0).toUpperCase() + t.ad.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleUpdate(item.id)} disabled={saving}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-semibold rounded-xl transition-colors">
                      {saving ? '...' : 'Kaydet'}
                    </button>
                    <button onClick={() => setEditId(null)}
                      className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-white transition-colors">
                      İptal
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center px-4 py-3 gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-mono font-bold text-blue-700 text-sm">{item.plaka}</p>
                  </div>
                  <TurBadge ad={item.tur?.ad} />
                  <Badge aktif={item.aktif} />
                  <div className="flex gap-1">
                    <button onClick={() => { setEditId(item.id); setEditForm({ plaka: item.plaka, tur_id: item.tur?.id }) }}
                      className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                      Düzenle
                    </button>
                    <button onClick={() => handleToggle(item.id, item.aktif)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                        item.aktif ? 'text-gray-500 bg-gray-50 hover:bg-gray-100' : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                      }`}>
                      {item.aktif ? 'Pasif' : 'Aktif'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

// ─── TanimlarPage ─────────────────────────────────────────────────────────────
const TABS = [
  { id: 'soforler', label: 'Şoförler', icon: '👤' },
  { id: 'araclar',  label: 'Araçlar',  icon: '🚛' },
  { id: 'belgeler', label: 'Belgeler', icon: '📄' },
]

export default function TanimlarPage() {
  const [tab, setTab] = useState('soforler')

  return (
    <div className="max-w-2xl mx-auto px-4 py-5">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">Tanımlar</h1>
        <p className="text-xs text-gray-400 mt-0.5">Şoför, araç ve belge kayıtlarını yönetin</p>
      </div>

      {/* Sekmeler */}
      <div className="flex bg-gray-100 rounded-xl p-1 mb-5">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tab === t.id ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {tab === 'soforler' && <SoforlerSection />}
      {tab === 'araclar'  && <AraclarSection />}
      {tab === 'belgeler' && <BelgelerTab />}
    </div>
  )
}
