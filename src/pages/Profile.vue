<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { apiFetch } from '../utils/api'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Message from 'primevue/message'

const router = useRouter()
const authStore = useAuthStore()
const email = ref('')
const loading = ref(false)
const success = ref('')
const error = ref('')
const sessions = ref([])
const sessionsLoading = ref(false)
const sessionsError = ref('')

onMounted(() => {
  if (!authStore.isLoggedIn) return router.push('/')
  email.value = authStore.userEmail || ''
  fetchSessions()
})

const fetchSessions = async () => {
  sessionsLoading.value = true
  sessionsError.value = ''
  try {
    const data = await apiFetch('/sessions')
    sessions.value = data.response?.sessions || data.response || []
  } catch (e) {
    sessions.value = []
    sessionsError.value = e.message || 'Info perangkat belum tersedia'
  }
  finally { sessionsLoading.value = false }
}

const handleUpdate = async () => {
  error.value = ''; success.value = ''
  loading.value = true
  try {
    await apiFetch('/profile', { method: 'PUT', body: JSON.stringify({ email: email.value.trim() }) })
    authStore.userEmail = email.value.trim()
    success.value = 'Email berhasil diperbarui!'
  } catch (e) {
    error.value = e.message || 'Gagal memperbarui'
  } finally { loading.value = false }
}

const handleLogoutAll = async () => {
  try {
    await apiFetch('/logout-all', { method: 'POST' })
    authStore.logout()
    router.push('/')
  } catch (e) {
    error.value = e.message || 'Gagal logout semua perangkat'
  }
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div class="page-header-icon" style="background:var(--primary-50)"><i class="pi pi-user-edit" style="color:var(--primary-color)"></i></div>
      <div>
        <h1 class="page-title">Profil Saya</h1>
        <p class="page-subtitle">Perbarui informasi akun Anda</p>
      </div>
    </div>
    <Message v-if="success" severity="success" style="margin-bottom:1rem;border-radius:0.75rem">{{ success }}</Message>
    <Message v-if="error" severity="error" style="margin-bottom:1rem;border-radius:0.75rem">{{ error }}</Message>
    <div class="card">
      <div class="info-row"><span class="info-label">Nama</span><span class="info-value">{{ authStore.userName }}</span></div>
      <div class="info-row"><span class="info-label">No. RM</span><span class="info-value">{{ authStore.userNoRm || '-' }}</span></div>
      <hr style="border-color:var(--surface-border);margin:1rem 0" />
      <Button label="Riwayat Kunjungan" icon="pi pi-history" severity="secondary" outlined rounded @click="router.push('/riwayat-kunjungan')" style="width:100%;margin-bottom:0.75rem" />
      <div class="field"><label>Email</label><div class="input-icon"><i class="pi pi-envelope"></i><InputText v-model="email" placeholder="email@example.com" style="width:100%" /></div></div>
      <Button label="Simpan" icon="pi pi-check" severity="primary" rounded :loading="loading" @click="handleUpdate" style="width:100%" />
    </div>

    <div class="card" style="margin-top:1rem">
      <h3 style="font-size:0.95rem;font-weight:700;margin:0 0 0.75rem">Perangkat Aktif</h3>
      <div v-if="sessionsLoading" style="text-align:center;color:var(--text-color-secondary);padding:1rem">Memuat...</div>
      <div v-else>
        <Message v-if="sessionsError" severity="warn" style="margin-bottom:0.75rem;border-radius:0.75rem">{{ sessionsError }}</Message>
        <div v-for="s in sessions" :key="s.id" class="session-row">
          <i :class="s.is_current ? 'pi pi-circle-fill' : 'pi pi-circle'" style="font-size:0.5rem" :style="{ color: s.is_current ? 'var(--green-500)' : 'var(--text-color-secondary)' }"></i>
          <div style="flex:1;min-width:0">
            <p class="session-device">{{ s.device_name || 'Perangkat' }}</p>
            <p class="session-meta">{{ s.ip_address || '-' }} - {{ s.created_at || '-' }}</p>
          </div>
          <span v-if="s.is_current" style="font-size:0.65rem;color:var(--green-500);font-weight:600;flex-shrink:0">Sekarang</span>
        </div>
        <div v-if="!sessionsError && sessions.length === 0" style="text-align:center;color:var(--text-color-secondary);padding:1rem">Tidak ada sesi aktif</div>
      </div>
      <Button v-if="sessions.length > 1" label="Logout Semua Perangkat" icon="pi pi-sign-out" severity="danger" text size="small" @click="handleLogoutAll" style="width:100%;margin-top:0.75rem" />
    </div>
  </div>
</template>

<style scoped>
.page { max-width: 700px; margin: 0 auto; padding: 0 1rem 3rem; }
.page-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
.page-header-icon { width: 3rem; height: 3rem; border-radius: 0.875rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.page-header-icon i { font-size: 1.25rem; }
.page-title { font-size: 1.5rem; font-weight: 700; margin: 0; color: var(--text-color); }
.page-subtitle { font-size: 0.8rem; color: var(--text-color-secondary); margin: 0.15rem 0 0; }
.card { background: var(--surface-card); border: 1px solid var(--surface-border); border-radius: 1rem; padding: 1.5rem; }
.info-row { display: flex; justify-content: space-between; gap: 1rem; padding: 0.5rem 0; }
.info-label { font-weight: 600; font-size: 0.85rem; color: var(--text-color-secondary); }
.info-value { min-width: 0; font-size: 0.9rem; color: var(--text-color); text-align: right; overflow-wrap: anywhere; }
.field { margin-bottom: 1rem; }
.field label { display: block; font-weight: 600; font-size: 0.85rem; margin-bottom: 0.4rem; }
.input-icon { display: flex; align-items: center; gap: 0.6rem; background: var(--surface-ground); border: 1px solid var(--surface-border); border-radius: 0.75rem; padding: 0 0.85rem; }
.input-icon i { color: var(--text-color-secondary); font-size: 0.9rem; }
.session-row { display: flex; align-items: center; gap: 0.6rem; padding: 0.6rem 0; border-bottom: 1px solid var(--surface-border); }
.session-row:last-child { border-bottom: none; }
.session-device { font-size: 0.82rem; font-weight: 600; margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.session-meta { font-size: 0.7rem; color: var(--text-color-secondary); margin: 0.15rem 0 0; overflow-wrap: anywhere; }

@media (max-width: 480px) {
  .page { padding: 0 1rem 3rem; }
  .card { padding: 1.25rem; }
  .info-row { flex-direction: column; gap: 0.15rem; }
  .info-value { text-align: left; }
}
</style>
