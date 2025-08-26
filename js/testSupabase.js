import { supabase } from './supabaseClient.js';

export async function getFlowers() {
  const { data, error } = await supabase
    .from('flowers')
    .select('id, name, wholesale, markup, retail'); // include retail
  if (error) {
    console.error('Error fetching flowers:', error);
    return [];
  }
  return data;
}
