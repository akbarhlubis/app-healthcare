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
  {
    label: 'Home',
    icon: 'pi pi-home',
    to: '/'
  },
  {
    label: 'Jadwal Dokter',
    icon: 'pi pi-calendar',
    to: '/jadwal-dokter'
  },
  {
    label: 'Survey Kemasyarakatan',
    icon: 'pi pi-file',
    to: '/survey-kemasyarakatan'
  },
  {
    label: 'Daftar Pasien',
    icon: 'pi pi-users',
    to: '/daftar-pasien'
  }
]

const navigateTo = (path) => {
  router.push(path)
}
</script>

<template>
  <!-- Desktop Navbar -->
  <Toolbar class="navbar-desktop mb-4 shadow-md border-b">
    <template #start>
      <div style="display: flex; align-items: center; gap: 1rem;">
        <img :src="hospitallLogo" style="height: 2.5rem; width: auto;" alt="Logo Rumah Sakit" />
        <div>
          <p style="font-size: 1.25rem; font-weight: bold; margin: 0;">{{ hospitalName }}</p>
          <p style="font-size: 0.875rem; margin: 0;">Sistem Pelayanan Kesehatan</p>
        </div>
      </div>
    </template>

    <template #center>
      <div style="display: flex; gap: 0.5rem;">
        <Button
          v-for="item in menuItems"
          :key="item.to"
          :label="item.label"
          :icon="item.icon"
          :outlined="router.currentRoute.value.path !== item.to"
          :severity="router.currentRoute.value.path === item.to ? 'primary' : 'secondary'"
          size="small"
          @click="navigateTo(item.to)"
        />
      </div>
    </template>

    <template #end>
      <div style="display: flex; gap: 0.5rem; align-items: center;">
        <span v-if="authStore.isLoggedIn" style="font-weight: 600; margin-right: 1rem;">{{ authStore.userName }}</span>
        <Button 
          :icon="darkModeStore.isDarkMode ? 'pi pi-sun' : 'pi pi-moon'" 
          @click="darkModeStore.toggleDarkMode"
          text
          rounded
          size="small"
          v-tooltip="darkModeStore.isDarkMode ? 'Light Mode' : 'Dark Mode'"
        />
        <Button 
          v-if="!authStore.isLoggedIn"
          icon="pi pi-sign-in" 
          label="Login" 
          severity="info"
          @click="authStore.openLoginModal"
          size="small"
        />
        <Button 
          v-else
          icon="pi pi-sign-out" 
          label="Logout" 
          severity="danger"
          @click="authStore.logout"
          size="small"
        />
      </div>
    </template>
  </Toolbar>

  <!-- Mobile Header -->
  <div class="navbar-mobile-header">
    <div style="display: flex; align-items: center; justify-content: space-between; padding: 1rem;">
      <div style="display: flex; align-items: center; gap: 1rem;">
        <img :src="hospitallLogo" style="height: 2.5rem; width: auto;" alt="Logo Rumah Sakit" />
        <div>
          <p style="font-size: 1.125rem; font-weight: bold; margin: 0;">{{ hospitalName }}</p>
          <p style="font-size: 0.75rem; margin: 0;">Sistem Pelayanan Kesehatan</p>
        </div>
      </div>
      <Button 
        :icon="darkModeStore.isDarkMode ? 'pi pi-sun' : 'pi pi-moon'" 
        @click="darkModeStore.toggleDarkMode"
        text
        rounded
        v-tooltip="darkModeStore.isDarkMode ? 'Light Mode' : 'Dark Mode'"
        style="font-size: 1.25rem;"
      />
    </div>
  </div>

  <!-- Mobile Bottom Navigation -->
  <div class="navbar-mobile">
    <div style="display: flex; justify-content: space-around; align-items: center; height: 100%; padding: 0.5rem;">
      <Button
        v-for="item in menuItems"
        :key="item.to"
        :icon="item.icon"
        :severity="router.currentRoute.value.path === item.to ? 'primary' : 'secondary'"
        text
        rounded
        @click="navigateTo(item.to)"
        class="mobile-nav-button"
        v-tooltip="item.label"
      />
      <Button 
        :icon="darkModeStore.isDarkMode ? 'pi pi-sun' : 'pi pi-moon'" 
        @click="darkModeStore.toggleDarkMode"
        text
        rounded
        class="mobile-nav-button"
        v-tooltip="darkModeStore.isDarkMode ? 'Light Mode' : 'Dark Mode'"
      />
      <Button 
        v-if="!authStore.isLoggedIn"
        icon="pi pi-sign-in" 
        @click="authStore.openLoginModal"
        text
        rounded
        class="mobile-nav-button"
        v-tooltip="'Login'"
      />
      <Button 
        v-else
        icon="pi pi-sign-out" 
        @click="authStore.logout"
        text
        rounded
        class="mobile-nav-button"
        v-tooltip="'Logout'"
      />
    </div>
  </div>
</template>

<style scoped>
.navbar-desktop {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
}

.navbar-mobile-header {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: var(--surface-card);
  border-bottom: 1px solid var(--surface-border);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 999;
}

.navbar-mobile {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: var(--surface-card);
  border-top: 1px solid var(--surface-border);
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.mobile-nav-button {
  flex: 1;
  display: flex !important;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0.75rem !important;
  height: 100%;
}

.mobile-nav-button :deep(.p-button-icon) {
  font-size: 1.5rem !important;
}

/* Desktop view - show top navbar, hide mobile nav */
@media (min-width: 769px) {
  .navbar-desktop {
    display: flex;
  }
  
  .navbar-mobile-header {
    display: none !important;
  }
  
  .navbar-mobile {
    display: none !important;
  }
}

/* Mobile view - show mobile header and bottom nav, hide desktop navbar */
@media (max-width: 768px) {
  .navbar-desktop {
    display: none;
  }
  
  .navbar-mobile-header {
    display: block;
  }
  
  .navbar-mobile {
    display: flex;
  }
}
</style>
