import { supabase } from '../lib/supabaseClient'

export async function fetchActiveDorseler() {
  const { data, error } = await supabase
    .from('dorseler')
    .select('id, plaka')
    .eq('aktif', true)
    .order('plaka')
  if (error) throw error
  return data
}

export async function fetchAllDorseler() {
  const { data, error } = await supabase
    .from('dorseler')
    .select('*')
    .order('plaka')
  if (error) throw error
  return data
}

export async function createDorse(payload) {
  const { data, error } = await supabase
    .from('dorseler')
    .insert([payload])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateDorse(id, payload) {
  const { data, error } = await supabase
    .from('dorseler')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function toggleDorseActive(id, aktif) {
  return updateDorse(id, { aktif })
}
