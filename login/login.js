// login/login.js

// Hardcoded users for demo purposes
const users = [
  { email: "owner@flowershop.com", password: "owner123", role: "owner" },
  { email: "subuser1@flowershop.com", password: "sub123", role: "sub-user" },
  { email: "subuser2@flowershop.com", password: "sub456", role: "sub-user" }
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
    alert(`Logged in as ${user.email} (${user.role})`);

    // Redirect based on role
    if (user.role === "owner") {
      window.location.href = '../flowerCalculator.html';
    } else if (user.role === "sub-user") {
      window.location.href = '../flowerCalculator.html'; // can later restrict features
    }
  } else {
    alert('Invalid email or password');
  }
});
