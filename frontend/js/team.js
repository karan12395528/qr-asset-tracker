const API = 'https://qr-asset-tracker-1.onrender.com/api';

function getToken() { return localStorage.getItem('token'); }
function getUser() { return JSON.parse(localStorage.getItem('user') || '{}'); }
function logout() { localStorage.clear(); window.location.href = 'index.html'; }

function showToast(msg, type = 'info') {
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type]}</span><span class="toast-msg">${msg}</span><button class="toast-close" onclick="this.parentElement.remove()">×</button>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

function authFetch(url, options = {}) {
  return fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}`, ...options.headers }
  });
}

function closeModal(id) { document.getElementById(id).classList.remove('show'); }
function openAddModal() { document.getElementById('addModal').classList.add('show'); }

// Guard
const user = getUser();
if (!getToken()) window.location.href = 'index.html';
if (user.role === 'staff') window.location.href = 'dashboard.html'; // Staff can't be here

// Sidebar & Role visibility
document.getElementById('userName').textContent = user.name || 'User';
document.getElementById('userRole').textContent = user.role || 'staff';
document.getElementById('userInitial').textContent = (user.name || 'U')[0].toUpperCase();

if (user.role === 'superadmin') {
  document.querySelectorAll('.super-only').forEach(el => el.style.display = 'flex');
}

async function loadTeam() {
  try {
    const res = await authFetch(`${API}/auth/users`);
    if (!res.ok) throw new Error('Failed to load team');
    const users = await res.json();
    renderTeam(users);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function renderTeam(users) {
  const tbody = document.getElementById('teamBody');
  if (users.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:40px">No staff found</td></tr>`;
    return;
  }
  tbody.innerHTML = users.map(u => `
    <tr>
      <td class="primary">${u.name}</td>
      <td>${u.email}</td>
      <td><span class="badge badge-${u.role === 'admin' ? 'admin' : 'staff'}">${u.role}</span></td>
      <td>${new Date(u.created_at).toLocaleDateString()}</td>
      <td><span class="badge badge-available">Active</span></td>
    </tr>
  `).join('');
}

async function addStaff() {
  const name = document.getElementById('staffName').value.trim();
  const email = document.getElementById('staffEmail').value.trim();
  const password = document.getElementById('staffPassword').value;

  if (!name || !email || !password) return showToast('All fields required', 'error');

  try {
    const res = await authFetch(`${API}/auth/staff`, {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to add staff');

    showToast(`Staff account for ${name} created!`, 'success');
    closeModal('addModal');
    ['staffName', 'staffEmail', 'staffPassword'].forEach(id => document.getElementById(id).value = '');
    await loadTeam();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Close modals on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.classList.remove('show');
  });
});

loadTeam();
