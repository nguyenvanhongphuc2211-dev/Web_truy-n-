const TOKEN_KEY = 'mochi-token'
const READER_KEY = 'mochi-reader'

export function readerId() {
  try {
    let id = localStorage.getItem(READER_KEY)
    if (!id || !/^[a-zA-Z0-9-]{8,80}$/.test(id)) {
      id = crypto.randomUUID()
      localStorage.setItem(READER_KEY, id)
    }
    return id
  } catch {
    return 'local-reader'
  }
}

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* private mode */
  }
}

async function getJson(path, options = {}) {
  const headers = { ...(options.headers || {}) }
  if (options.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json'
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  const response = await fetch(path, { ...options, headers })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    const err = new Error(body.error || `Lỗi ${response.status}`)
    err.payload = body
    err.status = response.status
    throw err
  }
  return body
}

export const api = {
  health: () => getJson('/api/health'),
  mangas: () => getJson('/api/mangas'),
  searchMangas: (query, options = {}) => {
    const params = new URLSearchParams()
    Object.entries(query).forEach(([key, value]) => {
      if (value != null && value !== '') params.set(key, String(value))
    })
    return getJson(`/api/mangas?${params}`, options)
  },
  manga: (id) => getJson(`/api/mangas/${encodeURIComponent(id)}`),
  chapter: (id, chapter) => getJson(`/api/mangas/${encodeURIComponent(id)}/chapters/${chapter}`),
  genres: () => getJson('/api/genres'),
  authors: () => getJson('/api/authors'),
  groups: () => getJson('/api/groups'),
  register: (payload) => getJson('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => getJson('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  verifyEmail: (payload) => getJson('/api/auth/verify-email', { method: 'POST', body: JSON.stringify(payload) }),
  resendVerify: (payload) => getJson('/api/auth/resend-verify', { method: 'POST', body: JSON.stringify(payload) }),
  me: () => getJson('/api/auth/me'),
  changePassword: (payload) => getJson('/api/auth/password', { method: 'PATCH', body: JSON.stringify(payload) }),
  recordRead: (id, chapter) => getJson(`/api/mangas/${encodeURIComponent(id)}/chapters/${chapter}/read`, {
    method: 'POST',
    body: '{}',
    headers: { 'x-reader': readerId() },
  }),
  react: (id, payload) => getJson(`/api/mangas/${encodeURIComponent(id)}/react`, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { 'x-reader': readerId() },
  }),
}
