<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'
import { useDarkModeStore } from '../../stores/darkModeStore'

const router = useRouter()
const authStore = useAuthStore()
const darkModeStore = useDarkModeStore()

const hospitalName = import.meta.env.VITE_HOSPITAL_NAME || 'Rumah Sakit'
const hospitallLogo = import.meta.env.VITE_HOSPITAL_LOGO || 'https://upload.wikimedia.org/wikipedia/commons/2/2b/Lambang_Kabupaten_Tanggamus.png'

const menuItems = [
  { label: 'Home', icon: 'pi pi-home', to: '/' },
  { label: 'Dokter', icon: 'pi pi-calendar', to: '/jadwal-dokter' },
  { label: 'Survey', icon: 'pi pi-chart-bar', to: '/survey-kemasyarakatan' },
  { label: 'Daftar', icon: 'pi pi-user-plus', to: '/daftar-pasien' }
]

const navigateTo = (path) => {
  router.push(path)
}

const isActive = (path) => router.currentRoute.value.path === path
</script>

<template>
  <!-- Desktop Navbar -->
  <div class="navbar-desktop">
    <div class="desktop-inner">
      <div class="desktop-brand" @click="navigateTo('/')" style="cursor: pointer;">
        <img :src="hospitallLogo" class="desktop-logo" alt="Logo" />
        <div>
          <p class="desktop-brand-name">{{ hospitalName }}</p>
          <p class="desktop-brand-sub">Sistem Pelayanan Kesehatan</p>
        </div>
      </div>

      <nav class="desktop-nav">
        <button
          v-for="item in menuItems"
          :key="item.to"
          :class="['desktop-nav-item', { active: isActive(item.to) }]"
          @click="navigateTo(item.to)"
        >
          <i :class="item.icon"></i>
          <span>{{ item.label }}</span>
        </button>
      </nav>

      <div class="desktop-actions">
        <span v-if="authStore.isLoggedIn" class="desktop-user-badge">
          <i class="pi pi-user"></i>
          {{ authStore.userName }}
        </span>
        <Button 
          :icon="darkModeStore.isDarkMode ? 'pi pi-sun' : 'pi pi-moon'" 
          @click="darkModeStore.toggleDarkMode"
          text
          rounded
          size="small"
          v-tooltip.bottom="darkModeStore.isDarkMode ? 'Light Mode' : 'Dark Mode'"
        />
        <Button 
          v-if="!authStore.isLoggedIn"
          icon="pi pi-sign-in" 
          label="Login" 
          severity="primary"
          @click="authStore.openLoginModal"
          size="small"
          rounded
        />
        <Button 
          v-else
          icon="pi pi-sign-out" 
          label="Logout" 
          severity="danger"
          @click="authStore.logout"
          size="small"
          rounded
        />
      </div>
    </div>
  </div>

  <!-- Mobile Header -->
  <div class="navbar-mobile-header">
    <div class="mobile-header-inner">
      <div class="mobile-header-brand" @click="navigateTo('/')" style="cursor: pointer;">
        <img :src="hospitallLogo" class="mobile-header-logo" alt="Logo" />
        <div>
          <p class="mobile-header-name">{{ hospitalName }}</p>
          <p class="mobile-header-sub">Pelayanan Kesehatan</p>
        </div>
      </div>
      <div class="mobile-header-actions">
        <Button 
          :icon="darkModeStore.isDarkMode ? 'pi pi-sun' : 'pi pi-moon'" 
          @click="darkModeStore.toggleDarkMode"
          text
          rounded
          size="small"
          class="mobile-header-btn"
        />
        <Button 
          v-if="!authStore.isLoggedIn"
          icon="pi pi-user"
          @click="authStore.openLoginModal"
          text
          rounded
          size="small"
          class="mobile-header-btn"
        />
        <Avatar 
          v-else
          :label="authStore.userName.charAt(0).toUpperCase()"
          size="small"
          shape="circle"
          style="background: var(--primary-color); color: white; cursor: pointer; font-size: 0.7rem;"
          @click="authStore.logout"
          v-tooltip.bottom="'Logout'"
        />
      </div>
    </div>
  </div>

  <!-- Mobile Bottom Navigation -->
  <div class="navbar-mobile">
    <nav class="mobile-nav-inner">
      <button
        v-for="item in menuItems"
        :key="item.to"
        :class="['mobile-nav-item', { active: isActive(item.to) }]"
        @click="navigateTo(item.to)"
      >
        <span class="mobile-nav-indicator" v-if="isActive(item.to)"></span>
        <i :class="item.icon" class="mobile-nav-icon"></i>
        <span class="mobile-nav-label">{{ item.label }}</span>
      </button>
    </nav>
  </div>
