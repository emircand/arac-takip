import Chip from '@mui/material/Chip'

const DURUM_COLOR = {
  valid:    'success',
  warning:  'warning',
  critical: 'error',
  expired:  'default',
}

const DURUM_LABEL = {
  valid:    'Geçerli',
  warning:  'Uyarı',
  critical: 'Kritik',
  expired:  'Süresi Doldu',
}

export default function BelgeDurumBadge({ durum, kalanGun, size = 'small' }) {
  const color = DURUM_COLOR[durum] ?? 'default'
  const label = DURUM_LABEL[durum] ?? durum

  const suffix =
    durum === 'expired' && kalanGun !== undefined
      ? ` (${Math.abs(kalanGun)}g geçti)`
      : kalanGun !== undefined
      ? ` (${kalanGun}g)`
      : ''

  return (
    <Chip
      label={label + suffix}
      color={color}
      size={size}
      sx={{ fontWeight: 700, fontSize: 11 }}
    />
  )
}
