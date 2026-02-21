import { supabase } from '../lib/supabaseClient'

export async function createTrip(trip) {
  const { data, error } = await supabase
    .from('seferler')
    .insert([trip])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateTrip(id, payload) {
  const { data, error } = await supabase
    .from('seferler')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteTrip(id) {
  const { error } = await supabase
    .from('seferler')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// Son N sefer — tüm FK alanları dahil (edit için de kullanılır)
export async function fetchRecentTrips(limit = 20) {
  const { data, error } = await supabase
    .from('seferler')
    .select(`
      id, tarih, bolge,
      cekici_id, dorse_id, sofor_id,
      cikis_saati, donus_saati,
      tonaj, cikis_km, donus_km, km,
      sfr_srs, sfr, yakit, notlar,
      cekiciler(plaka), soforler(ad_soyad)
    `)
    .order('tarih', { ascending: false })
    .order('sfr_srs', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data
}

// Dashboard için tarih aralıklı sorgu
export async function fetchTripsForDashboard(startDate, endDate) {
  let query = supabase
    .from('seferler')
    .select(`
      id, tarih, bolge,
      cekici_id, sofor_id,
      tonaj, km, yakit,
      cekiciler(plaka), soforler(ad_soyad)
    `)
    .order('tarih', { ascending: false })

  if (startDate) query = query.gte('tarih', startDate)
  if (endDate) query = query.lte('tarih', endDate)

  const { data, error } = await query
  if (error) throw error
  return data
}

// Bugünün özet istatistikleri (summary cards için)
export async function fetchTodayStats() {
  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('seferler')
    .select('id, tonaj, km, yakit')
    .eq('tarih', today)
  if (error) throw error
  return data
}
