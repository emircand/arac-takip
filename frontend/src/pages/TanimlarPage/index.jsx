import { useState, useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchLokasyonAgac } from '../../services/lokasyon'
import { fetchFirmalar } from '../../services/firmalar'
import { useSoforler, useCreateSofor, useUpdateSofor, useToggleSoforActive } from '../../hooks/useSoforler'
import { useAraclar, useAracTurleri, useCreateArac, useUpdateArac, useToggleAracAktif } from '../../hooks/useAraclar'
import AracBelgeleriDialog from '../../components/AracBelgeleriDialog'
import { Pencil, FileText, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const inputCls =
  'w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'

function Label({ text }) {
  return <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{text}</label>
}

function SectionDivider({ label }) {
  return (
    <div className="flex items-center gap-2 pt-1">
      <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{label}</span>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  )
}

function Badge({ aktif }) {
  return (
    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${aktif ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}>
      {aktif ? 'Aktif' : 'Pasif'}
    </span>
  )
}

function TurBadge({ ad }) {
  const colors = {
    cekici:      'bg-blue-100 text-blue-700',
    semitreyler: 'bg-orange-100 text-orange-700',
    kamyonet:    'bg-cyan-100 text-cyan-700',
    otomobil:    'bg-green-100 text-green-700',
    suv:         'bg-lime-100 text-lime-700',
    'pick-up':   'bg-purple-100 text-purple-700',
    panelvan:    'bg-rose-100 text-rose-700',
  }
  return (
    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full capitalize ${colors[ad] ?? 'bg-gray-100 text-gray-600'}`}>
      {ad}
    </span>
  )
}

const DURUMLAR = ['aktif', 'yedek', 'serviste', 'satıldı', 'hurda']

function flatSubeler(agac) {
  return agac.flatMap((d) =>
    d.bolgeler.flatMap((b) =>
      b.subeler.map((s) => ({ id: s.id, ad: s.ad, bolgeId: b.id, bolgeAd: b.ad, depoAd: d.ad }))
    )
  )
}

function flatBolgeler(agac) {
  return agac.flatMap((d) => d.bolgeler.map((b) => ({ id: b.id, ad: b.ad })))
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function Modal({ title, onClose, onSave, saving, saveLabel = 'Kaydet', children }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col"
        style={{ maxHeight: '90vh' }}>
        {/* Header */}
        <div className="flex-none flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {children}
        </div>
        {/* Footer */}
        <div className="flex-none flex gap-2 px-5 py-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            {saving ? 'Kaydediliyor...' : saveLabel}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            İptal
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Şoförler ─────────────────────────────────────────────────────────────────
const EMPTY_SOFOR = { ad_soyad: '', telefon: '', sube_id: '' }

function SoforlerSection({ agac }) {
  const [modal, setModal] = useState(null)
  const [ara, setAra] = useState('')
  const [filterAktif, setFilterAktif] = useState('hepsi')

  const { data: items = [], isLoading: loading, error: qError } = useSoforler()
  const createMut  = useCreateSofor()
  const updateMut  = useUpdateSofor()
  const toggleMut  = useToggleSoforActive()

  const saving = createMut.isPending || updateMut.isPending
  const error  = qError?.message ?? createMut.error?.message ?? updateMut.error?.message ?? null
  const subeler = flatSubeler(agac)

  function setField(field) {
    return (e) => setModal((m) => m ? ({ ...m, form: { ...m.form, [field]: e.target.value } }) : m)
  }

  function buildPayload(form) {
    return {
      ad_soyad: form.ad_soyad.trim(),
      telefon: form.telefon?.trim() || null,
      sube_id: form.sube_id ? Number(form.sube_id) : null,
    }
  }

  async function handleSave() {
    if (!modal.form.ad_soyad?.trim()) return
    const payload = buildPayload(modal.form)
    if (modal.mode === 'add') {
      await createMut.mutateAsync({ ...payload, aktif: true })
    } else {
      await updateMut.mutateAsync({ id: modal.itemId, payload })
    }
    setModal(null)
  }

  function handleToggle(id, aktif) {
    toggleMut.mutate({ id, aktif: !aktif })
  }

  const visibleSofor = useMemo(() => items.filter((s) => {
    if (filterAktif === 'aktif' && !s.aktif) return false
    if (filterAktif === 'pasif' && s.aktif) return false
    if (ara && !s.ad_soyad?.toLowerCase().includes(ara.toLowerCase())) return false
    return true
  }), [items, filterAktif, ara])

  return (
    <section className="space-y-3">
      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</div>}

      {/* Filtreler */}
      <div className="flex gap-2 items-center">
        <input
          value={ara} onChange={(e) => setAra(e.target.value)}
          placeholder="Ad soyad ara..."
          className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="flex gap-1">
          {[['hepsi', 'Tümü'], ['aktif', 'Aktif'], ['pasif', 'Pasif']].map(([val, lbl]) => (
            <button key={val} onClick={() => setFilterAktif(val)}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${filterAktif === val ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
              {lbl}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => setModal({ mode: 'add', form: EMPTY_SOFOR, itemId: null })}
        className="w-full py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm font-semibold text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors"
      >
        + Yeni Şoför Ekle
      </button>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : visibleSofor.length === 0 ? (
        <div className="text-center py-10 text-gray-300 text-sm">Şoför bulunamadı.</div>
      ) : (
        <div className="space-y-2">
          {visibleSofor.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center px-4 py-3 gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{item.ad_soyad}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {[item.telefon, item.sube?.bolge?.ad, item.sube?.ad].filter(Boolean).join(' · ') || '\u00a0'}
                  </p>
                </div>
                <Badge aktif={item.aktif} />
                <div className="flex gap-1">
                  <button
                    onClick={() => setModal({
                      mode: 'edit',
                      form: { ad_soyad: item.ad_soyad, telefon: item.telefon || '', sube_id: item.sube?.id ?? '' },
                      itemId: item.id,
                    })}
                    className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    Düzenle
                  </button>
                  <button
                    onClick={() => handleToggle(item.id, item.aktif)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${item.aktif ? 'text-gray-500 bg-gray-50 hover:bg-gray-100' : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                      }`}
                  >
                    {item.aktif ? 'Pasif' : 'Aktif'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal
          title={modal.mode === 'add' ? 'Yeni Şoför' : 'Şoför Düzenle'}
          onClose={() => setModal(null)}
          onSave={handleSave}
          saving={saving}
          saveLabel={modal.mode === 'add' ? 'Ekle' : 'Kaydet'}
        >
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label text="Ad Soyad *" />
                <input
                  value={modal.form.ad_soyad}
                  onChange={setField('ad_soyad')}
                  placeholder="Ad Soyad"
                  className={inputCls}
                  autoFocus
                />
              </div>
              <div>
                <Label text="Telefon" />
                <input
                  value={modal.form.telefon}
                  onChange={setField('telefon')}
                  placeholder="05xx xxx xx xx"
                  className={inputCls}
                />
              </div>
              <div className="col-span-2">
                <Label text="Şube" />
                <select value={modal.form.sube_id} onChange={setField('sube_id')} className={inputCls}>
                  <option value="">— Şube —</option>
                  {subeler.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.depoAd} / {s.bolgeAd} / {s.ad}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </section>
  )
}

// ─── Araçlar ──────────────────────────────────────────────────────────────────
const EMPTY_ARAC = {
  plaka: '', tur_id: '', marka: '', model_yili: '', cinsi: '', renk: '',
  motor_gucu: '', silindir_hacmi: '', sase_no: '',
  firma_id: '',
  bos_agirlik: '', lastik_tipi: '', arvento_no: '',
  depo_id: '', bolge_id: '', sube_id: '',
  onceki_plaka: '', durumu: 'aktif', aktif: true,
}

function AraclarSection({ agac, firmalar }) {
  const [belgeDlg, setBelgeDlg] = useState(null)
  const [filterTur, setFilterTur] = useState('hepsi')
  const [filterAktif, setFilterAktif] = useState('hepsi')
  const [filterFirma, setFilterFirma] = useState('')
  const [filterBolge, setFilterBolge] = useState('')
  const [filterSube, setFilterSube] = useState('')
  const [ara, setAra] = useState('')
  const [modal, setModal] = useState(null)

  const { data: items = [], isLoading: loading, error: qError } = useAraclar()
  const { data: turler = [] } = useAracTurleri()
  const createMut = useCreateArac()
  const updateMut = useUpdateArac()
  const toggleMut = useToggleAracAktif()

  const saving = createMut.isPending || updateMut.isPending
  const error  = qError?.message ?? createMut.error?.message ?? updateMut.error?.message ?? null

  const bolgeler = useMemo(() => flatBolgeler(agac), [agac])
  const subeSecenekleri = useMemo(
    () => flatSubeler(agac).filter((s) => !filterBolge || String(s.bolgeId) === filterBolge),
    [agac, filterBolge]
  )

  const visible = useMemo(() => items.filter((a) => {
    if (filterTur !== 'hepsi' && a.tur?.ad !== filterTur) return false
    if (filterAktif === 'aktif' && !a.aktif) return false
    if (filterAktif === 'pasif' && a.aktif) return false
    if (filterFirma && String(a.firma?.id) !== filterFirma) return false
    if (filterBolge && String(a.sube?.bolge?.id) !== filterBolge) return false
    if (filterSube && String(a.sube?.id) !== filterSube) return false
    if (ara) {
      const q = ara.toLowerCase()
      if (!a.plaka?.toLowerCase().includes(q) && !a.marka?.toLowerCase().includes(q)) return false
    }
    return true
  }), [items, filterTur, filterAktif, filterFirma, filterBolge, filterSube, ara])

  // Modal field setter with cascade logic
  function setField(field) {
    return (e) => setModal((m) => {
      if (!m) return m
      const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
      const next = { ...m.form, [field]: value }
      if (field === 'depo_id') { next.bolge_id = ''; next.sube_id = '' }
      if (field === 'bolge_id') { next.sube_id = '' }
      return { ...m, form: next }
    })
  }

  function buildPayload(form) {
    return {
      plaka: form.plaka.trim().toUpperCase(),
      tur_id: form.tur_id || undefined,
      aktif: form.aktif ?? true,
      marka: form.marka || null,
      model_yili: form.model_yili ? Number(form.model_yili) : null,
      cinsi: form.cinsi || null,
      renk: form.renk || null,
      motor_gucu: form.motor_gucu ? Number(form.motor_gucu) : null,
      silindir_hacmi: form.silindir_hacmi ? Number(form.silindir_hacmi) : null,
      sase_no: form.sase_no || null,
      firma_id: form.firma_id ? Number(form.firma_id) : null,
      bos_agirlik: form.bos_agirlik ? Number(form.bos_agirlik) : null,
      lastik_tipi: form.lastik_tipi || null,
      arvento_no: form.arvento_no ? Number(form.arvento_no) : null,
      sube_id: form.sube_id ? Number(form.sube_id) : null,
      onceki_plaka: form.onceki_plaka || null,
      durumu: form.durumu || 'aktif',
    }
  }

  async function handleSave() {
    if (!modal.form.plaka?.trim() || !modal.form.tur_id) return
    const payload = buildPayload(modal.form)
    if (modal.mode === 'add') {
      await createMut.mutateAsync(payload)
    } else {
      await updateMut.mutateAsync({ id: modal.itemId, payload })
    }
    setModal(null)
  }

  function handleToggle(id, aktif) {
    toggleMut.mutate({ id, aktif: !aktif })
  }

  function openAdd() {
    const defaultTurId = turler.length > 0 ? turler[0].id : ''
    setModal({ mode: 'add', form: { ...EMPTY_ARAC, tur_id: defaultTurId }, itemId: null })
  }

  function openEdit(item) {
    setModal({
      mode: 'edit',
      form: {
        plaka: item.plaka,
        tur_id: item.tur?.id ?? '',
        marka: item.marka ?? '',
        model_yili: item.model_yili ?? '',
        cinsi: item.cinsi ?? '',
        renk: item.renk ?? '',
        motor_gucu: item.motor_gucu ?? '',
        silindir_hacmi: item.silindir_hacmi ?? '',
        sase_no: item.sase_no ?? '',
        firma_id: item.firma?.id ?? '',
        bos_agirlik: item.bos_agirlik ?? '',
        lastik_tipi: item.lastik_tipi ?? '',
        arvento_no: item.arvento_no ?? '',
        depo_id: item.sube?.bolge?.depo?.id ?? '',
        bolge_id: item.sube?.bolge?.id ?? '',
        sube_id: item.sube?.id ?? '',
        onceki_plaka: item.onceki_plaka ?? '',
        durumu: item.durumu ?? 'aktif',
        aktif: item.aktif ?? true,
      },
      itemId: item.id,
    })
  }

  function AracForm({ form }) {
    const depolar = agac
    const bolgeler = form.depo_id
      ? (depolar.find((d) => String(d.id) === String(form.depo_id))?.bolgeler ?? [])
      : []
    const subeler = form.bolge_id
      ? (bolgeler.find((b) => String(b.id) === String(form.bolge_id))?.subeler ?? [])
      : []

    return (
      <div className="space-y-3">
        <SectionDivider label="Zorunlu" />
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label text="Plaka *" />
            <input
              value={form.plaka}
              onChange={(e) => setField('plaka')({ target: { value: e.target.value.toUpperCase() } })}
              placeholder="34 XX 0000"
              className={inputCls}
              required
              autoFocus
            />
          </div>
          <div>
            <Label text="Tür *" />
            <select value={form.tur_id} onChange={setField('tur_id')} className={inputCls} required>
              <option value="">— Tür —</option>
              {turler.map((t) => (
                <option key={t.id} value={t.id}>{t.ad.charAt(0).toUpperCase() + t.ad.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        <SectionDivider label="Organizasyon" />
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label text="Firma" />
            <select value={form.firma_id} onChange={setField('firma_id')} className={inputCls}>
              <option value="">— Firma —</option>
              {firmalar.map((f) => (
                <option key={f.id} value={f.id}>{f.ad}</option>
              ))}
            </select>
          </div>
          <div>
            <Label text="Arvento No" />
            <input type="number" value={form.arvento_no} onChange={setField('arvento_no')} placeholder="123" min="0" className={inputCls} />
          </div>

          <div>
            <Label text="Depo" />
            <select value={form.depo_id} onChange={setField('depo_id')} className={inputCls}>
              <option value="">— Depo —</option>
              {depolar.map((d) => (
                <option key={d.id} value={d.id}>{d.ad}</option>
              ))}
            </select>
          </div>
          <div>
            <Label text="Bölge" />
            <select value={form.bolge_id} onChange={setField('bolge_id')} className={inputCls} disabled={!form.depo_id}>
              <option value="">— Bölge —</option>
              {bolgeler.map((b) => (
                <option key={b.id} value={b.id}>{b.ad}</option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <Label text="Şube" />
            <select value={form.sube_id} onChange={setField('sube_id')} className={inputCls} disabled={!form.bolge_id}>
              <option value="">— Şube —</option>
              {subeler.map((s) => (
                <option key={s.id} value={s.id}>{s.ad}</option>
              ))}
            </select>
          </div>

          <div>
            <Label text="Önceki Plaka" />
            <input value={form.onceki_plaka} onChange={setField('onceki_plaka')} placeholder="46 AA 000" className={inputCls} />
          </div>
          <div>
            <Label text="Durum" />
            <select value={form.durumu} onChange={setField('durumu')} className={inputCls}>
              {DURUMLAR.map((d) => (
                <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <input type="checkbox" id="arac-aktif" checked={!!form.aktif} onChange={setField('aktif')}
              className="w-4 h-4 rounded accent-blue-600 cursor-pointer" />
            <label htmlFor="arac-aktif" className="text-sm text-gray-700 cursor-pointer select-none">Aktif araç</label>
          </div>
        </div>

        <SectionDivider label="Kimlik" />
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label text="Marka" />
            <input value={form.marka} onChange={setField('marka')} placeholder="MERCEDES" className={inputCls} />
          </div>
          <div>
            <Label text="Model Yılı" />
            <input type="number" value={form.model_yili} onChange={setField('model_yili')}
              placeholder="2020" min="1990" max="2030" className={inputCls} />
          </div>
          <div>
            <Label text="Cinsi" />
            <input value={form.cinsi} onChange={setField('cinsi')} placeholder="Çekici / Frigorifik" className={inputCls} />
          </div>
          <div>
            <Label text="Renk" />
            <input value={form.renk} onChange={setField('renk')} placeholder="Beyaz" className={inputCls} />
          </div>
          <div className="col-span-2">
            <Label text="Şase No" />
            <input value={form.sase_no} onChange={setField('sase_no')} placeholder="WDB..." className={inputCls} />
          </div>
        </div>

        <SectionDivider label="Teknik" />
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label text="Motor Gücü (HP)" />
            <input type="number" value={form.motor_gucu} onChange={setField('motor_gucu')} placeholder="420" min="0" className={inputCls} />
          </div>
          <div>
            <Label text="Silindir Hacmi (cc)" />
            <input type="number" value={form.silindir_hacmi} onChange={setField('silindir_hacmi')} placeholder="12000" min="0" className={inputCls} />
          </div>
          <div>
            <Label text="Boş Ağırlık (kg)" />
            <input type="number" value={form.bos_agirlik} onChange={setField('bos_agirlik')} placeholder="7500" min="0" className={inputCls} />
          </div>
          <div>
            <Label text="Lastik Tipi" />
            <input value={form.lastik_tipi} onChange={setField('lastik_tipi')} placeholder="315/80 R22.5" className={inputCls} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <section className="space-y-3">
      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</div>}

      {/* Filtreler */}
      <div className="flex gap-2 items-center">
        <input
          value={ara} onChange={(e) => setAra(e.target.value)}
          placeholder="Plaka veya marka ara..."
          className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="flex gap-1">
          {[['hepsi', 'Tümü'], ['aktif', 'Aktif'], ['pasif', 'Pasif']].map(([val, lbl]) => (
            <button key={val} onClick={() => setFilterAktif(val)}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${filterAktif === val ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
              {lbl}
            </button>
          ))}
        </div>
      </div>

      {/* Firma / Bölge / Şube */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { value: filterFirma, set: setFilterFirma, placeholder: 'Firma', opts: firmalar.map((f) => ({ id: f.id, ad: f.ad })) },
          { value: filterBolge, set: (v) => { setFilterBolge(v); setFilterSube('') }, placeholder: 'Bölge', opts: bolgeler },
          { value: filterSube, set: setFilterSube, placeholder: 'Şube', opts: subeSecenekleri },
        ].map(({ value, set, placeholder, opts }) => (
          <select key={placeholder} value={value} onChange={(e) => set(e.target.value)}
            className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600">
            <option value="">{placeholder}</option>
            {opts.map((o) => <option key={o.id} value={o.id}>{o.ad}</option>)}
          </select>
        ))}
      </div>

      {/* Tür filtresi */}
      <div className="flex gap-1.5 flex-wrap">
        {[{ id: 'hepsi', label: 'Tümü' }, ...turler.map((t) => ({ id: t.ad, label: t.ad.charAt(0).toUpperCase() + t.ad.slice(1) }))].map((opt) => (
          <button key={opt.id} onClick={() => setFilterTur(opt.id)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${filterTur === opt.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}>
            {opt.label}
          </button>
        ))}
      </div>

      <button
        onClick={openAdd}
        className="w-full py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm font-semibold text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors"
      >
        + Yeni Araç Ekle
      </button>

      {/* Liste */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : visible.length === 0 ? (
        <div className="text-center py-10 text-gray-300 text-sm">Bu türde araç bulunamadı.</div>
      ) : (
        <AnimatePresence initial={false}>
        <div className="space-y-2">
          {visible.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18 }}
              className={`rounded-xl border shadow-sm overflow-hidden ${item.aktif ? 'bg-white border-gray-100' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center px-4 py-3 gap-3">
                <div className="flex-1 min-w-0">
                  <p className={`font-mono font-bold text-sm ${item.aktif ? 'text-blue-700' : 'text-red-400'}`}>{item.plaka}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {[item.marka, item.model_yili, item.firma?.ad, item.sube?.ad].filter(Boolean).join(' · ') || '\u00a0'}
                  </p>
                </div>
                <TurBadge ad={item.tur?.ad} />
                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(item)}
                    title="Düzenle"
                    className="w-8 h-8 flex items-center justify-center text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => setBelgeDlg({ id: item.id, plaka: item.plaka })}
                    title="Belgeler"
                    className="w-8 h-8 flex items-center justify-center text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
                  >
                    <FileText size={15} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        </AnimatePresence>
      )}

      {modal && (
        <Modal
          title={modal.mode === 'add' ? 'Yeni Araç' : 'Araç Düzenle'}
          onClose={() => setModal(null)}
          onSave={handleSave}
          saving={saving}
          saveLabel={modal.mode === 'add' ? 'Ekle' : 'Kaydet'}
        >
          <AracForm form={modal.form} />
        </Modal>
      )}

      <AracBelgeleriDialog
        arac={belgeDlg}
        open={!!belgeDlg}
        onClose={() => setBelgeDlg(null)}
      />
    </section>
  )
}

// ─── TanimlarPage ──────────────────────────────────────────────────────────────
const TABS = [
  { id: 'soforler', label: 'Şoförler', icon: '👤' },
  { id: 'araclar', label: 'Araçlar', icon: '🚛' },
]

export default function TanimlarPage() {
  const [tab, setTab] = useState('soforler')
  const { data: agac = [] }    = useQuery({ queryKey: ['lokasyon'], queryFn: fetchLokasyonAgac, staleTime: Infinity })
  const { data: firmalar = [] } = useQuery({ queryKey: ['firmalar'], queryFn: fetchFirmalar,      staleTime: Infinity })

  return (
    <div className="max-w-2xl mx-auto px-4 py-5">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">Tanımlar</h1>
        <p className="text-xs text-gray-400 mt-0.5">Şoför ve araç kayıtlarını yönetin</p>
      </div>

      <div className="flex bg-gray-100 rounded-xl p-1 mb-5">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === t.id ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}>
            <span>{t.icon}</span><span>{t.label}</span>
          </button>
        ))}
      </div>

      {tab === 'soforler' && <SoforlerSection agac={agac} />}
      {tab === 'araclar' && <AraclarSection agac={agac} firmalar={firmalar} />}
    </div>
  )
}
