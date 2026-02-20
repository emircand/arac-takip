import { supabase } from '../lib/supabaseClient'

export async function fetchActiveVehicles() {
  const { data, error } = await supabase
    .from('araclar')
    .select('*')
    .eq('aktif', true)
    .order('plaka')
  if (error) throw error
  return data
}

export async function fetchAllVehicles() {
  const { data, error } = await supabase
    .from('araclar')
    .select('*')
    .order('plaka')
  if (error) throw error
  return data
}

export async function createVehicle(vehicle) {
  const { data, error } = await supabase
    .from('araclar')
    .insert([vehicle])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function toggleVehicleActive(id, aktif) {
  const { data, error } = await supabase
    .from('araclar')
    .update({ aktif })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}
