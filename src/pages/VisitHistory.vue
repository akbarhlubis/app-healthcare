<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { apiFetch } from '../utils/api'
import Tag from 'primevue/tag'
import ProgressBar from 'primevue/progressbar'
import Message from 'primevue/message'

const router = useRouter()
const authStore = useAuthStore()
const riwayat = ref([])
const loading = ref(true)
const error = ref('')

onMounted(() => {
  if (!authStore.isLoggedIn) return router.push('/')
  fetchRiwayat()
})

const fetchRiwayat = async () => {
  loading.value = true
  error.value = ''
  try {
    const data = await apiFetch('/riwayat')
    riwayat.value = data.response || []
  } catch (e) {
    riwayat.value = []
    error.value = e.message || 'Riwayat kunjungan belum dapat dimuat'
  }
  finally { loading.value = false }
}

const visitDateDay = (date) => date?.split('-')?.[2] || '-'
const visitDateMonth = (date) => {
  const monthIndex = Number(date?.split('-')?.[1] || 1) - 1
  return ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'][monthIndex] || '-'
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div class="page-header-icon" style="background:var(--primary-50)"><i class="pi pi-history" style="color:var(--primary-color)"></i></div>
      <div>
        <h1 class="page-title">Riwayat Kunjungan</h1>
        <p class="page-subtitle">{{ riwayat.length }} kunjungan tercatat</p>
      </div>
    </div>

    <div v-if="loading" style="padding:2rem 0">
      <ProgressBar mode="indeterminate" style="height:4px" />
    </div>

    <Message v-else-if="error" severity="warn" style="margin-bottom:1rem;border-radius:0.75rem">{{ error }}</Message>

    <div v-else class="card">
      <div v-if="riwayat.length === 0" style="text-align:center;color:var(--text-color-secondary);padding:2rem">Belum ada riwayat kunjungan</div>
      <div v-for="(r, i) in riwayat" :key="i" class="visit-row">
        <div class="visit-date">
          <span class="date-day">{{ visitDateDay(r.tgl_registrasi) }}</span>
          <span class="date-month">{{ visitDateMonth(r.tgl_registrasi) }}</span>
        </div>
        <div style="flex:1;min-width:0">
          <p class="visit-poli">{{ r.nm_poli || 'Poli' }}</p>
          <p class="visit-doctor">{{ r.nm_dokter || '-' }}</p>
          <p class="visit-time">{{ r.jam_reg?.slice(0,5) || '-' }} WIB</p>
        </div>
        <Tag :value="r.status_lanjut" :severity="r.status_lanjut === 'Ralan' ? 'info' : 'warn'" rounded />
      </div>
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
.card { background: var(--surface-card); border: 1px solid var(--surface-border); border-radius: 1rem; padding: 0.5rem 1rem; }
.visit-row { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 0; border-bottom: 1px solid var(--surface-border); }
.visit-row:last-child { border-bottom: none; }
.visit-date { display: flex; flex-direction: column; align-items: center; width: 2.5rem; flex-shrink: 0; }
.date-day { font-size: 1.1rem; font-weight: 700; line-height: 1; color: var(--primary-color); }
.date-month { font-size: 0.6rem; color: var(--text-color-secondary); text-transform: uppercase; }
.visit-poli { font-size: 0.85rem; font-weight: 600; margin: 0; }
.visit-doctor { font-size: 0.75rem; color: var(--text-color-secondary); margin: 0.15rem 0 0; }
.visit-time { font-size: 0.7rem; color: var(--text-color-secondary); margin: 0.1rem 0 0; }
</style>
