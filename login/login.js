import { supabase } from '../js/supabaseClient.js';

const loginForm = document.getElementById('loginForm');

loginForm?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  // Supabase Auth login
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    alert('Invalid email or password');
    return;
  }

  const userId = data.user.id;

  // Fetch membership for tenant and role
  const { data: memberships, error: membershipError } = await supabase
    .from('memberships')
    .select('tenant_id, role')
    .eq('user_id', userId);

  if (membershipError) {
    alert('Error fetching membership: ' + membershipError.message);
    return;
  }

  if (!memberships || memberships.length === 0) {
    alert('No shop membership found for this user.');
    return;
  }

  // Use first membership (or handle multiple if needed)
  localStorage.setItem('tenantId', memberships[0].tenant_id);
  localStorage.setItem('role', memberships[0].role);

  alert(`Logged in as ${email} (${memberships[0].role})`);
  window.location.href = '../flowerCalculator.html';
});