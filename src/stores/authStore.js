import { defineStore } from 'pinia'
import { ref } from 'vue'
import { authApi, apiFetch } from '../utils/api'

export const useAuthStore = defineStore('auth', () => {
  const userName = ref('')
  const userNoRm = ref('')
  const userEmail = ref('')
  const isLoggedIn = ref(false)
  const showLoginModal = ref(false)
  const loading = ref(false)
  const error = ref('')

  const loginNik = ref('')
  const loginTglLahir = ref('')
  const loginPassword = ref('')

  const formatDate = (d) => { if (!d) return ''; const dt = new Date(d); return dt.getFullYear() + '-' + String(dt.getMonth()+1).padStart(2,'0') + '-' + String(dt.getDate()).padStart(2,'0') }

  const login = async () => {
    error.value = ''
    if (!loginNik.value.trim() || !loginTglLahir.value || !loginPassword.value.trim()) {
      error.value = 'NIK, tanggal lahir, dan password wajib diisi'
      return false
    }
    loading.value = true
    try {
      const data = await authApi.login(loginNik.value.trim(), formatDate(loginTglLahir.value), loginPassword.value.trim())
      const res = data.response
      userName.value = res.nama || 'Pasien'
      userNoRm.value = res.no_rkm_medis
      userEmail.value = res.email || ''
      isLoggedIn.value = true
      localStorage.setItem('portal_token', res.token)
      loginNik.value = ''
      loginTglLahir.value = ''
      loginPassword.value = ''
      showLoginModal.value = false
      return true
    } catch (e) {
      error.value = e.message || 'Login gagal'
      return false
    } finally { loading.value = false }
  }

  const logout = async () => {
    try { await authApi.logout() } catch (e) {}
    clearUser()
  }

  const clearUser = () => {
    userName.value = ''
    userNoRm.value = ''
    userEmail.value = ''
    isLoggedIn.value = false
    localStorage.removeItem('portal_token')
  }

  const loadUser = async () => {
    const token = localStorage.getItem('portal_token')
    if (!token) return
    try {
      const data = await apiFetch('/profile')
      if (data.response) {
        userName.value = data.response.nama || data.response.no_rkm_medis || 'Pasien'
        userNoRm.value = data.response.no_rkm_medis || ''
        userEmail.value = data.response.email || ''
        isLoggedIn.value = true
      }
    } catch (e) {
      clearUser()
    }
  }

  const openLoginModal = () => { error.value = ''; showLoginModal.value = true }
  const closeLoginModal = () => { error.value = ''; showLoginModal.value = false }

  return {
    userName, userNoRm, userEmail, isLoggedIn, showLoginModal, loading, error,
    loginNik, loginTglLahir, loginPassword,
    login, logout, loadUser, openLoginModal, closeLoginModal,
  }
})
