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

let html5QrCode = null;
let scannedAsset = null;

function startScanner() {
  const placeholder = document.getElementById('scannerPlaceholder');
  placeholder.style.display = 'none';

  html5QrCode = new Html5Qrcode('qr-reader');
  html5QrCode.start(
    { facingMode: 'environment' },
    { fps: 10, qrbox: { width: 250, height: 250 } },
    onScanSuccess,
    () => {}
  ).then(() => {
    document.getElementById('startScanBtn').style.display = 'none';
    document.getElementById('stopScanBtn').style.display = 'inline-flex';
  }).catch(err => {
    placeholder.style.display = 'flex';
    showToast('Camera access denied or not available. Use manual entry.', 'error');
  });
}

function stopScanner() {
  if (html5QrCode) {
    html5QrCode.stop().then(() => {
      document.getElementById('startScanBtn').style.display = 'inline-flex';
      document.getElementById('stopScanBtn').style.display = 'none';
    });
  }
}

function onScanSuccess(decodedText) {
  stopScanner();
  let tag = decodedText;
  try {
    const parsed = JSON.parse(decodedText);
    tag = parsed.tag || decodedText;
  } catch(e) {}
  lookupAsset(tag);
}

function lookupManualTag() {
  const tag = document.getElementById('manualTag').value.trim();
  if (!tag) return showToast('Please enter a tag', 'error');
  lookupAsset(tag);
}

async function lookupAsset(tag) {
  try {
    const res = await authFetch(`${API}/assets/${tag}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Asset not found');
    scannedAsset = data;
    showAssetResult(data);
    showToast(`Asset found: ${data.name}`, 'success');
  } catch(err) {
    showToast(err.message, 'error');
    hideAssetResult();
  }
}

function showAssetResult(asset) {
  document.getElementById('resultName').textContent = asset.name;
  document.getElementById('resultTag').textContent = asset.tag;
  document.getElementById('resultCategory').textContent = asset.category || '—';
  document.getElementById('resultLocation').textContent = asset.location || '—';
  document.getElementById('resultId').textContent = '#' + asset.id;
  document.getElementById('actionNotes').value = '';

  const statusEl = document.getElementById('resultStatus');
  if (asset.status === 'available') {
    statusEl.innerHTML = '<span class="badge badge-available">Available</span>';
    document.getElementById('checkoutBtn').style.display = 'inline-flex';
    document.getElementById('returnBtn').style.display = 'none';
  } else {
    statusEl.innerHTML = '<span class="badge badge-checkedout">Checked Out</span>';
    document.getElementById('checkoutBtn').style.display = 'none';
    document.getElementById('returnBtn').style.display = 'inline-flex';
  }

  document.getElementById('assetResultSection').style.display = 'block';
  document.getElementById('noResultSection').style.display = 'none';
}

function hideAssetResult() {
  document.getElementById('assetResultSection').style.display = 'none';
  document.getElementById('noResultSection').style.display = 'block';
  scannedAsset = null;
}

async function performCheckout() {
  if (!scannedAsset) return;
  const notes = document.getElementById('actionNotes').value;
  try {
    const res = await authFetch(`${API}/checkout/checkout`, {
      method: 'POST',
      body: JSON.stringify({ tag: scannedAsset.tag, notes })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    showToast(`✅ ${scannedAsset.name} checked out!`, 'success');
    scannedAsset.status = 'checked-out';
    showAssetResult(scannedAsset);
  } catch(err) {
    showToast(err.message, 'error');
  }
}

async function performReturn() {
  if (!scannedAsset) return;
  const notes = document.getElementById('actionNotes').value;
  try {
    const res = await authFetch(`${API}/checkout/return`, {
      method: 'POST',
      body: JSON.stringify({ tag: scannedAsset.tag, notes })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    showToast(`↩ ${scannedAsset.name} returned!`, 'success');
    scannedAsset.status = 'available';
    showAssetResult(scannedAsset);
  } catch(err) {
    showToast(err.message, 'error');
  }
}
