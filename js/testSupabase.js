import { supabase } from './supabaseClient.js'  // adjust path if needed

async function testDB() {
  const { data, error } = await supabase.from('tenants').select('*')
  console.log('Supabase tenants test:', data, error)
}

testDB()
