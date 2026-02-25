import { useRef, useState } from 'react'
import { useUploadExcel, useConfirmYakit, useYakitList } from '../../hooks/useYakit'
import {
  Alert, CircularProgress, Chip,
  Table, TableBody, TableCell, TableHead, TableRow, Paper, Tooltip,
} from '@mui/material'
import { UploadCloud, CheckCircle, TriangleAlert, Fuel, CopyX } from 'lucide-react'

const fmtLt  = (n) => n != null ? `${Number(n).toFixed(1)} lt` : '-'
const fmtTL  = (n) => n != null ? Number(n).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' }) : '-'
const fmtDt  = (s) => s ? s.replace('T', ' ').slice(0, 16) : '-'

// ─── Yükleme Bölgesi ────────────────────────────────────────────────
function DropZone({ onFile, loading }) {
  const inputRef = useRef()
  const [dragging, setDragging] = useState(false)

  const handle = (file) => {
    if (file && file.name.endsWith('.xlsx')) onFile(file)
  }

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center gap-3 transition-colors cursor-pointer select-none
        ${dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); handle(e.dataTransfer.files[0]) }}
    >
      {loading
        ? <CircularProgress size={32} />
        : <UploadCloud size={36} className="text-gray-400" />
      }
      <div className="text-center">
        <p className="font-medium text-gray-700">Excel dosyasını buraya sürükle</p>
        <p className="text-sm text-gray-400">ya da tıkla (.xlsx)</p>
      </div>
      <input
        ref={inputRef} type="file" accept=".xlsx" className="hidden"
        onChange={(e) => handle(e.target.files[0])}
      />
    </div>
  )
}

