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
  router.beforeEach(() => { isLoading.value = true })
  router.afterEach(() => { setTimeout(() => { isLoading.value = false }, 300) })
})
</script>

<template>
  <div class="app-shell">
    <Navbar />
    <ProgressBar v-if="isLoading" mode="indeterminate" class="loading-bar" style="height:3px" />
    <main class="page-content">
      <RouterView />
      <AppFooter />
    </main>

    <Dialog v-model:visible="authStore.showLoginModal" :modal="true" :closable="true" :draggable="false" :style="{ width:'100%', maxWidth:'400px' }">
      <template #header>
        <div class="login-dialog-header">
          <div class="login-dialog-icon"><i class="pi pi-sign-in"></i></div>
          <div>
            <p class="login-dialog-title">Masuk Portal Pasien</p>
            <p class="login-dialog-subtitle">NIK, tanggal lahir, dan password</p>
          </div>
        </div>
      </template>
      <div class="login-dialog-body">
        <div class="login-input-wrapper">
          <i class="pi pi-id-card"></i>
          <InputText v-model="authStore.loginNik" placeholder="Nomor NIK" class="login-input" @keyup.enter="authStore.login()" />
        </div>
        <div class="login-input-wrapper" style="margin-top:0.75rem">
          <i class="pi pi-calendar"></i>
          <Calendar v-model="authStore.loginTglLahir" dateFormat="yy-mm-dd" placeholder="Pilih tanggal lahir" class="login-calendar" showIcon iconDisplay="input" />
        </div>
        <div class="login-input-wrapper" style="margin-top:0.75rem">
          <i class="pi pi-lock"></i>
          <InputText v-model="authStore.loginPassword" type="password" placeholder="Password" class="login-input" @keyup.enter="authStore.login()" />
        </div>
        <p v-if="authStore.error" style="color:var(--red-500);font-size:0.8rem;margin-top:0.5rem">{{ authStore.error }}</p>
        <p style="text-align:center;margin-top:1rem;font-size:0.82rem">
          <a href="#" @click.prevent="authStore.closeLoginModal(); router.push('/forgot-password')" style="color:var(--text-color-secondary);margin-right:1rem">Lupa password?</a>
          <a href="#" @click.prevent="authStore.closeLoginModal(); router.push('/register')">Daftar akun</a>
        </p>
      </div>
      <template #footer>
        <div class="login-dialog-footer">
          <Button label="Batal" icon="pi pi-times" @click="authStore.closeLoginModal" severity="secondary" outlined rounded size="small" />
          <Button label="Masuk" icon="pi pi-sign-in" @click="authStore.login()" :disabled="!authStore.loginNik.trim() || !authStore.loginTglLahir || !authStore.loginPassword.trim()" rounded size="small" :loading="authStore.loading" />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.app-shell { min-height: 100vh; display: flex; flex-direction: column; }
.loading-bar { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; }
.page-content { flex: 1; padding-top: 4.5rem; padding-bottom: 3rem; }
.login-dialog-header { display: flex; align-items: center; gap: 0.75rem; }
.login-dialog-icon { width: 2.5rem; height: 2.5rem; border-radius: 0.75rem; background: var(--primary-50); display: flex; align-items: center; justify-content: center; }
.login-dialog-icon i { font-size: 1.1rem; color: var(--primary-color); }
.login-dialog-title { font-size: 1.1rem; font-weight: 700; margin: 0; }
.login-dialog-subtitle { font-size: 0.8rem; color: var(--text-color-secondary); margin: 0.1rem 0 0; }
.login-dialog-body { padding: 0.5rem 0; }
.login-input-wrapper { display: flex; align-items: center; gap: 0.6rem; background: var(--surface-ground); border: 1px solid var(--surface-border); border-radius: 0.75rem; padding: 0 0.85rem; }
.login-input-wrapper i { color: var(--text-color-secondary); font-size: 0.9rem; }
.login-input { width: 100%; border: none !important; box-shadow: none !important; background: transparent !important; padding: 0.6rem 0 !important; }
.login-calendar { width: 100%; }
.login-input-wrapper :deep(.login-calendar .p-inputtext) { border: none; box-shadow: none; background: transparent; padding-left: 0; }
.login-dialog-footer { display: flex; justify-content: flex-end; gap: 0.5rem; }
@media (max-width: 1023px) {
  .page-content {
    padding-top: 4rem;
    padding-bottom: calc(5.5rem + env(safe-area-inset-bottom, 0px));
  }
}
</style>
