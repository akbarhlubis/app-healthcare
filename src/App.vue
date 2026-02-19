<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Navbar from './components/layout/Navbar.vue'
import { useAuthStore } from './stores/authStore'
import { useDarkModeStore } from './stores/darkModeStore'

// Initialize stores and router
const router = useRouter()
const authStore = useAuthStore()
const darkModeStore = useDarkModeStore()

// Loading state
const isLoading = ref(false)

// Lifecycle hooks
onMounted(() => {
  // Initialize dark mode and load user
  darkModeStore.initializeDarkMode()
  authStore.loadUser()
  
  // Router navigation guards for loading bar
  router.beforeEach(() => {
    isLoading.value = true
  })
  
  router.afterEach(() => {
    // Add a small delay to show loading bar more visibly
    setTimeout(() => {
      isLoading.value = false
    }, 300)
  })
})
</script>

<template>
  <div style="display: flex; flex-direction: column; min-height: 100vh;">
    <!-- Navbar -->
    <Navbar />

    <!-- Loading Progress Bar -->
    <ProgressBar 
      v-if="isLoading" 
      mode="indeterminate" 
      class="loading-bar"
      style="height: 0.25rem;"
    />

    <!-- Page Content -->
    <div class="page-content">
      <RouterView />
    </div>

    <!-- Login Dialog -->
    <Dialog 
      v-model:visible="authStore.showLoginModal" 
      header="Masuk Ke Sistem"
      :modal="true" 
      style="width: 100%; max-width: 400px;"
      :closable="true"
    >
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <div>
          <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Masukkan Nama Anda</label>
          <InputText 
            v-model="authStore.loginInput" 
            type="text" 
            placeholder="Nama lengkap"
            style="width: 100%; padding: 0.5rem;"
            @keyup.enter="authStore.login(authStore.loginInput)"
          />
        </div>
      </div>
      <template #footer>
        <Button 
          label="Batal" 
          icon="pi pi-times" 
          @click="authStore.closeLoginModal" 
          text
        />
        <Button 
          label="Login" 
          icon="pi pi-sign-in" 
          @click="authStore.login(authStore.loginInput)" 
          :disabled="!authStore.loginInput.trim()"
          autofocus
        />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.loading-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1001;
}

.page-content {
  flex: 1;
  padding: 2rem;
  padding-top: 5.5rem;
  padding-bottom: 80px;
  margin-top: 1rem;
}

/* Desktop adjustments */
@media (min-width: 769px) {
  .page-content {
    padding: 2rem;
    padding-top: 5.5rem;
    padding-bottom: 2rem;
    margin-top: 0;
  }
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .page-content {
    padding: 1rem;
    padding-top: 0.5rem;
    padding-bottom: 100px;
    margin-top: 0;
  }
}
</style>
