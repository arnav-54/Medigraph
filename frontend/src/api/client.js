/**
 * Standardized API client for MediGraph AI with credentials and correlation tracking.
 */
export async function apiRequest(endpoint, options = {}) {
  const correlationId = 'client-' + Math.random().toString(36).substring(2, 12);

  const headers = {
    'X-Correlation-ID': correlationId,
    ...(options.headers || {})
  };

  // If body is not FormData, default to application/json
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    options.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
    credentials: 'include' // sends HttpOnly session cookies
  });

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
