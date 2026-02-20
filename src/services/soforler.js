import { supabase } from '../lib/supabaseClient'

export async function fetchActiveSoforler() {
  const { data, error } = await supabase
    .from('soforler')
    .select('id, ad_soyad')
    .eq('aktif', true)
    .order('ad_soyad')
  if (error) throw error
  return data
}

export async function fetchAllSoforler() {
  const { data, error } = await supabase
    .from('soforler')
    .select('*')
    .order('ad_soyad')
  if (error) throw error
  return data
}

export async function createSofor(payload) {
  const { data, error } = await supabase
    .from('soforler')
    .insert([payload])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateSofor(id, payload) {
  const { data, error } = await supabase
    .from('soforler')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function toggleSoforActive(id, aktif) {
  return updateSofor(id, { aktif })
}
