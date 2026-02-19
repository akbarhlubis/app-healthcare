<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDoctorStore } from '../stores/doctorStore'
import { useAuthStore } from '../stores/authStore'
import { useDarkModeStore } from '../stores/darkModeStore'

const router = useRouter()
const doctorStore = useDoctorStore()
const authStore = useAuthStore()
const darkModeStore = useDarkModeStore()

const currentDateTime = ref(new Date())

const appName = import.meta.env.VITE_APP_NAME || 'Healthcare App'
const hospitalName = import.meta.env.VITE_HOSPITAL_NAME || 'Rumah Sakit'
const hospitalAddress = import.meta.env.VITE_HOSPITAL_ADDRESS || 'Alamat Rumah Sakit'
const hospitalPhone = import.meta.env.VITE_HOSPITAL_PHONE || '+62-21-1234-5678'
const hospitalEmail = import.meta.env.VITE_HOSPITAL_EMAIL || 'info@hospital.com'
const hospitallLogo = import.meta.env.VITE_HOSPITAL_LOGO || 'https://upload.wikimedia.org/wikipedia/commons/2/2b/Lambang_Kabupaten_Tanggamus.png'

const activeCategory = ref('semua')

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

const formatDateShort = () => {
  const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' }
  return new Intl.DateTimeFormat('id-ID', options).format(currentDateTime.value)
}

const formatTime = () => {
  const options = { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }
  return new Intl.DateTimeFormat('id-ID', options).format(currentDateTime.value)
}

const bpjsLinks = {
  ios: 'https://apps.apple.com/id/app/mobile-jkn/id1237601115',
  android: 'https://play.google.com/store/apps/details?id=app.bpjs.mobile&hl=id'
}

const redirectToBPJSApp = () => {
  const userAgent = navigator.userAgent.toLowerCase()
  let storeUrl = bpjsLinks.android
  if (/iphone|ipad|ipod|mac os/.test(userAgent)) {
    storeUrl = bpjsLinks.ios
  }
  window.open(storeUrl, '_blank')
}

// Service categories for tab bar
const categories = [
  { label: 'Semua', value: 'semua', icon: 'pi pi-th-large' },
  { label: 'Pelayanan', value: 'pelayanan', icon: 'pi pi-heart' },
  { label: 'Informasi', value: 'informasi', icon: 'pi pi-info-circle' },
  { label: 'Pendaftaran', value: 'pendaftaran', icon: 'pi pi-user-plus' }
]

// Grid menu items (super app style)
const serviceMenu = [
  {
    label: 'Jadwal Dokter',
    icon: 'pi pi-calendar',
    color: '#3B82F6',
    bgColor: '#EFF6FF',
    darkBgColor: '#1E3A5F',
    category: 'informasi',
    action: () => router.push('/jadwal-dokter')
  },
  {
    label: 'Survey Masyarakat',
    icon: 'pi pi-chart-bar',
    color: '#8B5CF6',
    bgColor: '#F5F3FF',
    darkBgColor: '#3B2667',
    category: 'pelayanan',
    action: () => router.push('/survey-kemasyarakatan')
  },
  {
    label: 'Daftar Umum',
    icon: 'pi pi-user-plus',
    color: '#06B6D4',
    bgColor: '#ECFEFF',
    darkBgColor: '#164E63',
    category: 'pendaftaran',
    action: () => router.push('/daftar-pasien')
  },
  {
    label: 'Daftar BPJS',
    icon: 'pi pi-id-card',
    color: '#10B981',
    bgColor: '#ECFDF5',
    darkBgColor: '#1A3D2E',
    category: 'pendaftaran',
    action: redirectToBPJSApp
  },
  {
    label: 'Info RS',
    icon: 'pi pi-building',
    color: '#F59E0B',
    bgColor: '#FFFBEB',
    darkBgColor: '#4A3B1A',
    category: 'informasi',
    action: () => scrollToFooter()
  },
  {
    label: 'Hubungi Kami',
    icon: 'pi pi-phone',
    color: '#EF4444',
    bgColor: '#FEF2F2',
    darkBgColor: '#4A1D1D',
    category: 'informasi',
    action: () => window.open(`tel:${hospitalPhone}`)
  },
  {
    label: 'Konsultasi',
    icon: 'pi pi-comments',
    color: '#EC4899',
    bgColor: '#FDF2F8',
    darkBgColor: '#4A1D3A',
    category: 'pelayanan',
    action: () => router.push('/jadwal-dokter')
  },
  {
    label: 'Alamat & Peta',
    icon: 'pi pi-map-marker',
    color: '#14B8A6',
    bgColor: '#F0FDFA',
    darkBgColor: '#1A3D38',
    category: 'informasi',
    action: () => scrollToFooter()
  }
]

