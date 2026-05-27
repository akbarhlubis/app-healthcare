const BASE_URL = 'http://localhost/rsud-tgms/api/v1/portal'

export async function apiFetch(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  const token = localStorage.getItem('portal_token')
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
    headers['X-Auth-Token'] = token
  }
  const response = await fetch(url, { ...options, headers })
  const data = await response.json()
  if (data.metaData?.status === 'error') throw new Error(data.metaData?.message || 'Request failed')
  return data
}

export const surveyApi = {
  listSurveys() {
    return apiFetch('/survey')
  },
  getSurvey(slug) {
    return apiFetch(`/survey/${slug}`)
  },
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
}
