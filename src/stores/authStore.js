import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // State
  const userName = ref('')
  const isLoggedIn = ref(false)
  const showLoginModal = ref(false)
  const loginInput = ref('')

  // Actions
  const login = (name) => {
    if (name.trim()) {
      userName.value = name.trim()
      isLoggedIn.value = true
      localStorage.setItem('healthcare_user', userName.value)
      loginInput.value = ''
      showLoginModal.value = false
    }
  }

  const logout = () => {
    userName.value = ''
    isLoggedIn.value = false
    localStorage.removeItem('healthcare_user')
  }

  const loadUser = () => {
    const savedUser = localStorage.getItem('healthcare_user')
    if (savedUser) {
      userName.value = savedUser
      isLoggedIn.value = true
    }
  }

  const openLoginModal = () => {
    showLoginModal.value = true
  }

  const closeLoginModal = () => {
    showLoginModal.value = false
  }

  return {
    // State
    userName,
    isLoggedIn,
    showLoginModal,
    loginInput,
    // Actions
    login,
    logout,
    loadUser,
    openLoginModal,
    closeLoginModal
  }
})