// Compute bg color based on dark mode
const getServiceBg = (service) => darkModeStore.isDarkMode ? service.darkBgColor : service.bgColor

// Quick access horizontal scroll items
const quickAccess = [
  { label: 'Dokter Hari Ini', icon: 'pi pi-calendar-clock', severity: 'info', action: () => router.push('/jadwal-dokter') },
  { label: 'Daftar Cepat', icon: 'pi pi-bolt', severity: 'warning', action: () => router.push('/daftar-pasien') },
  { label: 'BPJS Mobile', icon: 'pi pi-mobile', severity: 'success', action: redirectToBPJSApp },
  { label: 'Survey', icon: 'pi pi-chart-bar', severity: 'help', action: () => router.push('/survey-kemasyarakatan') }
]

// Promo / announcement cards
const announcements = [
  {
    title: 'Layanan Kesehatan Terpadu',
    desc: 'Daftarkan diri Anda secara online melalui aplikasi ini. Cepat, mudah, dan tanpa antri.',
    icon: 'pi pi-check-circle',
    severity: 'success'
  },
  {
    title: 'Pendaftaran BPJS Online',
    desc: 'Akses layanan BPJS melalui aplikasi Mobile JKN. Unduh sekarang!',
    icon: 'pi pi-download',
    severity: 'info'
  },
  {
    title: 'Jadwal Dokter Update',
    desc: 'Cek jadwal dokter spesialis yang tersedia setiap hari secara realtime.',
    icon: 'pi pi-clock',
    severity: 'warn'
  }
]

const filteredMenu = ref(serviceMenu)

const filterByCategory = (cat) => {
  activeCategory.value = cat
  if (cat === 'semua') {
    filteredMenu.value = serviceMenu
  } else {
    filteredMenu.value = serviceMenu.filter(item => item.category === cat)
  }
}

const scrollToFooter = () => {
  const el = document.getElementById('footer-info')
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

let timeInterval = null
let doctorInterval = null

onMounted(() => {
  doctorStore.getTodayDoctors()
  
  timeInterval = setInterval(() => {
    currentDateTime.value = new Date()
  }, 1000)
  
  if (doctorStore.todayDoctors.length > 0) {
    doctorInterval = setInterval(() => {
      doctorStore.getNextDoctor()
    }, 5000)
  }
})

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval)
  if (doctorInterval) clearInterval(doctorInterval)
})
</script>

