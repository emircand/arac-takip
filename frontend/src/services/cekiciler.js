import { supabase } from '../lib/supabaseClient'

export async function fetchActiveCekiciler() {
  const { data, error } = await supabase
    .from('cekiciler')
    .select('id, plaka, arac_tipi')
    .eq('aktif', true)
    .order('plaka')
  if (error) throw error
  return data
}

export async function fetchAllCekiciler() {
  const { data, error } = await supabase
    .from('cekiciler')
    .select('*')
    .order('plaka')
  if (error) throw error
  return data
}

export async function createCekici(payload) {
  const { data, error } = await supabase
    .from('cekiciler')
    .insert([payload])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateCekici(id, payload) {
  const { data, error } = await supabase
    .from('cekiciler')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function toggleCekiciActive(id, aktif) {
  return updateCekici(id, { aktif })
}
