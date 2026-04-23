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

// Guard
const user = getUser();
if (user.role !== 'superadmin') window.location.href = 'dashboard.html';

document.getElementById('userName').textContent = user.name || 'Master';
document.getElementById('userRole').textContent = user.role;
document.getElementById('userInitial').textContent = '👑';

async function loadOverview() {
  try {
    const res = await authFetch(`${API}/superadmin/overview`);
    if (!res.ok) throw new Error('Forbidden: SuperAdmin access only');
    const data = await res.json();
    renderStats(data.stats);
    renderCompanies(data.companies);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function renderStats(stats) {
  const root = document.getElementById('globalStatsRoot');
  root.innerHTML = `
    <div class="global-card">
      <h3>Companies</h3>
      <div class="val">${stats.totalCompanies}</div>
    </div>
    <div class="global-card">
      <h3>Total Users</h3>
      <div class="val">${stats.totalUsers}</div>
    </div>
    <div class="global-card">
      <h3>Total Assets</h3>
      <div class="val">${stats.totalAssets}</div>
    </div>
    <div class="global-card">
      <h3>Checkouts</h3>
      <div class="val">${stats.totalCheckouts}</div>
    </div>
  `;
}

function renderCompanies(companies) {
  const tbody = document.getElementById('companyTableBody');
  if (companies.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:40px">No companies registered.</td></tr>';
    return;
  }

  tbody.innerHTML = companies.map(c => `
    <tr onclick="viewCompanyData('${c.id}')" style="cursor:pointer" title="Click to view company assets">
      <td class="primary">${c.name}</td>
      <td>${new Date(c.created_at).toLocaleDateString()}</td>
      <td>${c.userCount} Members</td>
      <td>${c.assetCount} Assets</td>
      <td><span class="badge badge-available">Active</span></td>
    </tr>
  `).join('');
}

function viewCompanyData(companyId) {
  window.location.href = `assets.html?viewCompanyId=${companyId}`;
}

loadOverview();