</template>

<style scoped>
/* ===== DESKTOP NAVBAR ===== */
.navbar-desktop {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  background: color-mix(in srgb, var(--surface-card) 80%, transparent);
  border-bottom: 1px solid var(--surface-border);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.desktop-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0.6rem 1.5rem;
  gap: 1.5rem;
}

.desktop-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.desktop-logo {
  height: 2.25rem;
  width: auto;
}

.desktop-brand-name {
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.3;
  color: var(--text-color);
}

.desktop-brand-sub {
  font-size: 0.7rem;
  margin: 0;
  color: var(--text-color-secondary);
}

.desktop-nav {
  display: flex;
  gap: 0.25rem;
  align-items: center;
}

.desktop-nav-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  color: var(--text-color-secondary);
  font-size: 0.85rem;
  font-weight: 500;
  border-radius: 2rem;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  font-family: inherit;
}

.desktop-nav-item:hover {
  background: var(--surface-hover);
  color: var(--text-color);
}

.desktop-nav-item.active {
  background: var(--primary-color);
  color: white;
  font-weight: 600;
}

.desktop-nav-item i {
  font-size: 0.9rem;
}

.desktop-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.desktop-user-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.35rem 0.75rem;
  background: var(--primary-50);
  color: var(--primary-color);
  border-radius: 2rem;
}

.desktop-user-badge i {
  font-size: 0.75rem;
}

/* ===== MOBILE HEADER ===== */
.navbar-mobile-header {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: color-mix(in srgb, var(--surface-card) 80%, transparent);
  border-bottom: 1px solid var(--surface-border);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  z-index: 999;
}

.mobile-header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.65rem 1rem;
}

.mobile-header-brand {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.mobile-header-logo {
  height: 2rem;
  width: auto;
}

.mobile-header-name {
  font-size: 0.95rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.3;
  color: var(--text-color);
}

.mobile-header-sub {
  font-size: 0.65rem;
  margin: 0;
  color: var(--text-color-secondary);
}

.mobile-header-actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.mobile-header-btn {
  width: 2.25rem !important;
  height: 2.25rem !important;
}

/* ===== MOBILE BOTTOM NAV ===== */
.navbar-mobile {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: color-mix(in srgb, var(--surface-card) 80%, transparent);
  border-top: 1px solid var(--surface-border);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  z-index: 1000;
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.mobile-nav-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 72px;
  padding: 0 1rem;
}

.mobile-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  flex: 1;
  border: none;
  background: transparent;
  color: var(--text-color-secondary);
  cursor: pointer;
  padding: 0.6rem 0.25rem;
  position: relative;
  transition: color 0.2s;
  font-family: inherit;
  min-width: 0;
}

.mobile-nav-item.active {
  color: var(--primary-color);
}

.mobile-nav-indicator {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 1.5rem;
  height: 3px;
  background: var(--primary-color);
  border-radius: 0 0 3px 3px;
}

.mobile-nav-icon {
  font-size: 1.35rem;
  transition: transform 0.2s;
}

.mobile-nav-item.active .mobile-nav-icon {
  transform: scale(1.1);
}

.mobile-nav-label {
  font-size: 0.65rem;
  font-weight: 500;
  letter-spacing: 0.03em;
}

.mobile-nav-item.active .mobile-nav-label {
  font-weight: 700;
}

/* ===== BREAKPOINTS ===== */
@media (min-width: 769px) {
  .navbar-desktop {
    display: block;
  }
  .navbar-mobile-header,
  .navbar-mobile {
    display: none !important;
  }
}

@media (max-width: 768px) {
  .navbar-desktop {
    display: none !important;
  }
  .navbar-mobile-header {
    display: block;
  }
  .navbar-mobile {
    display: flex;
  }
}
</style>
