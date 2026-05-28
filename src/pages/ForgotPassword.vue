<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { authApi } from '../utils/api'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Message from 'primevue/message'

const email = ref('')
const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)
const success = ref('')
const error = ref('')

const handleSubmit = async () => {
  error.value = ''; success.value = ''
  if (!email.value.trim()) { error.value = 'Email wajib diisi'; return }
  loading.value = true
  try {
    await authApi.forgotPassword(email.value.trim())
    success.value = 'Jika email terdaftar, link reset password telah dikirim ke email Anda.'
    email.value = ''
  } catch (e) {
    error.value = e.message || 'Gagal mengirim'
  } finally { loading.value = false }
}

const openLogin = () => {
  router.push('/')
  authStore.openLoginModal()
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div class="page-header-icon" style="background:var(--primary-50)"><i class="pi pi-lock" style="color:var(--primary-color)"></i></div>
      <div>
        <h1 class="page-title">Lupa Password</h1>
        <p class="page-subtitle">Masukkan email Anda untuk reset password</p>
      </div>
    </div>
    <Message v-if="success" severity="success" style="margin-bottom:1rem;border-radius:0.75rem">{{ success }}</Message>
    <Message v-if="error" severity="error" style="margin-bottom:1rem;border-radius:0.75rem">{{ error }}</Message>
    <div class="card">
      <div class="field">
        <label>Email</label>
        <div class="input-icon"><i class="pi pi-envelope"></i><InputText v-model="email" placeholder="email@example.com" style="width:100%" /></div>
      </div>
      <Button label="Kirim Link Reset" icon="pi pi-send" severity="primary" rounded :loading="loading" @click="handleSubmit" style="width:100%" />
      <p style="text-align:center;margin-top:1rem;font-size:0.85rem;color:var(--text-color-secondary)">
        <a href="#" style="color:var(--primary-color)" @click.prevent="openLogin">Kembali ke login</a>
      </p>
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
