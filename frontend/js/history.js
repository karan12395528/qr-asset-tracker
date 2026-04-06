const API = 'http://localhost:5000/api';

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
  setTimeout(() => toast.remove(), 4500);
}

function authFetch(url, options = {}) {
  return fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}`, ...options.headers }
  });
}

if (!getToken()) window.location.href = 'index.html';
const user = getUser();
document.getElementById('userName').textContent = user.name || 'User';
document.getElementById('userRole').textContent = user.role || 'staff';
document.getElementById('userInitial').textContent = (user.name || 'U')[0].toUpperCase();

let allHistory = [];

const actionIcons = { CHECKOUT: '🔄', RETURN: '↩', ASSET_CREATED: '➕', ASSET_UPDATED: '✏️', ASSET_DELETED: '🗑️' };
const actionColors = { CHECKOUT: '#f59e0b', RETURN: '#22c55e', ASSET_CREATED: '#6366f1', ASSET_UPDATED: '#38bdf8', ASSET_DELETED: '#ef4444' };

async function loadHistory() {
  const from = document.getElementById('fromDate').value;
  const to = document.getElementById('toDate').value;
  let url = `${API}/dashboard/audit?`;
  if (from) url += `from=${from}&`;
  if (to) url += `to=${to}T23:59:59&`;

  try {
    const res = await authFetch(url);
    if (!res.ok) throw new Error('Failed to load history');
    allHistory = await res.json();
    filterHistory();
  } catch(err) {
    showToast('Failed to load audit history', 'error');
  }
}

function filterHistory() {
  const search = document.getElementById('historySearch').value.toLowerCase();
  const filtered = allHistory.filter(item =>
    !search ||
    (item.asset_name || '').toLowerCase().includes(search) ||
    (item.performed_by || '').toLowerCase().includes(search) ||
    (item.action || '').toLowerCase().includes(search) ||
    (item.details || '').toLowerCase().includes(search) ||
    (item.tag || '').toLowerCase().includes(search)
  );
  renderHistory(filtered);
}

function renderHistory(records) {
  const tbody = document.getElementById('historyBody');
  const emptyEl = document.getElementById('historyEmpty');

  if (records.length === 0) {
    tbody.innerHTML = '';
    emptyEl.style.display = 'block';
    document.querySelector('.table-wrapper').style.display = 'none';
    return;
  }

  emptyEl.style.display = 'none';
  document.querySelector('.table-wrapper').style.display = 'block';

  tbody.innerHTML = records.map(item => `
    <tr>
      <td style="white-space:nowrap;font-size:12px">${new Date(item.timestamp).toLocaleString()}</td>
      <td>
        <span style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:999px;font-size:11px;font-weight:700;background:${actionColors[item.action]}22;color:${actionColors[item.action]}">
          ${actionIcons[item.action] || '📌'} ${item.action}
        </span>
      </td>
      <td class="primary">${item.asset_name || '—'}</td>
      <td><code style="font-size:11px;background:var(--bg-secondary);padding:2px 7px;border-radius:4px;color:var(--accent)">${item.tag || '—'}</code></td>
      <td>${item.performed_by || 'System'}</td>
      <td style="max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px">${item.details || '—'}</td>
    </tr>
  `).join('');
}

function clearFilters() {
  document.getElementById('historySearch').value = '';
  document.getElementById('fromDate').value = '';
  document.getElementById('toDate').value = '';
  loadHistory();
}

loadHistory();
