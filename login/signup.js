import { supabase } from '../js/supabaseClient.js';

const signupForm = document.getElementById('signupForm');

signupForm?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const fullName = document.getElementById('fullName').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const shopName = document.getElementById('shopName').value.trim();

  // 1️⃣ Sign up user
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
  if (signUpError) return alert(signUpError.message);

  const userId = signUpData.user.id;

  // 2️⃣ Sign in immediately
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) return alert(signInError.message);

  // 3️⃣ Insert profile (now user is authenticated)
  const { error: profileError } = await supabase.from('profiles').insert([{
    id: userId,
    email,
    full_name: fullName
  }]);
  if (profileError) return alert("Profile creation failed: " + profileError.message);

  // 4️⃣ Create tenant (shop)
  const { data: tenantData, error: tenantError } = await supabase
    .from('tenants')
    .insert([{ name: shopName, slug: shopName.toLowerCase().replace(/\s+/g, '-') }])
    .select()
    .single();
  if (tenantError) return alert(tenantError.message);

  // 5️⃣ Create membership (owner)
  await supabase.from('memberships').insert([{
    tenant_id: tenantData.id,
    user_id: userId,
    role: 'owner'
  }]);

  // 6️⃣ Store tenantId & redirect
  localStorage.setItem('tenantId', tenantData.id);
  alert('Sign up successful! You are now the owner of your shop.');
  window.location.href = '../flowerCalculator.html';
});