<template>
  <div class="superapp-container">
    <div class="superapp-content">

      <!-- ===== HERO HEADER ===== -->
      <div class="hero-header">
        <div class="hero-top">
          <div class="hero-greeting">
            <p class="hero-welcome">
              {{ authStore.isLoggedIn ? `Halo, ${authStore.userName}! 👋` : 'Selamat Datang! 👋' }}
            </p>
            <p class="hero-subtitle">{{ formatDateShort() }}</p>
          </div>
          <Avatar 
            size="large" 
            shape="circle"
            style="border: 2px solid rgba(255,255,255,0.3); cursor: pointer;"
            @click="authStore.isLoggedIn ? null : authStore.openLoginModal()"
          />
        </div>
        
        <!-- Info Bar inside Hero -->
        <div class="hero-info-bar">
          <div class="hero-info-item">
            <i class="pi pi-clock"></i>
            <div>
              <p class="hero-info-label">Waktu</p>
              <p class="hero-info-value">{{ formatTime() }} WIB</p>
            </div>
          </div>
          <div class="hero-info-divider"></div>
          <div class="hero-info-item">
            <i class="pi pi-users"></i>
            <div>
              <p class="hero-info-label">Dokter Aktif</p>
              <p class="hero-info-value">{{ doctorStore.todayDoctors.length }} Dokter</p>
            </div>
          </div>
          <div class="hero-info-divider"></div>
          <div class="hero-info-item">
            <i class="pi pi-check-circle" style="color: #34D399;"></i>
            <div>
              <p class="hero-info-label">Status</p>
              <p class="hero-info-value" style="color: #34D399;">Buka</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== PROMO / ANNOUNCEMENT CAROUSEL ===== -->
      <Carousel 
        :value="announcements" 
        :numVisible="1" 
        :numScroll="1" 
        :autoplayInterval="4000"
        :showNavigators="false"
        class="section-block announcement-carousel"
      >
        <template #item="{ data }">
          <div class="announcement-card" :class="`announcement-${data.severity}`">
            <div class="announcement-icon">
              <i :class="data.icon"></i>
            </div>
            <div class="announcement-text">
              <p class="announcement-title">{{ data.title }}</p>
              <p class="announcement-desc">{{ data.desc }}</p>
            </div>
          </div>
        </template>
      </Carousel>

      <!-- ===== QUICK ACCESS HORIZONTAL SCROLL ===== -->
      <div class="section-block">
        <p class="section-title">Akses Cepat</p>
        <div class="quick-access-scroll">
          <div 
            v-for="(item, i) in quickAccess" 
            :key="i" 
            class="quick-access-chip"
            @click="item.action"
          >
            <i :class="item.icon" class="quick-access-icon"></i>
            <span>{{ item.label }}</span>
          </div>
        </div>
      </div>

      <!-- ===== CATEGORY TAB BAR ===== -->
      <div class="section-block">
        <p class="section-title">Layanan Kami</p>
        <div class="category-tabs">
          <Button 
            v-for="cat in categories" 
            :key="cat.value"
            :label="cat.label"
            :icon="cat.icon"
            :outlined="activeCategory !== cat.value"
            :severity="activeCategory === cat.value ? 'primary' : 'secondary'"
            size="small"
            rounded
            @click="filterByCategory(cat.value)"
            class="category-tab-btn"
          />
        </div>
      </div>

      <!-- ===== SERVICE GRID MENU ===== -->
      <div class="section-block">
        <div class="service-grid">
          <div 
            v-for="(service, i) in filteredMenu" 
            :key="i" 
            class="service-grid-item"
            @click="service.action"
          >
            <div class="service-icon-wrapper" :style="{ backgroundColor: getServiceBg(service) }">
              <i :class="service.icon" :style="{ color: service.color, fontSize: '1.5rem' }"></i>
            </div>
            <p class="service-label">{{ service.label }}</p>
          </div>
        </div>
      </div>

      <!-- ===== DOCTOR SCHEDULE SECTION ===== -->
      <div class="section-block">
        <div class="section-header">
          <p class="section-title">Dokter Hari Ini</p>
          <Button 
            label="Lihat Semua" 
            icon="pi pi-arrow-right" 
            iconPos="right"
            text
            size="small"
            @click="router.push('/jadwal-dokter')"
          />
        </div>

        <!-- Doctor Cards Horizontal Scroll -->
        <div v-if="doctorStore.todayDoctors.length > 0" class="doctor-scroll">
          <div 
            v-for="doctor in doctorStore.todayDoctors" 
            :key="doctor.id" 
            class="doctor-card"
          >
            <div class="doctor-card-top">
              <Avatar 
                :label="doctor.name.charAt(4)" 
                size="large" 
                shape="circle"
                style="background: var(--primary-color); color: white;"
              />
              <Tag :value="doctor.specialty" severity="info" rounded />
            </div>
            <p class="doctor-name">{{ doctor.name }}</p>
            <div class="doctor-info-row">
              <i class="pi pi-clock"></i>
              <span>{{ doctor.time }}</span>
            </div>
            <div class="doctor-info-row">
              <i class="pi pi-briefcase"></i>
              <span>{{ doctor.experience }}</span>
            </div>
            <div class="doctor-rating">
              <Rating 
                v-model="doctor.rating" 
                :readonly="true" 
                :cancel="false"
                style="font-size: 0.75rem;"
              />
              <span class="rating-number">{{ doctor.rating }}</span>
            </div>
          </div>
        </div>

        <!-- No Doctors -->
        <Card v-else>
          <template #content>
            <div style="text-align: center; padding: 2rem 1rem;">
              <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">😴</div>
              <p style="font-weight: 600; margin: 0 0 0.5rem;">Tidak ada jadwal dokter hari ini</p>
              <p style="font-size: 0.8rem; color: var(--text-color-secondary); margin: 0;">Silakan cek kembali besok</p>
            </div>
          </template>
        </Card>
      </div>

      <!-- ===== CARD-BASED MODULES (Promo Cards) ===== -->
      <div class="section-block">
        <p class="section-title">Promo & Informasi</p>
        <div class="promo-cards">
          <Card class="promo-card promo-card-blue" style="cursor: pointer;" @click="router.push('/daftar-pasien')">
            <template #content>
              <div class="promo-card-content">
                <div>
                  <p class="promo-card-title">Pendaftaran Online</p>
                  <p class="promo-card-desc">Daftar sebagai pasien umum tanpa perlu antri di loket</p>
                  <Tag value="Gratis" severity="success" rounded style="margin-top: 0.5rem;" />
                </div>
                <i class="pi pi-user-plus promo-card-icon"></i>
              </div>
            </template>
          </Card>

          <Card class="promo-card promo-card-green" style="cursor: pointer;" @click="redirectToBPJSApp">
            <template #content>
              <div class="promo-card-content">
                <div>
                  <p class="promo-card-title">Mobile JKN BPJS</p>
                  <p class="promo-card-desc">Unduh aplikasi resmi BPJS untuk pendaftaran online</p>
                  <Tag value="Download" severity="info" rounded style="margin-top: 0.5rem;" />
                </div>
                <i class="pi pi-download promo-card-icon"></i>
              </div>
            </template>
          </Card>
        </div>
      </div>

    </div>

    <!-- ===== FLOATING ACTION BUTTON ===== -->
    <div class="fab-container">
      <Button 
        icon="pi pi-whatsapp"
        rounded
        raised
        severity="success"
        class="fab-button"
        v-tooltip.left="'Hubungi via WhatsApp'"
        @click="window.open('https://wa.me/6281234567890', '_blank')"
      />
    </div>

  </div>
