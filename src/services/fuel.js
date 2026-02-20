import { supabase } from '../lib/supabaseClient'

export async function createFuelEntry(entry) {
  const { data, error } = await supabase
    .from('yakitlar')
    .insert([entry])
    .select()
    .single()
  if (error) throw error
  return data
}
