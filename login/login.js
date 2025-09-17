import { supabase } from '../js/supabaseClient.js';

const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');

// ----- Helper: Redirect based on role -----
function redirectByRole(role) {
  if (role === 'owner') {
    window.location.href = '../owner/ownerDashboard.html';
  } else {
    window.location.href = '../flowerCalculator.html';
  }
}

// ----- Auto-redirect if already logged in -----
async function checkSession() {
  const { data: { session } } = await supabase.auth.getSession();

  if (session?.user) {
    try {
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

      redirectByRole(role);
    } catch (err) {
      console.error('Session redirect failed:', err);
    }
  }
}

// Run auto-redirect on page load
//checkSession();

// ----- Login Form Submit -----
loginForm?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    alert('Please enter both email and password.');
    return;
  }

  try {
    // Supabase Auth login
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      alert('Invalid email or password');
      return;
    }

    const userId = data.user.id;

    // Fetch membership for tenant and role
    const { data: memberships, error: membershipError } = await supabase
      .from('memberships')
      .select('tenant_id, role')
      .eq('user_id', userId);

    if (membershipError || !memberships || memberships.length === 0) {
      alert('No shop membership found for this user.');
      return;
    }

    const role = memberships[0].role;
    localStorage.setItem('tenantId', memberships[0].tenant_id);
    localStorage.setItem('role', role);

   // alert(`Logged in as ${email} (${role})`);//

    // Redirect based on role
    redirectByRole(role);

  } catch (err) {
    console.error('Login failed:', err);
    alert('Login failed. Please try again.');
  }
});
