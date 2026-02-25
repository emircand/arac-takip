import { useState, useEffect, useCallback } from 'react'
import { fetchBelgeOzet, BELGE_TURLERI } from '../../services/aracBelgeler'
import BelgeDurumBadge from '../BelgeDurumBadge'
import BelgeFormModal from '../BelgeFormModal'
import {
  Box, Typography, Paper, Button, CircularProgress,
} from '@mui/material'
import { Pencil, Plus } from 'lucide-react'

const OZET_TURLERI = ['muayene', 'sigorta', 'kasko', 'arvato_gps']

export default function AracBelgeOzet({ aracId, aracPlaka }) {
  const [belgeler, setBelgeler] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // { belgeTuru, belge }

  const load = useCallback(() => {
    if (!aracId) return
    setLoading(true)
    fetchBelgeOzet(aracId)
      .then(setBelgeler)
      .catch(() => setBelgeler([]))
      .finally(() => setLoading(false))
  }, [aracId])

  useEffect(() => { load() }, [load])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress size={28} />
      </Box>
    )
  }

  const byTur = Object.fromEntries(belgeler.map(b => [b.belge_turu, b]))

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {OZET_TURLERI.map(tur => {
          const label = BELGE_TURLERI.find(t => t.value === tur)?.label ?? tur
          const belge = byTur[tur]
          return (
            <Paper
              key={tur}
              variant="outlined"
              sx={{ p: 2, minWidth: 160, flex: '1 1 160px', borderRadius: 3 }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={700}
                sx={{ textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 1 }}
              >
                {label}
              </Typography>
              {belge ? (
                <>
                  <BelgeDurumBadge durum={belge.durum} kalanGun={belge.kalan_gun} />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {belge.bitis_tarihi}
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<Pencil size={14} />}
                    sx={{ mt: 1, textTransform: 'none', px: 0 }}
                    onClick={() => setModal({ belgeTuru: tur, belge })}
                  >
                    Güncelle
                  </Button>
                </>
              ) : (
                <>
                  <Typography variant="body2" color="text.disabled" sx={{ my: 1 }}>
                    Kayıt yok
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<Plus size={14} />}
                    sx={{ mt: 0.5, textTransform: 'none', px: 0 }}
                    onClick={() => setModal({ belgeTuru: tur, belge: null })}
                  >
                    Ekle
                  </Button>
                </>
              )}
            </Paper>
          )
        })}
      </Box>

      {modal && (
        <BelgeFormModal
          open
          onClose={() => setModal(null)}
          aracId={aracId}
          aracPlaka={aracPlaka}
          belgeTuru={modal.belgeTuru}
          belge={modal.belge}
          onSaved={() => { setModal(null); load() }}
        />
      )}
    </Box>
  )
}
