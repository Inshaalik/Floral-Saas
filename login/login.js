// login/login.js

// Hardcoded users for demo purposes
  const users = [
    { email: "owner@flowershop1.com", password: "owner123", role: "owner", tenantId: "shop1" },
    { email: "subuser1@flowershop1.com", password: "sub123", role: "sub-user", tenantId: "shop1" },
    { email: "subuser2@flowershop1.com", password: "sub456", role: "sub-user", tenantId: "shop1" },
    { email: "owner@flowershop2.com", password: "owner789", role: "owner", tenantId: "shop2" },
    { email: "subuser1@flowershop2.com", password: "sub789", role: "sub-user", tenantId: "shop2" }

];

const loginForm = document.getElementById('loginForm');

loginForm?.addEventListener('submit', (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  // Check credentials against hardcoded users
  const user = users.find(u => u.email === email && u.password === password);

  if (user) {
    // Save user session in localStorage
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('tenantId', user.tenantId); // <-- Add this line
      alert(`Logged in as ${user.email} (${user.role})`);
    
      // Redirect based on role
      if (user.role === "owner" || user.role === "sub-user") {
        window.location.href = '../flowerCalculator.html';
      }
      } else {
  alert('Invalid email or password');
}
    }

);
