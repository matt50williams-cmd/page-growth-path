const API_BASE = import.meta.env.VITE_API_URL || 'https://pageaudit-engine.onrender.com';

function getToken() { return localStorage.getItem('pageaudit_token'); }
function setToken(token) { localStorage.setItem('pageaudit_token', token); }
function clearToken() { localStorage.removeItem('pageaudit_token'); }

async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (response.status === 401) {
    clearToken();
    const publicPaths = ['/', '/submit-your-page', '/analyzing', '/audit-preview', '/privacy', '/terms'];
    if (!publicPaths.includes(window.location.pathname)) {
      window.location.href = '/';
    }
    throw new Error('Session expired. Please log in again.');
  }
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || data.message || `API error: ${response.status}`);
  return data;
}

export const auth = {
  async signup(email, password, fullName) {
    const data = await apiFetch('/api/auth/signup', { method: 'POST', body: JSON.stringify({ email, password, full_name: fullName }) });
    if (data.token) setToken(data.token);
    return data;
  },
  async login(email, password) {
    const data = await apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    if (data.token) setToken(data.token);
    return data;
  },
  async me() { return await apiFetch('/api/auth/me'); },
  logout(redirectTo = '/') { clearToken(); if (redirectTo) window.location.href = redirectTo; },
  isLoggedIn() { return !!getToken(); },
  redirectToLogin(returnTo) {
    if (returnTo) localStorage.setItem('pageaudit_return_to', returnTo);
    window.location.href = '/login';
  },
};

export const audits = {
  async create(auditData) { return await apiFetch('/api/audits', { method: 'POST', body: JSON.stringify(auditData) }); },
  async run(auditId) { return await apiFetch(`/api/audits/${auditId}/run`, { method: 'POST' }); },
  async get(auditId) { return await apiFetch(`/api/audits/${auditId}`); },
  async list() { return await apiFetch('/api/audits'); },
  async filter(filters) {
    if (filters.id) { const audit = await apiFetch(`/api/audits/${filters.id}`); return [audit]; }
    return await apiFetch('/api/audits');
  },
};

export const payments = {
  async createCheckout(auditId, email, customerName) {
    return await apiFetch('/api/stripe/checkout', { method: 'POST', body: JSON.stringify({ audit_id: auditId, email, customer_name: customerName }) });
  },
  async createSubscription(email, customerName, auditId) {
    return await apiFetch('/api/stripe/subscribe', { method: 'POST', body: JSON.stringify({ email, customer_name: customerName, audit_id: auditId }) });
  },
  async verifyPayment(sessionId) { return await apiFetch(`/api/stripe/verify/${sessionId}`); },
};

export const funnel = {
  async track(eventType, data = {}) {
    try {
      return await apiFetch('/api/funnel/track', { method: 'POST', body: JSON.stringify({ event_type: eventType, ...data }) });
    } catch (err) { console.error(`Failed to track ${eventType}:`, err); }
  },
};

export const admin = {
  async getAudits(filters = {}) { const params = new URLSearchParams(filters).toString(); return await apiFetch(`/api/admin/audits?${params}`); },
  async getFunnel(days = 30) { return await apiFetch(`/api/admin/funnel?days=${days}`); },
  async getRevenue(days = 30) { return await apiFetch(`/api/admin/revenue?days=${days}`); },
  async getOverview() { return await apiFetch('/api/admin/overview'); },
};

const api = { auth, audits, payments, funnel, admin };
export default api;