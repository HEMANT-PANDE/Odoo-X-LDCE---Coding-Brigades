const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

async function request(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || `Request failed: ${res.status}`);
  return data;
}

export async function uploadPhoto(file, token) {
  const body = new FormData();
  body.append('photo', file);
  const res = await fetch(`${BASE_URL}/upload/photo`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }, // no Content-Type — the browser sets the multipart boundary
    body,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || `Upload failed: ${res.status}`);
  return data.url;
}

export default request;
