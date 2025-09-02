import { supabase } from '../js/supabaseClient.js';

const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');

// ----- Auto-redirect if already logged in -----
async function checkSession() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) {
    // Fetch membership
    const { data: memberships, error: membershipError } = await supabase
      .from('memberships')
      .select('tenant_id, role')
      .eq('user_id', session.user.id);

    if (membershipError || !memberships || memberships.length === 0) {
      console.error('Membership error:', membershipError);
      return;
    }

    const role = memberships[0].role;
    localStorage.setItem('tenantId', memberships[0].tenant_id);
    localStorage.setItem('role', role);

    if (role === 'owner') {
      window.location.href = '../owner/ownerDashboard.html';
    } else {
      window.location.href = '../flowerCalculator.html';
    }
  }
}

// Run auto-redirect check immediately
checkSession();

// ----- Login Form Submit -----
loginForm?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    alert('Please enter both email and password.');
    return;
  }

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

  const role = memberships[0].role;
  localStorage.setItem('tenantId', memberships[0].tenant_id);
  localStorage.setItem('role', role);

  alert(`Logged in as ${email} (${role})`);

  // Redirect based on role
  if (role === 'owner') {
    window.location.href = '../owner/ownerDashboard.html';
  } else {
    window.location.href = '../flowerCalculator.html';
  }
});
