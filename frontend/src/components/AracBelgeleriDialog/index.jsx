import { useState } from 'react'
import { useBelgeler } from '../../hooks/useBelgeler'
import { BELGE_TURLERI } from '../../services/aracBelgeler'
import BelgeDurumBadge from '../BelgeDurumBadge'
import BelgeFormModal from '../BelgeFormModal'
import {
  Dialog, DialogTitle, DialogContent, IconButton,
  Box, Typography, Paper, Button, CircularProgress, Divider,
} from '@mui/material'
import { X, Pencil, Plus } from 'lucide-react'

// Standart türler: en güncel kayıt gösterilir. diger: tüm liste.
const STANDART_TURLER = ['muayene', 'sigorta', 'kasko', 'arvato_gps']

function BelgeRow({ belge, onEdit }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
      <BelgeDurumBadge durum={belge.durum} kalanGun={belge.kalan_gun} />
      <Typography variant="body2" sx={{ minWidth: 90 }}>
        {belge.bitis_tarihi}
      </Typography>
      {belge.cihaz_no && (
        <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
          Cihaz: {belge.cihaz_no}
        </Typography>
      )}
      <IconButton size="small" onClick={() => onEdit(belge)}>
        <Pencil size={14} />
      </IconButton>
    </Box>
  )
}

function TurSection({ tur, label, belgeler, onEdit, onAdd }) {
  const isStandart = STANDART_TURLER.includes(tur)
  const aktif = isStandart
    ? belgeler.reduce((en, b) => (!en || b.bitis_tarihi > en.bitis_tarihi ? b : en), null)
    : null
  const liste = isStandart ? (aktif ? [aktif] : []) : belgeler

  return (
    <Paper variant="outlined" sx={{ px: 2, py: 1.5, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: liste.length ? 0.5 : 0 }}>
        <Typography variant="caption" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.6, color: 'text.secondary' }}>
          {label}
        </Typography>
        <Button size="small" startIcon={<Plus size={14} />} onClick={() => onAdd(tur)}
          sx={{ textTransform: 'none', py: 0.25 }}>
          {isStandart && aktif ? 'Yenile' : 'Ekle'}
        </Button>
      </Box>

      {liste.length > 0 ? (
        <>
          {liste.map((b, i) => (
            <Box key={b.id}>
              {i > 0 && <Divider sx={{ my: 0.5 }} />}
              <BelgeRow belge={b} onEdit={onEdit} />
            </Box>
          ))}
        </>
      ) : (
        <Typography variant="body2" color="text.disabled" sx={{ py: 0.5 }}>
          Kayıt yok
        </Typography>
      )}
    </Paper>
  )
}

export default function AracBelgeleriDialog({ arac, open, onClose }) {
  const [modal, setModal] = useState(null) // { belgeTuru, belge|null }

  const { data: belgeler = [], isLoading } = useBelgeler(open ? arac?.id : null)

  const byTur = BELGE_TURLERI.reduce((acc, t) => {
    acc[t.value] = belgeler.filter(b => b.belge_turu === t.value)
    return acc
  }, {})

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>Belgeler</Typography>
            <Typography variant="caption" color="text.secondary" fontFamily="monospace">
              {arac?.plaka}
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose}><X size={16} /></IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, py: 2 }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={28} />
            </Box>
          ) : (
            BELGE_TURLERI.map(({ value, label }) => (
              <TurSection
                key={value}
                tur={value}
                label={label}
                belgeler={byTur[value]}
                onEdit={(belge) => setModal({ belgeTuru: value, belge })}
                onAdd={(tur) => setModal({ belgeTuru: tur, belge: null })}
              />
            ))
          )}
        </DialogContent>
      </Dialog>

      {modal && (
        <BelgeFormModal
          open
          onClose={() => setModal(null)}
          aracId={arac?.id}
          aracPlaka={arac?.plaka}
          belgeTuru={modal.belgeTuru}
          belge={modal.belge}
          onSaved={() => setModal(null)}
        />
      )}
    </>
  )
}
