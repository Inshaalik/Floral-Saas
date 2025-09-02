import { supabase } from '../js/supabaseClient.js';

const signupForm = document.getElementById('signupForm');

signupForm?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const fullName = document.getElementById('fullName').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const shopName = document.getElementById('shopName')?.value.trim(); // shopName only for owners

  // check invite from URL
  const params = new URLSearchParams(window.location.search);
  const inviteCode = params.get('invite');

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

    if (inviteCode) {
      // 4️⃣ Handle invited sub-user
      const { data: inviteData, error: inviteError } = await supabase
        .from('subuser_invites')
        .select('*')
        .eq('code', inviteCode)
        .single();

      if (inviteError || !inviteData) {
        throw new Error("Invalid or expired invite link.");
      }

      // Create membership for this tenant
      const { error: membershipError } = await supabase.from('memberships').insert([{
        tenant_id: inviteData.tenant_id,
        user_id: userId,
        role: 'user' // default sub-user role
      }]);
      if (membershipError) throw membershipError;

      // delete invite so it can’t be reused
      await supabase.from('subuser_invites').delete().eq('id', inviteData.id);

      localStorage.setItem('tenantId', inviteData.tenant_id);
      alert("Signup successful! You've been added as a sub-user.");
      window.location.href = '../flowerCalculator.html';

    } else {
      // 5️⃣ Owner flow (no invite)
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

      // create membership for owner
      const { error: membershipError } = await supabase.from('memberships').insert([{
        tenant_id: tenantData.id,
        user_id: userId,
        role: 'owner'
      }]);
      if (membershipError) throw membershipError;

      localStorage.setItem('tenantId', tenantData.id);
      alert('Sign up successful! You are now the owner of your shop.');
      window.location.href = '../flowerCalculator.html';
    }

  } catch (err) {
    alert(err.message);
    console.error(err);
  }
});
