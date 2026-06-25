/* ===========================================================
   api.js — Shared frontend API client
   Place this file in your login-page/js/ folder.
   Every page imports it via <script src="js/api.js"></script>
   =========================================================== */

const API_BASE = 'http://localhost:5000/api';

// ─── Token helpers ────────────────────────────────────────
function getToken()            { return localStorage.getItem('fleet_token'); }
function setToken(token)       { localStorage.setItem('fleet_token', token); }
function removeToken()         { localStorage.removeItem('fleet_token'); }
function getUser()             { return JSON.parse(localStorage.getItem('fleet_user') || 'null'); }
function setUser(user)         { localStorage.setItem('fleet_user', JSON.stringify(user)); }
function removeUser()          { localStorage.removeItem('fleet_user'); }

function isLoggedIn() {
  return !!getToken();
}

function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = 'index.html';
  }
}

// ─── Core fetch wrapper ───────────────────────────────────
async function apiFetch(endpoint, options = {}) {
  const token = getToken();

  const headers = {
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Don't set Content-Type for FormData — browser sets it with the boundary.
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (response.status === 401) {
    // Token expired or invalid — force re-login.
    removeToken();
    removeUser();
    window.location.href = 'index.html';
    return;
  }

  if (!response.ok) {
    throw new Error(data.message || 'Request failed.');
  }

  return data;
}

// ─── Auth ─────────────────────────────────────────────────
const Auth = {
  async login(username, password) {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    setToken(data.token);
    setUser(data.user);
    return data;
  },

  logout() {
    removeToken();
    removeUser();
    window.location.href = 'index.html';
  },
};

// ─── Vehicles ─────────────────────────────────────────────
const Vehicles = {
  getAll()        { return apiFetch('/vehicles'); },
  getById(id)     { return apiFetch(`/vehicles/${id}`); },
  create(data)    { return apiFetch('/vehicles', { method: 'POST', body: JSON.stringify(data) }); },
  update(id, data){ return apiFetch(`/vehicles/${id}`, { method: 'PUT', body: JSON.stringify(data) }); },
  delete(id)      { return apiFetch(`/vehicles/${id}`, { method: 'DELETE' }); },
};

// ─── Fuel Entries ─────────────────────────────────────────
const FuelEntries = {
  getAll(params = {}) {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/fuel-entries${query ? '?' + query : ''}`);
  },
  getById(id)  { return apiFetch(`/fuel-entries/${id}`); },
  getStats()   { return apiFetch('/fuel-entries/stats'); },

  create(formData) {
    // formData is a FormData object (includes file)
    return apiFetch('/fuel-entries', { method: 'POST', body: formData });
  },

  update(id, formData) {
    return apiFetch(`/fuel-entries/${id}`, { method: 'PUT', body: formData });
  },

  delete(id) { return apiFetch(`/fuel-entries/${id}`, { method: 'DELETE' }); },
};

// ─── Dashboard stats shortcut ──────────────────────────────
const Dashboard = {
  getStats() { return FuelEntries.getStats(); },
};