</template>

<style scoped>
/* ===== CONTAINER ===== */
.superapp-container {
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  min-height: calc(100vh - 120px);
}

.superapp-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.section-block {
  padding: 0 1rem;
  margin-bottom: 1rem;
}

.section-title {
  font-weight: 700;
  font-size: 1rem;
  margin: 0 0 0.75rem;
  color: var(--text-color);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.section-header .section-title {
  margin-bottom: 0;
}

/* ===== HERO HEADER ===== */
.hero-header {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-600));
  color: white;
  padding: 1.5rem 1rem 1rem;
  border-radius: 0 0 1.5rem 1.5rem;
  margin-bottom: 0.5rem;
}

.hero-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.hero-greeting {
  flex: 1;
}

.hero-welcome {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  color: white;
}

.hero-subtitle {
  font-size: 0.8rem;
  margin: 0.25rem 0 0;
  opacity: 0.85;
  color: white;
}

.hero-search {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--surface-card);
  border-radius: 2rem;
  padding: 0.5rem 1rem;
}

.hero-search .pi-search {
  font-size: 1rem;
}

/* ===== ANNOUNCEMENT CAROUSEL ===== */
.announcement-carousel {
  margin-top: 0.5rem;
}

.announcement-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-radius: 1rem;
  margin: 0 0.25rem;
  min-height: 80px;
}

