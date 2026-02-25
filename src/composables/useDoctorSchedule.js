import { ref } from 'vue'
const API_URL = 'http://localhost/rsud-tgms/api/jadwal-dokter'
const API_KEY = 'majumundurok' // Ganti dengan token yang sesuai

export function useDoctorSchedule() {
  const schedules = ref([])
  const loading = ref(false)
  const error = ref(null)

  // params: { kd_dokter, kd_poli, hari }
  const fetchSchedules = async (params = {}) => {
    loading.value = true
    error.value = null
    try {
      // Build query string
      const query = Object.keys(params)
        .map(key => params[key] ? `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}` : '')
        .filter(Boolean)
        .join('&')
      const url = query ? `${API_URL}?${query}` : API_URL
      const response = await fetch(url, {
        headers: { 'X-key': API_KEY }
      })
      // Log response status and URL
      console.log('Fetch URL:', url)
      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response body:', data)
      if (data && data.metaData && data.metaData.kode === 200) {
        schedules.value = data.response || []
      } else {
        error.value = data?.metaData?.message || 'Gagal memuat jadwal dokter'
        // Log error details
        console.error('API error:', error.value)
      }
    } catch (e) {
      error.value = e.message || 'Gagal memuat jadwal dokter'
      // Log fetch exception
      console.error('Fetch exception:', e)
    } finally {
      loading.value = false
    }
  }

  return {
    schedules,
    loading,
    error,
    fetchSchedules
  }
}
