import { ref } from 'vue'
const API_URL = import.meta.env.VITE_DOCTOR_SCHEDULE_API_URL || '/api/jadwal-dokter'
// Key opsional — hanya mode Laravel (SIMRS) yang membutuhkannya.
// Isi VITE_DOCTOR_SCHEDULE_API_KEY di .env lokal (GITIGNORED), JANGAN commit.
const API_KEY = import.meta.env.VITE_DOCTOR_SCHEDULE_API_KEY || ''

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
        headers: API_KEY ? { 'X-key': API_KEY } : {}
      })
      const data = await response.json()
      if (data && data.metaData && data.metaData.kode === 200) {
        schedules.value = data.response || []
      } else {
        error.value = data?.metaData?.message || 'Gagal memuat jadwal dokter'
      }
    } catch (e) {
      error.value = e.message || 'Gagal memuat jadwal dokter'
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