.announcement-success {
  background: linear-gradient(135deg, #ECFDF5, #D1FAE5);
  border: 1px solid #A7F3D0;
}

.announcement-info {
  background: linear-gradient(135deg, #EFF6FF, #DBEAFE);
  border: 1px solid #BFDBFE;
}

.announcement-warn {
  background: linear-gradient(135deg, #FFFBEB, #FEF3C7);
  border: 1px solid #FDE68A;
}

/* Dark mode announcement overrides */
:root.dark .announcement-success {
  background: linear-gradient(135deg, #064E3B, #065F46);
  border-color: #10B981;
}

:root.dark .announcement-info {
  background: linear-gradient(135deg, #1E3A5F, #1E40AF20);
  border-color: #3B82F6;
}

:root.dark .announcement-warn {
  background: linear-gradient(135deg, #451A03, #78350F);
  border-color: #F59E0B;
}

.announcement-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.announcement-success .announcement-icon { color: #10B981; }
.announcement-info .announcement-icon { color: #3B82F6; }
.announcement-warn .announcement-icon { color: #F59E0B; }

.announcement-title {
  font-weight: 700;
  font-size: 0.9rem;
  margin: 0 0 0.25rem;
  color: var(--text-color);
}

.announcement-desc {
  font-size: 0.78rem;
  margin: 0;
  color: var(--text-color-secondary);
  line-height: 1.4;
}

/* ===== QUICK ACCESS SCROLL ===== */
.quick-access-scroll {
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.quick-access-scroll::-webkit-scrollbar {
  display: none;
}

.quick-access-chip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 2rem;
  cursor: pointer;
  white-space: nowrap;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.2s;
  flex-shrink: 0;
  color: var(--text-color);
}

.quick-access-chip:hover {
  background: var(--primary-50);
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.quick-access-icon {
  font-size: 1rem;
  color: var(--primary-color);
}

/* ===== CATEGORY TABS ===== */
.category-tabs {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding-bottom: 0.25rem;
}

.category-tabs::-webkit-scrollbar {
  display: none;
}

.category-tab-btn {
  flex-shrink: 0 !important;
  font-size: 0.8rem !important;
}

/* ===== SERVICE GRID ===== */
.service-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.service-grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: transform 0.15s;
  padding: 0.5rem 0;
}

.service-grid-item:hover {
  transform: translateY(-2px);
}

.service-grid-item:active {
  transform: scale(0.95);
}

.service-icon-wrapper {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: box-shadow 0.2s;
}

.service-grid-item:hover .service-icon-wrapper {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.service-label {
  font-size: 0.72rem;
  font-weight: 500;
  text-align: center;
  margin: 0;
  line-height: 1.3;
  color: var(--text-color);
}

/* ===== DOCTOR SCROLL ===== */
.doctor-scroll {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.doctor-scroll::-webkit-scrollbar {
  display: none;
}

.doctor-card {
  min-width: 220px;
  max-width: 220px;
  flex-shrink: 0;
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 1rem;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  transition: box-shadow 0.2s;
}

.doctor-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.doctor-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.doctor-name {
  font-weight: 700;
  font-size: 0.85rem;
  margin: 0.25rem 0 0;
  line-height: 1.3;
  color: var(--text-color);
}

.doctor-info-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.78rem;
  color: var(--text-color-secondary);
}

.doctor-info-row i {
  font-size: 0.75rem;
  color: var(--primary-color);
}

.doctor-rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.rating-number {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-color);
}

/* ===== PROMO CARDS ===== */
.promo-cards {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.promo-card {
  border-radius: 1rem !important;
  overflow: hidden;
}

.promo-card-blue {
  background: linear-gradient(135deg, #3B82F6, #2563EB) !important;
  border: none !important;
}

.promo-card-green {
  background: linear-gradient(135deg, #10B981, #059669) !important;
  border: none !important;
}

.promo-card-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.promo-card-title {
  font-weight: 700;
  font-size: 1rem;
  margin: 0 0 0.25rem;
  color: white;
}

.promo-card-desc {
  font-size: 0.8rem;
  margin: 0;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.4;
}

.promo-card-icon {
  font-size: 2.5rem;
  color: rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
}

/* ===== INFO BAR ===== */
.info-bar {
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.info-bar-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.info-bar-label {
  font-size: 0.7rem;
  color: var(--text-color-secondary);
  margin: 0;
}

.info-bar-value {
  font-size: 0.85rem;
  font-weight: 700;
  margin: 0;
  color: var(--text-color);
}

.info-bar-divider {
  width: 1px;
  height: 2rem;
  background: var(--surface-border);
}

/* ===== HERO INFO BAR ===== */
.hero-info-bar {
  display: flex;
  align-items: center;
  justify-content: space-around;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 0.875rem;
  padding: 0.75rem 0.5rem;
  margin-top: 0.25rem;
}

.hero-info-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.hero-info-item i {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.85);
}

.hero-info-label {
  font-size: 0.6rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  line-height: 1.3;
}

.hero-info-value {
  font-size: 0.78rem;
  font-weight: 700;
  margin: 0;
  color: white;
  line-height: 1.3;
}

.hero-info-divider {
  width: 1px;
  height: 1.75rem;
  background: rgba(255, 255, 255, 0.25);
}

/* ===== FAB ===== */
.fab-container {
  position: fixed;
  bottom: 6rem;
  right: 1.5rem;
  z-index: 998;
}

.fab-button {
  width: 3.5rem !important;
  height: 3.5rem !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2) !important;
}

.fab-button :deep(.p-button-icon) {
  font-size: 1.5rem !important;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 480px) {
  .service-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 0.75rem;
  }

  .service-icon-wrapper {
    width: 3rem;
    height: 3rem;
    border-radius: 0.875rem;
  }

  .service-icon-wrapper i {
    font-size: 1.25rem !important;
  }

  .service-label {
    font-size: 0.68rem;
  }

  .hero-welcome {
    font-size: 1.1rem;
  }

  .fab-container {
    bottom: 7rem;
    right: 1rem;
  }
}

@media (min-width: 769px) {
  .superapp-container {
    padding: 0 1rem;
  }

  .hero-header {
    border-radius: 1.5rem;
    margin: 0 1rem;
  }

  .fab-container {
    bottom: 2rem;
    right: 2rem;
  }

  .service-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .promo-cards {
    flex-direction: row;
  }

  .promo-card {
    flex: 1;
  }
}
</style>
