const API = 'http://localhost:5000/api';

// Toast helper
function showToast(msg, type = 'info') {
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type]}</span><span class="toast-msg">${msg}</span><button class="toast-close" onclick="this.parentElement.remove()">×</button>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// Toggle between login and register
function toggleForm() {
  const login = document.getElementById('loginForm');
  const reg = document.getElementById('registerForm');
  login.style.display = login.style.display === 'none' ? 'block' : 'none';
  reg.style.display = reg.style.display === 'none' ? 'block' : 'none';
}

// Login
async function handleLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  if (!email || !password) return showToast('Please fill in all fields', 'error');

  const btn = document.getElementById('loginBtn');
  btn.disabled = true; btn.textContent = 'Signing in...';

  try {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    window.location.href = 'dashboard.html';
  } catch (err) {
    showToast(err.message, 'error');
    btn.disabled = false; btn.textContent = '🔐 Sign In';
  }
}

// Register
async function handleRegister() {
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const role = document.getElementById('regRole').value;
  if (!name || !email || !password) return showToast('Please fill in all fields', 'error');
  if (password.length < 6) return showToast('Password must be at least 6 characters', 'error');

  const btn = document.getElementById('regBtn');
  btn.disabled = true; btn.textContent = 'Creating account...';

  try {
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    window.location.href = 'dashboard.html';
  } catch (err) {
    showToast(err.message, 'error');
    btn.disabled = false; btn.textContent = '✨ Create Account';
  }
}

// Redirect if already logged in
if (localStorage.getItem('token')) {
  window.location.href = 'dashboard.html';
}

// Enter key handler
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const loginVisible = document.getElementById('loginForm').style.display !== 'none';
    if (loginVisible) handleLogin(); else handleRegister();
  }
});
