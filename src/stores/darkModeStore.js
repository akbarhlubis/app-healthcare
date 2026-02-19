import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useDarkModeStore = defineStore('darkMode', () => {
  // State
  const isDarkMode = ref(false)

  // Actions
  const initializeDarkMode = () => {
    const savedDarkMode = localStorage.getItem('healthcare_darkMode')
    if (savedDarkMode !== null) {
      isDarkMode.value = JSON.parse(savedDarkMode)
    } else {
      // Check system preference
      isDarkMode.value = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    applyDarkMode()
  }

  const applyDarkMode = () => {
    const html = document.documentElement
    if (isDarkMode.value) {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
  }

  const toggleDarkMode = () => {
    isDarkMode.value = !isDarkMode.value
    localStorage.setItem('healthcare_darkMode', JSON.stringify(isDarkMode.value))
    applyDarkMode()
  }

  return {
    // State
    isDarkMode,
    // Actions
    initializeDarkMode,
    toggleDarkMode
  }
})
