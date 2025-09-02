// js/session.js
import { supabase } from './supabaseClient.js';

// ----- Get current session user -----
export async function getCurrentUser() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;

  // Fetch role and tenant from memberships table
  const { data: memberships } = await supabase
    .from('memberships')
    .select('tenant_id, role')
    .eq('user_id', session.user.id)
    .limit(1);

  if (!memberships || memberships.length === 0) return null;

  const user = {
    id: session.user.id,
    email: session.user.email,
    role: memberships[0].role,
    tenantId: memberships[0].tenant_id
  };

  // Store in localStorage for quick access elsewhere
  localStorage.setItem('currentUser', JSON.stringify(user));
  localStorage.setItem('role', user.role);
  localStorage.setItem('tenantId', user.tenantId);

  return user;
}

// ----- Restrict access by role -----
export async function requireRole(allowedRoles = []) {
  const user = await getCurrentUser();
  if (!user || !allowedRoles.includes(user.role)) {
    alert("You do not have access to this page.");
    window.location.href = '../login/login.html';
  }
  return user;
}
