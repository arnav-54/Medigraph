/**
 * Standardized API client for MediGraph AI with credentials, auto-refresh, and correlation tracking.
 */
let isRefreshing = false;

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

function formatUrl(endpoint) {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE}${cleanEndpoint}`;
}

export async function apiRequest(endpoint, options = {}, isRetry = false) {
  const correlationId = 'client-' + Math.random().toString(36).substring(2, 12);
  const token = typeof window !== 'undefined' ? localStorage.getItem('medigraph_token') : null;

  const headers = {
    'X-Correlation-ID': correlationId,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  // If body is not FormData, default to application/json
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    options.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
  }

  const targetUrl = formatUrl(endpoint);
  const response = await fetch(targetUrl, {
    ...options,
    headers,
    credentials: 'include' // sends HttpOnly session cookies
  });

  // Attempt automatic session refresh on 401 if not already refreshing and not auth routes
  if (response.status === 401 && !isRetry && !endpoint.includes('/api/v1/auth/login') && !endpoint.includes('/api/v1/auth/refresh')) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshRes = await fetch(formatUrl('/api/v1/auth/refresh'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });
        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          const newToken = refreshData.data?.tokens?.accessToken;
          if (newToken && typeof window !== 'undefined') {
            localStorage.setItem('medigraph_token', newToken);
            isRefreshing = false;
            return apiRequest(endpoint, options, true);
          }
        }
      } catch {
        // Refresh failed, proceed to handle original 401
      } finally {
        isRefreshing = false;
      }
    }
  }

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const errorMsg = data?.error?.message || data?.message || `Request failed with status ${response.status}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.code = data?.error?.code || 'UNKNOWN_ERROR';
    err.details = data?.error?.details || null;
    throw err;
  }

  return data;
}

export const api = {
  get: (url, options) => apiRequest(url, { ...options, method: 'GET' }),
  post: (url, body, options) => apiRequest(url, { ...options, method: 'POST', body }),
  patch: (url, body, options) => apiRequest(url, { ...options, method: 'PATCH', body }),
  delete: (url, options) => apiRequest(url, { ...options, method: 'DELETE' })
};

