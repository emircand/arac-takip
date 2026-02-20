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

export async function fetchTripsWithVehicles(startDate, endDate) {
  let query = supabase
    .from('seferler')
    .select('*, araclar(plaka, sofor_adi, ilce, arac_tipi)')
    .order('tarih', { ascending: false })

  if (startDate) query = query.gte('tarih', startDate)
  if (endDate) query = query.lte('tarih', endDate)

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function fetchTodayTrips() {
  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('seferler')
    .select('id, tonaj')
    .eq('tarih', today)
  if (error) throw error
  return data
}
