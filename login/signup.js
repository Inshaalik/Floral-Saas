import { supabase } from '../js/supabaseClient.js';

const signupForm = document.getElementById('signupForm');

signupForm?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const fullName = document.getElementById('fullName').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const shopName = document.getElementById('shopName').value.trim();

  try {
    // 1️⃣ Sign up user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError) throw signUpError;

    const userId = signUpData.user.id;

    // 2️⃣ Sign in immediately
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) throw signInError;

    // 3️⃣ Insert profile
    const { error: profileError } = await supabase.from('profiles').insert([{
      id: userId,
      email,
      full_name: fullName
    }]);
    if (profileError) throw profileError;

    // 4️⃣ Create tenant with owner_id
    const { data: tenantData, error: tenantError } = await supabase
      .from('tenants')
      .insert([{
        name: shopName,
        slug: shopName.toLowerCase().replace(/\s+/g, '-'),
        owner_id: userId
      }])
      .select()
      .single();
    if (tenantError) throw tenantError;

    // 5️⃣ Create membership
    const { error: membershipError } = await supabase.from('memberships').insert([{
      tenant_id: tenantData.id,
      user_id: userId,
      role: 'owner'
    }]);
    if (membershipError) throw membershipError;

    // 6️⃣ Store tenantId and redirect
    localStorage.setItem('tenantId', tenantData.id);
    alert('Sign up successful! You are now the owner of your shop.');
    window.location.href = '../flowerCalculator.html';

  } catch (err) {
    alert(err.message);
  }
});
