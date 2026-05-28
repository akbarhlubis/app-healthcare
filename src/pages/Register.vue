<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { authApi } from '../utils/api'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Message from 'primevue/message'

const router = useRouter()
const authStore = useAuthStore()
onMounted(() => { if (authStore.isLoggedIn) router.push('/') })

const noKtp = ref('')
const fmtDate = (d) => { if (!d) return ''; const dt = new Date(d); return dt.getFullYear() + '-' + String(dt.getMonth()+1).padStart(2,'0') + '-' + String(dt.getDate()).padStart(2,'0') }
const email = ref('')
const tglLahir = ref(null)
const password = ref('')
const passwordConfirmation = ref('')
const loading = ref(false)
const success = ref('')
const error = ref('')

const handleRegister = async () => {
  error.value = ''
  success.value = ''
  if (!noKtp.value.trim() || !tglLahir.value || !password.value.trim()) {
    error.value = 'NIK, tanggal lahir, dan password wajib diisi'
    return
  }
  if (password.value.length < 8) {
    error.value = 'Password minimal 8 karakter'
    return
  }
  if (password.value !== passwordConfirmation.value) {
    error.value = 'Konfirmasi password tidak cocok'
    return
  }
  loading.value = true
  try {
    await authApi.register({
      no_ktp: noKtp.value.trim(),
      tgl_lahir: fmtDate(tglLahir.value),
      email: email.value.trim() || undefined,
      password: password.value,
      password_confirmation: passwordConfirmation.value,
    })
    success.value = 'Registrasi berhasil! Anda dapat login sekarang.'
    noKtp.value = ''
    tglLahir.value = null
    email.value = ''
    password.value = ''
    passwordConfirmation.value = ''
  } catch (e) {
    error.value = e.message || 'Registrasi gagal'
  } finally { loading.value = false }
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div class="page-header-icon" style="background:var(--primary-50)">
        <i class="pi pi-user-plus" style="color:var(--primary-color)"></i>
      </div>
      <div>
        <h1 class="page-title">Registrasi Pasien</h1>
        <p class="page-subtitle">Daftar akun dengan NIK + tanggal lahir</p>
      </div>
    </div>

    <Message v-if="success" severity="success" style="margin-bottom:1rem;border-radius:0.75rem">
      {{ success }}
      <br><a href="#" @click.prevent="authStore.openLoginModal()" style="color:var(--primary-color);font-weight:600">Klik di sini untuk login</a>
    </Message>
    <Message v-if="error" severity="error" style="margin-bottom:1rem;border-radius:0.75rem">{{ error }}</Message>

    <div class="card">
      <div class="field">
        <label>NIK <span style="color:var(--red-500)">*</span></label>
        <div class="input-icon"><i class="pi pi-id-card"></i><InputText v-model="noKtp" placeholder="Nomor NIK Anda" style="width:100%" /></div>
      </div>
      <div class="field">
        <label>Email <span style="color:var(--text-color-secondary);font-weight:400">(opsional)</span></label>
        <div class="input-icon"><i class="pi pi-envelope"></i><InputText v-model="email" placeholder="email@example.com" style="width:100%" /></div>
      </div>
      <div class="field">
        <label>Tanggal Lahir <span style="color:var(--red-500)">*</span></label>
        <div class="input-icon"><i class="pi pi-calendar"></i><Calendar v-model="tglLahir" dateFormat="yy-mm-dd" placeholder="Pilih tanggal lahir" style="width:100%" showIcon iconDisplay="input" /></div>
      </div>
      <div class="field">
        <label>Password <span style="color:var(--red-500)">*</span></label>
        <div class="input-icon"><i class="pi pi-lock"></i><InputText v-model="password" type="password" placeholder="Minimal 8 karakter" style="width:100%" /></div>
      </div>
      <div class="field">
        <label>Konfirmasi Password <span style="color:var(--red-500)">*</span></label>
        <div class="input-icon"><i class="pi pi-lock"></i><InputText v-model="passwordConfirmation" type="password" placeholder="Ulangi password" style="width:100%" /></div>
      </div>
      <Button label="Daftar" icon="pi pi-user-plus" severity="success" rounded :loading="loading" @click="handleRegister" style="width:100%;margin-top:0.5rem" />
      <p style="text-align:center;margin-top:1rem;font-size:0.85rem;color:var(--text-color-secondary)">
        Sudah punya akun? <a href="#" @click.prevent="authStore.openLoginModal()" style="color:var(--primary-color);font-weight:600">Login di sini</a>
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
