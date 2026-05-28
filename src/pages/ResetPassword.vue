<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { authApi } from '../utils/api'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Message from 'primevue/message'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const password = ref('')
const passwordConfirmation = ref('')
const loading = ref(false)
const success = ref('')
const error = ref('')
const email = ref('')
const token = ref('')

onMounted(() => {
  email.value = route.query.email || ''
  token.value = route.query.token || ''
  if (!email.value || !token.value) {
    error.value = 'Link reset tidak valid. Silakan minta ulang.'
  }
})

const handleSubmit = async () => {
  error.value = ''; success.value = ''
  if (password.value.length < 8) { error.value = 'Password minimal 8 karakter'; return }
  if (password.value !== passwordConfirmation.value) { error.value = 'Konfirmasi password tidak cocok'; return }
  loading.value = true
  try {
    await authApi.resetPassword(email.value, token.value, password.value, passwordConfirmation.value)
    success.value = 'Password berhasil diubah!'
    setTimeout(() => {
      router.push('/')
      authStore.openLoginModal()
    }, 2000)
  } catch (e) {
    error.value = e.message || 'Gagal reset password'
  } finally { loading.value = false }
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div class="page-header-icon" style="background:var(--primary-50)"><i class="pi pi-shield" style="color:var(--primary-color)"></i></div>
      <div>
        <h1 class="page-title">Reset Password</h1>
        <p class="page-subtitle">Buat password baru Anda</p>
      </div>
    </div>
    <Message v-if="success" severity="success" style="margin-bottom:1rem;border-radius:0.75rem">{{ success }}</Message>
    <Message v-if="error" severity="error" style="margin-bottom:1rem;border-radius:0.75rem">{{ error }}</Message>
    <div v-if="email && token" class="card">
      <div class="field">
        <label>Password Baru</label>
        <div class="input-icon"><i class="pi pi-lock"></i><InputText v-model="password" type="password" placeholder="Min 8 karakter" style="width:100%" /></div>
      </div>
      <div class="field">
        <label>Konfirmasi Password</label>
        <div class="input-icon"><i class="pi pi-lock"></i><InputText v-model="passwordConfirmation" type="password" placeholder="Ulangi password" style="width:100%" /></div>
      </div>
      <Button label="Reset Password" icon="pi pi-check" severity="primary" rounded :loading="loading" @click="handleSubmit" style="width:100%" />
    </div>
  </div>
</template>

<style scoped>
.page { max-width: 440px; margin: 0 auto; padding: 0 1rem 3rem; }
.page-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
.page-header-icon { width: 3rem; height: 3rem; border-radius: 0.875rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.page-header-icon i { font-size: 1.25rem; }
.page-title { font-size: 1.5rem; font-weight: 700; margin: 0; color: var(--text-color); }
.page-subtitle { font-size: 0.8rem; color: var(--text-color-secondary); margin: 0.15rem 0 0; }
.card { background: var(--surface-card); border: 1px solid var(--surface-border); border-radius: 1rem; padding: 1.5rem; }
.field { margin-bottom: 1rem; }
.field label { display: block; font-weight: 600; font-size: 0.85rem; margin-bottom: 0.4rem; }
.input-icon { display: flex; align-items: center; gap: 0.6rem; background: var(--surface-ground); border: 1px solid var(--surface-border); border-radius: 0.75rem; padding: 0 0.85rem; }
.input-icon i { color: var(--text-color-secondary); font-size: 0.9rem; }
</style>
