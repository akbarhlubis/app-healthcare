# Perbandingan: Tanpa Pinia vs Dengan Pinia

## 1. TANPA PINIA (Sebelumnya)

### Struktur File
```
src/
├── App.vue (mengelola semua state dalam komponen)
├── main.js (tanpa setup Pinia)
```

### Contoh Kode Tanpa Pinia

#### App.vue - Script Setup (Sebelumnya)
```javascript
<script setup>
import { ref, onMounted } from 'vue'

// User State di component
const userName = ref('')
const isLoggedIn = ref(false)
const showLoginModal = ref(false)
const loginInput = ref('')

// Dark Mode State di component
const isDarkMode = ref(false)

// Doctor State di component
const todayDoctors = ref([])
const currentDoctorIndex = ref(0)
const doctorList = [
  { id: 1, name: 'Dr. Budi Santoso, Sp.U', ... },
  // ... more doctors
]

// Semua methods juga di component
const handleLogin = () => {
  if (loginInput.value.trim()) {
    userName.value = loginInput.value.trim()
    isLoggedIn.value = true
    localStorage.setItem('healthcare_user', userName.value)
    loginInput.value = ''
    showLoginModal.value = false
  }
}

const handleLogout = () => {
  userName.value = ''
  isLoggedIn.value = false
  localStorage.removeItem('healthcare_user')
}

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
  localStorage.setItem('healthcare_darkMode', JSON.stringify(isDarkMode.value))
  applyDarkMode()
}

onMounted(() => {
  // Load dari localStorage
  const savedUser = localStorage.getItem('healthcare_user')
  if (savedUser) {
    userName.value = savedUser
    isLoggedIn.value = true
  }
})
</script>
```

#### Template Usage (Tanpa Pinia)
```vue
<template>
  <div>
    <!-- Mengakses state langsung dari component -->
    <span v-if="isLoggedIn">{{ userName }}</span>
    
    <!-- Mengakses method langsung dari component -->
    <Button @click="toggleDarkMode" :icon="isDarkMode ? 'pi pi-sun' : 'pi pi-moon'" />
    <Button @click="handleLogin" />
    <Button @click="handleLogout" />
    
    <!-- Mengakses ref langsung -->
    <Dialog v-model:visible="showLoginModal">
      <InputText v-model="loginInput" />
    </Dialog>
  </div>
</template>
```

### Masalah Tanpa Pinia
❌ State tersebar di banyak komponen  
❌ Sulit untuk berbagi state antar komponen  
❌ Code menjadi sulit di-maintain saat aplikasi berkembang  
❌ Perlu prop drilling untuk pass state ke child component  
❌ Tidak ada centralized state management  

---

## 2. DENGAN PINIA (Sekarang)

### Struktur File
```
src/
├── App.vue (menggunakan stores)
├── main.js (dengan setup Pinia)
├── stores/
│   ├── authStore.js (state auth)
│   ├── darkModeStore.js (state dark mode)
│   └── doctorStore.js (state dokter)
```

### Contoh Kode Dengan Pinia

#### stores/authStore.js
```javascript
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
    userName, isLoggedIn, showLoginModal, loginInput,
    login, logout, loadUser, openLoginModal, closeLoginModal
  }
})
```

#### stores/darkModeStore.js
```javascript
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
      isDarkMode.value = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
    }
    applyDarkMode()
  }

  const toggleDarkMode = () => {
    isDarkMode.value = !isDarkMode.value
    localStorage.setItem('healthcare_darkMode', JSON.stringify(isDarkMode.value))
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

  return {
    isDarkMode,
    initializeDarkMode,
    toggleDarkMode
  }
})
```

