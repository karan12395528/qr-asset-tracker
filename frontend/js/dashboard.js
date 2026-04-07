const API = 'https://qr-asset-tracker-1.onrender.com/api';

function getToken() { return localStorage.getItem('token'); }
function getUser() { return JSON.parse(localStorage.getItem('user') || '{}'); }

function logout() {
  localStorage.clear();
  window.location.href = 'index.html';
}

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
if (!getToken()) window.location.href = 'index.html';

// Set user info in sidebar
const user = getUser();
document.getElementById('userName').textContent = user.name || 'User';
document.getElementById('userRole').textContent = user.role || 'staff';
document.getElementById('userInitial').textContent = (user.name || 'U')[0].toUpperCase();

async function loadDashboard() {
  try {
    const res = await authFetch(`${API}/dashboard/stats`);
    if (!res.ok) throw new Error('Failed to load stats');
    const data = await res.json();

    document.getElementById('totalAssets').textContent = data.totalAssets ?? 0;
    document.getElementById('availableAssets').textContent = data.available ?? 0;
    document.getElementById('checkedOutAssets').textContent = data.checkedOut ?? 0;
    document.getElementById('totalUsers').textContent = data.totalUsers ?? 0;

    // Recent activity
    const activityEl = document.getElementById('activityList');
    if (!data.recentActivity || data.recentActivity.length === 0) {
      activityEl.innerHTML = `<div class="empty-state"><div class="empty-icon">📋</div><h3>No activity yet</h3></div>`;
    } else {
      const actionColors = { CHECKOUT: 'amber', RETURN: 'green', ASSET_CREATED: 'indigo', ASSET_UPDATED: 'blue' };
      const actionIcons = { CHECKOUT: '🔄', RETURN: '↩', ASSET_CREATED: '➕', ASSET_UPDATED: '✏️' };
      activityEl.innerHTML = data.recentActivity.map(item => `
        <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border)">
          <span style="font-size:20px">${actionIcons[item.action] || '📌'}</span>
          <div style="flex:1;min-width:0">
            <div style="font-size:13px;font-weight:600;color:var(--text-primary)">${item.details || item.action}</div>
            <div style="font-size:11px;color:var(--text-muted)">by ${item.performed_by || 'System'} · ${new Date(item.timestamp).toLocaleString()}</div>
          </div>
          <span class="badge badge-${actionColors[item.action] || 'available'}" style="flex-shrink:0">${item.action}</span>
        </div>
      `).join('');
    }

    // Categories
    const catEl = document.getElementById('categoriesList');
    if (!data.categories || data.categories.length === 0) {
      catEl.innerHTML = `<div class="empty-state"><div class="empty-icon">🗂️</div><h3>No categories yet</h3></div>`;
    } else {
      const total = data.categories.reduce((s, c) => s + c.count, 0);
      catEl.innerHTML = data.categories.map(cat => `
        <div style="margin-bottom:14px">
          <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:5px">
            <span style="font-weight:600;color:var(--text-primary)">${cat.category}</span>
            <span style="color:var(--text-muted)">${cat.count} assets</span>
          </div>
          <div style="background:var(--bg-secondary);border-radius:999px;height:6px;overflow:hidden">
            <div style="height:100%;width:${Math.round((cat.count/total)*100)}%;background:linear-gradient(90deg,var(--accent),#8b5cf6);border-radius:999px;transition:width 0.5s ease"></div>
          </div>
        </div>
      `).join('');
    }
  } catch (err) {
    showToast('Failed to load dashboard data', 'error');
  }
}

loadDashboard();
