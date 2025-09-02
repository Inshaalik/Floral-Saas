import { supabase } from '../js/supabaseClient.js';

const signupForm = document.getElementById('signupForm');

signupForm?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const fullName = document.getElementById('fullName').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const shopName = document.getElementById('shopName').value.trim();

  // 1. Sign up user with Supabase Auth
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    alert(error.message);
    return;
  }

  const userId = data.user.id;

  // 2. Create profile
  await supabase.from('profiles').insert([{ id: userId, email, full_name: fullName }]);

  // 3. Create tenant (shop)
  const { data: tenantData, error: tenantError } = await supabase
    .from('tenants')
    .insert([{ name: shopName, slug: shopName.toLowerCase().replace(/\s+/g, '-') }])
    .select()
    .single();

  if (tenantError) {
    alert(tenantError.message);
    return;
  }

  // 4. Create membership (owner)
  await supabase.from('memberships').insert([{
    tenant_id: tenantData.id,
    user_id: userId,
    role: 'owner'
  }]);

  // 5. Store tenantId and redirect
  localStorage.setItem('tenantId', tenantData.id);
  alert('Sign up successful! You are now the owner of your shop.');
  window.location.href = '../flowerCalculator.html';
});