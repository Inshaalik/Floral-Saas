// login/login.js

// Example: Simple login simulation
const loginForm = document.getElementById('loginForm');

loginForm?.addEventListener('submit', (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  // TODO: Replace with real authentication
  if (email && password) {
    // Save user session in localStorage (for demo purposes)
    localStorage.setItem('currentUser', JSON.stringify({ email }));
    alert(`Logged in as ${email}`);
    // Redirect based on role (owner or sub-user)
    window.location.href = 'flowerCalculator.html';
  } else {
    alert('Please enter email and password');
  }
});