// ─── Önizleme Tablosu ───────────────────────────────────────────────
function PreviewTable({ preview, onConfirm, isPending }) {
  const { matched, unmatched } = preview

  const yeni      = matched.filter(r => !r.duplika)
  const duplikalar = matched.filter(r => r.duplika)

  return (
    <div className="space-y-4">
      {/* Özet chip'leri */}
      <div className="flex flex-wrap gap-3">
        <Chip icon={<CheckCircle size={14} />}    label={`${yeni.length} yeni kayıt`}       color="success" variant="outlined" />
        {duplikalar.length > 0 && (
          <Chip icon={<CopyX size={14} />}        label={`${duplikalar.length} zaten kayıtlı`} color="default" variant="outlined" />
        )}
        {unmatched.length > 0 && (
          <Chip icon={<TriangleAlert size={14} />} label={`${unmatched.length} eşleşmedi`}   color="warning" variant="outlined" />
        )}
      </div>

      {/* Eşleşmeyen uyarılar */}
      {unmatched.length > 0 && (
        <Alert severity="warning" variant="outlined">
          <p className="font-semibold mb-1">Sistemde bulunamayan plakalar:</p>
          <ul className="text-sm space-y-0.5">
            {unmatched.map((u, i) => (
              <li key={i}>
                Satır {u.satir_no}: <span className="font-mono font-bold">{u.plaka}</span>
              </li>
            ))}
          </ul>
        </Alert>
      )}

      {/* Tüm eşleşen satırlar — yeni + duplicate */}
      {matched.length > 0 && (
        <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <div className="overflow-x-auto">
            <Table size="small">
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell><b>Plaka</b></TableCell>
                  <TableCell><b>Tarih</b></TableCell>
                  <TableCell align="right"><b>Litre</b></TableCell>
                  <TableCell align="right"><b>Tutar</b></TableCell>
                  <TableCell><b>İstasyon</b></TableCell>
                  <TableCell><b>Durum</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {matched.map((r, i) => (
                  <TableRow
                    key={i}
                    hover={!r.duplika}
                    sx={r.duplika ? { opacity: 0.45, bgcolor: 'grey.50' } : undefined}
                  >
                    <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{r.plaka}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{fmtDt(r.tarih)}</TableCell>
                    <TableCell align="right">{fmtLt(r.miktar_lt)}</TableCell>
                    <TableCell align="right">{fmtTL(r.tutar)}</TableCell>
                    <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.istasyon ?? '-'}
                    </TableCell>
                    <TableCell>
                      {r.duplika ? (
                        <Tooltip title="Bu UTTS işlemi daha önce kaydedildi">
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <CopyX size={12} /> Zaten kayıtlı
                          </span>
                        </Tooltip>
                      ) : (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle size={12} /> Yeni
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Paper>
      )}

      {/* Onay butonu — yalnızca yeni satır varsa */}
      {yeni.length > 0 ? (
        <div className="flex justify-end">
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors"
          >
            {isPending ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <CheckCircle size={16} />}
            {isPending ? 'Kaydediliyor...' : `${yeni.length} yeni kaydı kaydet`}
          </button>
        </div>
      ) : (
        <Alert severity="info" variant="outlined">
          Tüm satırlar zaten kayıtlı — yapılacak yeni kayıt yok.
        </Alert>
      )}
    </div>
  )
}

// ─── Kayıtlar Listesi ────────────────────────────────────────────────
function KayitlarTable({ data, isLoading }) {
  if (isLoading) {
    return <div className="flex justify-center py-8"><CircularProgress size={28} /></div>
  }
  if (!data?.length) {
    return <p className="text-center text-gray-400 py-8">Henüz yakıt kaydı yok.</p>
  }

  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <div className="overflow-x-auto">
        <Table size="small">
          <TableHead sx={{ bgcolor: 'grey.50' }}>
            <TableRow>
              <TableCell><b>Plaka</b></TableCell>
              <TableCell><b>Tarih</b></TableCell>
              <TableCell align="right"><b>Litre</b></TableCell>
              <TableCell align="right"><b>Tutar</b></TableCell>
              <TableCell><b>İstasyon</b></TableCell>
              <TableCell><b>İl</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{r.plaka}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{fmtDt(r.tarih)}</TableCell>
                <TableCell align="right">{fmtLt(r.miktar_lt)}</TableCell>
                <TableCell align="right">{fmtTL(r.tutar)}</TableCell>
                <TableCell sx={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {r.istasyon ?? '-'}
                </TableCell>
                <TableCell>{r.istasyon_ili ?? '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Paper>
  )
}

// ─── Ana Sayfa ───────────────────────────────────────────────────────
export default function YakitPage() {
  const [preview, setPreview] = useState(null)
  const [saved, setSaved]     = useState(false)

  const uploadMut  = useUploadExcel()
  const confirmMut = useConfirmYakit()
  const { data: kayitlar, isLoading: listLoading } = useYakitList()

  const handleFile = (file) => {
    setPreview(null)
    setSaved(false)
    uploadMut.mutate(file, { onSuccess: setPreview })
  }

  const handleConfirm = () => {
    confirmMut.mutate(preview.matched, {
      onSuccess: () => {
        setPreview(null)
        setSaved(true)
      },
    })
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Başlık */}
      <div className="flex items-center gap-3">
        <Fuel size={28} className="text-blue-600" />
        <div>
          <h1 className="text-xl font-bold text-gray-900">Yakıt Alımları</h1>
          <p className="text-sm text-gray-500">Excel dosyasını yükle, önizle, kaydet</p>
        </div>
      </div>

      {/* Upload */}
      <section className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold text-gray-700">Excel Yükle</h2>
        <DropZone onFile={handleFile} loading={uploadMut.isPending} />
        {uploadMut.isError && (
          <Alert severity="error">{uploadMut.error?.message ?? 'Yükleme başarısız'}</Alert>
        )}
      </section>

      {/* Başarı mesajı */}
      {saved && (
        <Alert severity="success" onClose={() => setSaved(false)}>
          Yakıt kayıtları başarıyla kaydedildi.
        </Alert>
      )}

      {/* Önizleme */}
      {preview && (
        <section className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-gray-700">Önizleme</h2>
          {confirmMut.isError && (
            <Alert severity="error">{confirmMut.error?.message ?? 'Kayıt başarısız'}</Alert>
          )}
          <PreviewTable
            preview={preview}
            onConfirm={handleConfirm}
            isPending={confirmMut.isPending}
          />
        </section>
      )}

      {/* Geçmiş kayıtlar */}
      <section className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold text-gray-700">
          Kayıtlar
          {kayitlar?.length ? (
            <span className="ml-2 text-xs font-normal text-gray-400">({kayitlar.length} adet)</span>
          ) : null}
        </h2>
        <KayitlarTable data={kayitlar} isLoading={listLoading} />
      </section>
    </div>
  )
}
