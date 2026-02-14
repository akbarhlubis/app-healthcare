<script setup>
import { ref, onMounted } from 'vue'

// Healthcare App - Home Menu
const appName = import.meta.env.VITE_APP_NAME || 'Healthcare App'
const hospitalName = import.meta.env.VITE_HOSPITAL_NAME || 'Rumah Sakit'
const hospitalAddress = import.meta.env.VITE_HOSPITAL_ADDRESS || 'Alamat Rumah Sakit'
const hospitalPhone = import.meta.env.VITE_HOSPITAL_PHONE || '+62-21-1234-5678'
const hospitalEmail = import.meta.env.VITE_HOSPITAL_EMAIL || 'info@hospital.com'
const hospitallLogo = import.meta.env.VITE_HOSPITAL_LOGO || '🏥'

// User State
const userName = ref('')
const isLoggedIn = ref(false)
const showLoginModal = ref(false)
const loginInput = ref('')

// Date and Time State
const currentDateTime = ref(new Date())

// Format date and time
const formatDateTime = () => {
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Asia/Jakarta'
  }
  return new Intl.DateTimeFormat('id-ID', options).format(currentDateTime.value)
}

// Load user from localStorage on mount
onMounted(() => {
  const savedUser = localStorage.getItem('healthcare_user')
  if (savedUser) {
    userName.value = savedUser
    isLoggedIn.value = true
  }
})

// Handle Login
const handleLogin = () => {
  if (loginInput.value.trim()) {
    userName.value = loginInput.value.trim()
    isLoggedIn.value = true
    localStorage.setItem('healthcare_user', userName.value)
    loginInput.value = ''
    showLoginModal.value = false
  }
}

// Handle Logout
const handleLogout = () => {
  userName.value = ''
  isLoggedIn.value = false
  localStorage.removeItem('healthcare_user')
}

// BPJS App Links
const bpjsLinks = {
  ios: 'https://apps.apple.com/id/app/mobile-jkn/id1237601115',
  android: 'https://play.google.com/store/apps/details?id=app.bpjs.mobile&hl=id'
}

// Detect device and redirect to BPJS store
const redirectToBPJSApp = () => {
  const userAgent = navigator.userAgent.toLowerCase()
  let storeUrl = bpjsLinks.android // Default to Android/Play Store

  if (/iphone|ipad|ipod|mac os/.test(userAgent)) {
    storeUrl = bpjsLinks.ios // iOS/App Store
  }

  window.open(storeUrl, '_blank')
}

