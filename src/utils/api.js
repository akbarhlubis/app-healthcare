const BASE_URL = import.meta.env.VITE_PORTAL_API_URL || '/v1/portal'

export async function apiFetch(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  const token = localStorage.getItem('portal_token')
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
    headers['X-Auth-Token'] = token
  }
  const response = await fetch(url, { ...options, headers }).catch(() => {
    throw new Error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.')
  })
  if (!response.ok && response.status !== 201) {
    throw new Error(`Server error (${response.status})`)
  }
  const data = await response.json().catch(() => {
    throw new Error('Response server tidak valid')
  })
  if (data.metaData?.status === 'error') throw new Error(data.metaData?.message || 'Request failed')
  return data
}

export const surveyApi = {
  listSurveys() { return apiFetch('/survey') },
  getSurvey(slug) { return apiFetch(`/survey/${slug}`) },
  submitSurvey(slug, payload) {
    return apiFetch(`/survey/${slug}/submit`, { method: 'POST', body: JSON.stringify(payload) })
  },
}

export const authApi = {
  login(noKtp, tglLahir, password) {
    return apiFetch('/login', { method: 'POST', body: JSON.stringify({ no_ktp: noKtp, tgl_lahir: tglLahir, password }) })
  },
  register(payload) {
    return apiFetch('/register', { method: 'POST', body: JSON.stringify(payload) })
  },
  forgotPassword(email) {
    return apiFetch('/password/forgot', { method: 'POST', body: JSON.stringify({ email }) })
  },
  resetPassword(email, token, password, passwordConfirmation) {
    return apiFetch('/password/reset', { method: 'POST', body: JSON.stringify({ email, token, password, password_confirmation: passwordConfirmation }) })
  },
  logout() {
    return apiFetch('/logout', { method: 'POST' })
  },
}
