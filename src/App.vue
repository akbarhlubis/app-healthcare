<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Navbar from './components/layout/Navbar.vue'
import AppFooter from './components/layout/AppFooter.vue'
import { useAuthStore } from './stores/authStore'
import { useDarkModeStore } from './stores/darkModeStore'

const router = useRouter()
const authStore = useAuthStore()
const darkModeStore = useDarkModeStore()

const isLoading = ref(false)

onMounted(() => {
  darkModeStore.initializeDarkMode()
  authStore.loadUser()
  
  router.beforeEach(() => {
    isLoading.value = true
  })
  
  router.afterEach(() => {
    setTimeout(() => {
      isLoading.value = false
    }, 300)
  })
})
</script>

<template>
  <div class="app-shell">
    <Navbar />

    <ProgressBar 
      v-if="isLoading" 
      mode="indeterminate" 
      class="loading-bar"
      style="height: 3px;"
    />

    <main class="page-content">
      <RouterView />
      <AppFooter />
    </main>

    <!-- Login Dialog -->
    <Dialog 
      v-model:visible="authStore.showLoginModal" 
      :modal="true" 
      :closable="true"
      :draggable="false"
      :style="{ width: '100%', maxWidth: '400px' }"
      :pt="{ root: { class: 'login-dialog' } }"
    >
      <template #header>
        <div class="login-dialog-header">
          <div class="login-dialog-icon">
            <i class="pi pi-sign-in"></i>
          </div>
          <div>
            <p class="login-dialog-title">Masuk Ke Sistem</p>
            <p class="login-dialog-subtitle">Masukkan nama Anda untuk melanjutkan</p>
          </div>
        </div>
      </template>
      <div class="login-dialog-body">
        <div class="login-input-wrapper">
          <i class="pi pi-user"></i>
          <InputText 
            v-model="authStore.loginInput" 
            type="text" 
            placeholder="Nama lengkap"
            class="login-input"
            @keyup.enter="authStore.login(authStore.loginInput)"
          />
        </div>
      </div>
      <template #footer>
        <div class="login-dialog-footer">
          <Button 
            label="Batal" 
            icon="pi pi-times" 
            @click="authStore.closeLoginModal" 
            severity="secondary"
            outlined
            rounded
            size="small"
          />
          <Button 
            label="Login" 
            icon="pi pi-sign-in" 
            @click="authStore.login(authStore.loginInput)" 
            :disabled="!authStore.loginInput.trim()"
            rounded
            size="small"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--surface-ground);
}

.loading-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1001;
}

.page-content {
  flex: 1;
  padding-top: 4.5rem;
  padding-bottom: 80px;
}

/* Login Dialog */
.login-dialog-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.login-dialog-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.75rem;
  background: var(--primary-50);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.login-dialog-icon i {
  font-size: 1rem;
  color: var(--primary-color);
}

.login-dialog-title {
  font-weight: 700;
  font-size: 1rem;
  margin: 0;
  line-height: 1.3;
}

.login-dialog-subtitle {
  font-size: 0.75rem;
  color: var(--text-color-secondary);
  margin: 0.1rem 0 0;
}

.login-dialog-body {
  padding: 0.5rem 0;
}

.login-input-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--surface-ground);
  border: 1px solid var(--surface-border);
  border-radius: 0.75rem;
  padding: 0 1rem;
  transition: border-color 0.2s;
}

.login-input-wrapper:focus-within {
  border-color: var(--primary-color);
}

.login-input-wrapper i {
  font-size: 0.9rem;
  color: var(--text-color-secondary);
}

.login-input {
  width: 100%;
  border: none !important;
  box-shadow: none !important;
  background: transparent !important;
  padding: 0.65rem 0 !important;
  font-size: 0.9rem;
}

.login-dialog-footer {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

/* Desktop */
@media (min-width: 769px) {
  .page-content {
    padding: 1.5rem 2rem;
    padding-top: 5rem;
    padding-bottom: 2rem;
  }
}

/* Mobile */
@media (max-width: 768px) {
  .page-content {
    padding: 0;
    padding-top: 3.75rem;
    padding-bottom: 72px;
  }
}
</style>
