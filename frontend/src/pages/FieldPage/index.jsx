import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchCekiciler, fetchDorseler } from '../../services/araclar'
import { fetchActiveSoforler } from '../../services/soforler'
import { fetchRecentTrips, deleteTrip } from '../../services/trips'
import TripForm from '../../components/TripForm'
import RecentTripsList from '../../components/RecentTripsList'

import {
  Container,
  Box,
  Typography,
  Alert,
  Paper,
  CircularProgress,
  Button
} from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'

export default function FieldPage() {
  const [cekiciler, setCekiciler] = useState([])
  const [dorseler, setDorseler] = useState([])
  const [soforler, setSoforler] = useState([])
  const [trips, setTrips] = useState([])
  const [loadingData, setLoadingData] = useState(true)
  const [loadingTrips, setLoadingTrips] = useState(true)
  const [error, setError] = useState(null)
  const [editingTrip, setEditingTrip] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const formRef = useRef(null)

  useEffect(() => {
    Promise.all([fetchCekiciler(true), fetchDorseler(true), fetchActiveSoforler()])
      .then(([c, d, s]) => { setCekiciler(c); setDorseler(d); setSoforler(s) })
      .catch((err) => setError(err.message))
      .finally(() => setLoadingData(false))
  }, [])

  const refreshTrips = useCallback(() => {
    setLoadingTrips(true)
    fetchRecentTrips()
      .then(setTrips)
      .catch((err) => setError(err.message))
      .finally(() => setLoadingTrips(false))
  }, [])

  useEffect(() => { refreshTrips() }, [refreshTrips])

  function handleEdit(trip) {
    setEditingTrip(trip)
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function handleEditDone() {
    setEditingTrip(null)
    refreshTrips()
  }

  async function handleDelete(id) {
    if (!window.confirm('Bu sefer kaydı silinecek. Emin misiniz?')) return
    setDeletingId(id)
    try {
      await deleteTrip(id)
      setTrips((prev) => prev.filter((t) => t.id !== id))
    } catch (err) {
      setError(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Container maxWidth="sm" sx={{ py: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h5" component="h1" fontWeight="bold" color="text.primary">
            Sefer Girişi
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            Yeni sefer ekle veya mevcut seferi düzenle
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Paper
        ref={formRef}
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        {loadingData ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 6, gap: 2 }}>
            <CircularProgress size={32} />
            <Typography variant="body2" color="text.secondary">
              Araç listesi yükleniyor...
            </Typography>
          </Box>
        ) : (
          <TripForm
            cekiciler={cekiciler}
            dorseler={dorseler}
            soforler={soforler}
            editingTrip={editingTrip}
            onEditDone={handleEditDone}
            onTripSaved={refreshTrips}
          />
        )}
      </Paper>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1 }}>
        <Box>
          <Typography variant="subtitle2" fontWeight="bold" color="text.primary">
            Son Seferler
          </Typography>
          {!loadingTrips && trips.length > 0 && (
            <Typography variant="caption" color="text.secondary">
              {trips.length} kayıt gösteriliyor
            </Typography>
          )}
        </Box>
        <Button
          onClick={refreshTrips}
          startIcon={<RefreshIcon />}
          size="small"
          variant="outlined"
          sx={{ textTransform: 'none', borderRadius: 2 }}
        >
          Yenile
        </Button>
      </Box>

      <RecentTripsList
        trips={trips}
        loading={loadingTrips}
        onEdit={handleEdit}
        onDelete={handleDelete}
        deletingId={deletingId}
      />
    </Container>
  )
}