#### stores/doctorStore.js
```javascript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useDoctorStore = defineStore('doctor', () => {
  // State
  const doctorList = ref([...])
  const currentDoctorIndex = ref(0)
  const todayDoctors = ref([])

  // Computed
  const currentDayName = computed(() => {
    const days = ['Minggu', 'Senin', 'Selasa', ...]
    return days[new Date().getDay()]
  })

  // Actions
  const getTodayDoctors = () => {
    todayDoctors.value = doctorList.value.filter(doctor =>
      doctor.days.includes(currentDayName.value)
    )
  }

  const getNextDoctor = () => {
    if (todayDoctors.value.length > 0) {
      currentDoctorIndex.value = (currentDoctorIndex.value + 1) % todayDoctors.value.length
    }
  }

  return {
    doctorList, currentDoctorIndex, todayDoctors, currentDayName,
    getTodayDoctors, getNextDoctor
  }
})
```

#### main.js - Setup Pinia
```javascript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)  // ← Tambahkan Pinia sebelum mount
app.mount('#app')
```

#### App.vue - Script Setup (Dengan Pinia)
```javascript
<script setup>
import { useAuthStore } from './stores/authStore'
import { useDarkModeStore } from './stores/darkModeStore'
import { useDoctorStore } from './stores/doctorStore'

// Initialize stores
const authStore = useAuthStore()
const darkModeStore = useDarkModeStore()
const doctorStore = useDoctorStore()

onMounted(() => {
  darkModeStore.initializeDarkMode()
  authStore.loadUser()
  doctorStore.getTodayDoctors()
})
</script>
```

#### Template Usage (Dengan Pinia)
```vue
<template>
  <div>
    <!-- Mengakses state dari store -->
    <span v-if="authStore.isLoggedIn">{{ authStore.userName }}</span>
    
    <!-- Mengakses action dari store -->
    <Button @click="darkModeStore.toggleDarkMode" :icon="darkModeStore.isDarkMode ? 'pi pi-sun' : 'pi pi-moon'" />
    <Button @click="authStore.login(authStore.loginInput)" />
    <Button @click="authStore.logout" />
    
    <!-- Mengakses reactive data dari store -->
    <Dialog v-model:visible="authStore.showLoginModal">
      <InputText v-model="authStore.loginInput" />
    </Dialog>
  </div>
</template>
```

---

## 3. PERBANDINGAN UMUM

| Aspek | Tanpa Pinia | Dengan Pinia |
|-------|-------|---------|
| **Setup** | Sederhana untuk aplikasi kecil | Membutuhkan setup awal |
| **State Management** | Tersebar di komponen | Centralized di stores |
| **Sharing State** | Perlu prop drilling | Direct access ke store |
| **Scalability** | Sulit untuk aplikasi besar | Sangat scalable |
| **Code Organization** | Chaotic | Terstruktur & maintainable |
| **Debugging** | Sulit melacak state changes | Mudah dengan DevTools |
| **Testing** | Lebih kompleks | Lebih mudah test store |
| **Reusability** | Sulit reuse logic | Mudah reuse store |

---

## 4. KAPAN GUNAKAN PINIA?

✅ **Gunakan Pinia jika:**
- Aplikasi memiliki banyak component
- Banyak sharing state antar component
- Aplikasi medium-large size
- Perlu centralized state management
- Ingin best practices modern Vue

❌ **Tidak perlu Pinia jika:**
- Aplikasi sangat sederhana (1-2 component)
- State hanya lokal per component
- Prototype/MVP

---

## 5. PINIA DEVTOOLS

Pinia memiliki Vue DevTools integration yang powerful:

```javascript
// Buka Vue DevTools → Pinia
// Anda bisa:
// - Lihat state realtime
// - Lihat setiap action yang dipanggil
// - Time-travel debugging
// - Edit state langsung di devtools
```

---

## 6. KEUNTUNGAN PINIA DALAM PROJECT INI

1. **Auth Management**: Login/logout state centralized
2. **Dark Mode**: Bisa diakses dari mana saja tanpa prop drilling
3. **Doctor Schedule**: Mudah share data dokter ke component lain
4. **DevTools**: Bisa monitor setiap state change
5. **Maintainability**: Mudah menambah feature baru

---

Referensi: https://pinia.vuejs.org