// Doctor Schedule Data
const doctorList = [
  {
    id: 1,
    name: 'Dr. Budi Santoso, Sp.U',
    specialty: 'Urologi',
    days: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'],
    time: '08:00 - 12:00',
    experience: '15 tahun',
    rating: 4.8
  },
  {
    id: 2,
    name: 'Dr. Siti Nurhaliza, Sp.OG',
    specialty: 'Obstetri & Ginekologi',
    days: ['Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
    time: '13:00 - 17:00',
    experience: '12 tahun',
    rating: 4.9
  },
  {
    id: 3,
    name: 'Dr. Ahmad Wijaya, Sp.LL',
    specialty: 'Paru-Paru',
    days: ['Senin', 'Selasa', 'Rabu', 'Kamis'],
    time: '09:00 - 13:00',
    experience: '20 tahun',
    rating: 4.7
  },
  {
    id: 4,
    name: 'Dr. Dewi Lestari, Sp.J',
    specialty: 'Jantung',
    days: ['Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Senin'],
    time: '14:00 - 18:00',
    experience: '18 tahun',
    rating: 4.9
  },
  {
    id: 5,
    name: 'Dr. Rudi Hermawan, Sp.N',
    specialty: 'Neurologi',
    days: ['Senin', 'Selasa', 'Rabu'],
    time: '10:00 - 14:00',
    experience: '16 tahun',
    rating: 4.8
  }
]

// Get today's day name
const getTodayDayName = () => {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  return days[new Date().getDay()]
}

// Get doctors practicing today
const getTodayDoctors = () => {
  const today = getTodayDayName()
  return doctorList.filter(doctor => doctor.days.includes(today))
}

const todayDoctors = ref([])
const currentDoctorIndex = ref(0)

// Auto-rotate doctor schedule every 5 seconds
onMounted(() => {
  todayDoctors.value = getTodayDoctors()
  
  // Update time every second
  const timeInterval = setInterval(() => {
    currentDateTime.value = new Date()
  }, 1000)
  
  if (todayDoctors.value.length > 0) {
    const doctorInterval = setInterval(() => {
      currentDoctorIndex.value = (currentDoctorIndex.value + 1) % todayDoctors.value.length
    }, 5000)

    // Cleanup intervals on component unmount
    return () => {
      clearInterval(timeInterval)
      clearInterval(doctorInterval)
    }
  }
  
  // Cleanup time interval if no doctors today
  return () => clearInterval(timeInterval)
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
    <!-- Navbar -->
    <div class="navbar bg-gradient-to-r from-primary to-secondary shadow-lg">
      <div class="flex-1">
        <span class="text-2xl font-bold text-white flex items-center gap-2">
          <span class="text-3xl">{{ hospitallLogo }}</span>
          {{ appName }}
        </span>
      </div>
      <div class="flex-none gap-2">
        <!-- User Profile / Login Button -->
        <div v-if="isLoggedIn" class="dropdown dropdown-end">
          <button tabindex="0" class="btn btn-ghost text-white hover:bg-white/20">
            <span class="text-lg">👤</span>
            {{ userName }}
          </button>
          <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
            <li class="disabled"><span class="text-sm text-gray-500">{{ userName }}</span></li>
            <li><a @click="handleLogout" class="text-error">Logout</a></li>
          </ul>
        </div>
        <button v-else class="btn btn-warning" @click="showLoginModal = true">
          <span class="text-lg">🔐</span>
          Login
        </button>
      </div>
    </div>

    <!-- Hero Section -->
    <div class="hero min-h-[calc(100vh-64px)]">
      <div class="hero-content text-center">
        <div class="max-w-2xl">
          <!-- Welcome Card -->
          <div class="card bg-base-100 shadow-2xl mb-8">
            <div class="card-body">
              <div class="text-6xl mb-4">{{ hospitallLogo }}</div>
              <h1 class="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {{ hospitalName }}
              </h1>
              <p v-if="isLoggedIn" class="text-2xl font-semibold text-primary mt-4">
                Selamat Datang, {{ userName }}! 👋
              </p>
              <p class="text-lg text-gray-500 mt-2">
                Sistem Informasi Pelayanan Kesehatan
              </p>
              <p class="text-sm text-gray-400 mt-1">
                📅 {{ formatDateTime() }}
              </p>
              <div class="divider"></div>
              <p class="text-gray-600">Silakan pilih menu layanan di bawah ini</p>
            </div>
          </div>

          <!-- Doctor Schedule Running Card -->
          <div v-if="todayDoctors.length > 0" class="w-full mb-8">
            <div class="card bg-gradient-to-r from-blue-500 to-cyan-500 shadow-2xl">
              <div class="card-body text-white">
                <div class="flex justify-between items-start mb-4">
                  <div class="badge badge-lg badge-warning">Jadwal Dokter Hari Ini</div>
                  <span class="text-sm opacity-75">{{ currentDoctorIndex + 1 }} / {{ todayDoctors.length }}</span>
                </div>
                <h2 class="card-title text-2xl mb-2">{{ todayDoctors[currentDoctorIndex].name }}</h2>
                <div class="space-y-2 text-sm">
                  <p><strong>Spesialisasi:</strong> {{ todayDoctors[currentDoctorIndex].specialty }}</p>
                  <p><strong>Jam Praktik:</strong> {{ todayDoctors[currentDoctorIndex].time }}</p>
                  <p><strong>Pengalaman:</strong> {{ todayDoctors[currentDoctorIndex].experience }}</p>
                  <div class="flex items-center gap-1">
                    <strong>Rating:</strong>
                    <span class="flex">
                      <span v-for="i in 5" :key="i" :class="i <= Math.round(todayDoctors[currentDoctorIndex].rating) ? 'text-yellow-300' : 'text-white/30'">⭐</span>
                    </span>
                    {{ todayDoctors[currentDoctorIndex].rating }}
                  </div>
                </div>
                <div class="card-actions justify-center mt-4">
                  <button class="btn btn-sm btn-outline btn-warning">Pesan Konsultasi</button>
                </div>
              </div>
            </div>
          </div>

          <!-- No Doctor Schedule Card -->
          <div v-else class="w-full mb-8">
            <div class="card bg-gradient-to-r from-gray-400 to-gray-500 shadow-2xl">
              <div class="card-body text-white text-center">
                <div class="text-5xl mb-4">😴</div>
                <h2 class="card-title text-2xl mb-2 justify-center">Tidak Ada Jadwal Dokter</h2>
                <p class="text-sm opacity-90">Mohon maaf, saat ini tidak ada dokter yang bertugas hari ini.</p>
                <p class="text-sm opacity-75 mt-2">Silakan cek kembali besok atau hubungi customer service kami.</p>
                <div class="card-actions justify-center mt-4">
                  <button class="btn btn-sm btn-outline btn-warning">Hubungi Customer Service</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Menu Buttons Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Jadwal Dokter -->
            <button class="btn btn-primary btn-lg h-24 flex flex-col gap-1 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
              <span class="text-3xl">👨‍⚕️</span>
              <span class="text-lg font-semibold">Jadwal Dokter</span>
            </button>

            <!-- Survey Kemasyarakatan -->
            <button class="btn btn-secondary btn-lg h-24 flex flex-col gap-1 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
              <span class="text-3xl">📋</span>
              <span class="text-lg font-semibold">Survey Kemasyarakatan</span>
            </button>

            <!-- Daftar Pasien Umum -->
            <button class="btn btn-accent btn-lg h-24 flex flex-col gap-1 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
              <span class="text-3xl">🧑‍🤝‍🧑</span>
              <span class="text-lg font-semibold">Daftar Pasien Umum</span>
            </button>

            <!-- Daftar Pasien BPJS -->
            <button @click="redirectToBPJSApp" class="btn btn-success btn-lg h-24 flex flex-col gap-1 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
              <span class="text-3xl">💳</span>
              <span class="text-lg font-semibold">Daftar Pasien BPJS</span>
            </button>
          </div>

          <!-- Footer Info -->
          <div class="mt-8 text-sm text-gray-600 bg-base-100 p-4 rounded-lg shadow">
            <p class="font-semibold mb-2">{{ hospitalName }}</p>
            <p>📍 {{ hospitalAddress }}</p>
            <p>📞 {{ hospitalPhone }}</p>
            <p>📧 {{ hospitalEmail }}</p>
            <div class="divider my-2"></div>
            <p class="text-xs text-gray-400">© 2026 {{ appName }} - Pelayanan Kesehatan Terpadu</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Login Modal -->
    <div v-if="showLoginModal" class="modal modal-open">
      <div class="modal-box w-full max-w-md">
        <h3 class="font-bold text-lg mb-4">Masuk Ke Sistem</h3>
        <div class="form-control w-full mb-4">
          <label class="label">
            <span class="label-text">Masukkan Nama Anda</span>
          </label>
          <input 
            type="text" 
            placeholder="Nama lengkap" 
            class="input input-bordered w-full"
            v-model="loginInput"
            @keyup.enter="handleLogin"
          />
        </div>
        <div class="modal-action">
          <button class="btn btn-ghost" @click="showLoginModal = false">Batal</button>
          <button class="btn btn-primary" @click="handleLogin" :disabled="!loginInput.trim()">Login</button>
        </div>
      </div>
      <div class="modal-backdrop" @click="showLoginModal = false"></div>
    </div>
  </div>
</template>

<style scoped>
/* Custom styles if needed */
</style>
