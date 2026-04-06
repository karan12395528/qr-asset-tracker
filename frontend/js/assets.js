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

function closeModal(id) { document.getElementById(id).classList.remove('show'); }
function openAddModal() { document.getElementById('addModal').classList.add('show'); }

if (!getToken()) window.location.href = 'index.html';
const user = getUser();
document.getElementById('userName').textContent = user.name || 'User';
document.getElementById('userRole').textContent = user.role || 'staff';
document.getElementById('userInitial').textContent = (user.name || 'U')[0].toUpperCase();

let allAssets = [];

function formatDate(d) { return d ? new Date(d).toLocaleDateString() : '—'; }

async function loadAssets() {
  try {
    const res = await authFetch(`${API}/assets`);
    if (!res.ok) throw new Error('Failed to load');
    allAssets = await res.json();
    populateCategoryFilter();
    renderAssets(allAssets);
  } catch (err) {
    showToast('Failed to load assets', 'error');
  }
}

function populateCategoryFilter() {
  const cats = [...new Set(allAssets.map(a => a.category))].filter(Boolean);
  const sel = document.getElementById('categoryFilter');
  sel.innerHTML = '<option value="">All Categories</option>' + cats.map(c => `<option value="${c}">${c}</option>`).join('');
}

function filterAssets() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const status = document.getElementById('statusFilter').value;
  const category = document.getElementById('categoryFilter').value;
  const filtered = allAssets.filter(a =>
    (!search || a.name.toLowerCase().includes(search) || a.tag.toLowerCase().includes(search) || (a.location || '').toLowerCase().includes(search)) &&
    (!status || a.status === status) &&
    (!category || a.category === category)
  );
  renderAssets(filtered);
}

function renderAssets(assets) {
  const tbody = document.getElementById('assetsBody');
  if (assets.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">🗂️</div><h3>No assets found</h3></div></td></tr>`;
    return;
  }
  tbody.innerHTML = assets.map(a => `
    <tr>
      <td class="primary">${a.name}</td>
      <td><code style="font-size:12px;background:var(--bg-secondary);padding:2px 8px;border-radius:4px;color:var(--accent)">${a.tag}</code></td>
      <td>${a.category || '—'}</td>
      <td>${a.location || '—'}</td>
      <td><span class="badge ${a.status === 'available' ? 'badge-available' : 'badge-checkedout'}">${a.status === 'available' ? 'Available' : 'Checked Out'}</span></td>
      <td>${formatDate(a.created_at)}</td>
      <td>
        <div style="display:flex;gap:6px">
          <button class="btn btn-outline btn-sm" onclick="viewQR('${a.tag}','${a.name}')">📱 QR</button>
          <button class="btn btn-outline btn-sm" onclick="openEditModal(${a.id},'${a.name.replace(/'/g,"\\'")}','${(a.category||'').replace(/'/g,"\\'")}','${(a.location||'').replace(/'/g,"\\'")}','${(a.description||'').replace(/'/g,"\\'")}')">✏️</button>
          <button class="btn btn-danger btn-sm" onclick="deleteAsset(${a.id})">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('');
}

async function addAsset() {
  const name = document.getElementById('assetName').value.trim();
  const category = document.getElementById('assetCategory').value.trim() || 'General';
  const location = document.getElementById('assetLocation').value.trim() || 'Main Office';
  const description = document.getElementById('assetDescription').value.trim();
  if (!name) return showToast('Asset name is required', 'error');

  try {
    const res = await authFetch(`${API}/assets`, {
      method: 'POST',
      body: JSON.stringify({ name, category, location, description })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to add asset');

    showToast(`Asset "${name}" created with tag ${data.tag}!`, 'success');
    closeModal('addModal');
    ['assetName','assetCategory','assetLocation','assetDescription'].forEach(id => document.getElementById(id).value = '');
    await loadAssets();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function openEditModal(id, name, category, location, description) {
  document.getElementById('editAssetId').value = id;
  document.getElementById('editName').value = name;
  document.getElementById('editCategory').value = category;
  document.getElementById('editLocation').value = location;
  document.getElementById('editDescription').value = description;
  document.getElementById('editModal').classList.add('show');
}

async function saveEdit() {
  const id = document.getElementById('editAssetId').value;
  const name = document.getElementById('editName').value.trim();
  const category = document.getElementById('editCategory').value.trim();
  const location = document.getElementById('editLocation').value.trim();
  const description = document.getElementById('editDescription').value.trim();
  if (!name) return showToast('Asset name is required', 'error');

  try {
    const res = await authFetch(`${API}/assets/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name, category, location, description })
    });
    if (!res.ok) throw new Error('Update failed');
    showToast('Asset updated!', 'success');
    closeModal('editModal');
    await loadAssets();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteAsset(id) {
  if (!confirm('Are you sure you want to delete this asset?')) return;
  try {
    const res = await authFetch(`${API}/assets/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Delete failed');
    showToast('Asset deleted', 'success');
    await loadAssets();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

let currentQrImage = null;
async function viewQR(tag, name) {
  try {
    const res = await authFetch(`${API}/qr/${tag}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    currentQrImage = data.qr;
    document.getElementById('qrImage').src = data.qr;
    document.getElementById('qrAssetName').textContent = name;
    document.getElementById('qrTagDisplay').textContent = tag;
    document.getElementById('qrModal').classList.add('show');
  } catch (err) {
    showToast('Failed to load QR code', 'error');
  }
}

function downloadQR() {
  if (!currentQrImage) return;
  const a = document.createElement('a');
  a.href = currentQrImage;
  a.download = `QR-${document.getElementById('qrTagDisplay').textContent}.png`;
  a.click();
}

// Close modals on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.classList.remove('show');
  });
});

loadAssets();
