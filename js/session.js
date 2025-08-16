// js/session.js

// Get current user from localStorage
const currentUser = JSON.parse(localStorage.getItem('currentUser'));

// Function to restrict access
function requireRole(allowedRoles = []) {
  if (!currentUser || !allowedRoles.includes(currentUser.role)) {
    alert("You do not have access to this page.");
    // Redirect to login page
    window.location.href = '../login/login.html';
  }
}
