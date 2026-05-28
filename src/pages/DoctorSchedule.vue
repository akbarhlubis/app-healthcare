<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useDoctorSchedule } from '../composables/useDoctorSchedule'

const searchQuery = ref('')
const selectedDay = ref('all')
const selectedPoli = ref('all')

const { schedules, loading, error, fetchSchedules } = useDoctorSchedule()
onMounted(() => { fetchSchedules() })

watch([selectedDay, selectedPoli], ([day, poli]) => {
  const params = {}
  if (day !== 'all') params.hari = day
  if (poli !== 'all') params.kd_poli = poli
  fetchSchedules(params)
})

const filteredSchedules = computed(() => {
  let list = schedules.value
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(d => d.nm_dokter.toLowerCase().includes(q) || d.nm_poli.toLowerCase().includes(q))
  }
  return list
})

const allPoli = ref(new Map())
const uniquePoli = computed(() => {
  schedules.value.forEach(d => { allPoli.value.set(d.kd_poli, d.nm_poli) })
  return [{ label: 'Semua Poli', value: 'all' }, ...Array.from(allPoli.value, ([value, label]) => ({ value, label }))]
})

const days = [
  { label: 'Semua', value: 'all' }, { label: 'Senin', value: 'SENIN' }, { label: 'Selasa', value: 'SELASA' },
  { label: 'Rabu', value: 'RABU' }, { label: 'Kamis', value: 'KAMIS' }, { label: 'Jumat', value: 'JUMAT' }, { label: 'Sabtu', value: 'SABTU' }
]

const formatTime = (t) => t?.slice(0,5) || ''
const doctorInitial = (name = '') => {
  const cleaned = name.replace(/^dr\.?\s*/i, '').trim()
  return cleaned.charAt(0).toUpperCase() || 'D'
}

const perPage = 10
const currentPage = ref(1)
watch([searchQuery, selectedDay, selectedPoli], () => { currentPage.value = 1 })
const totalPages = computed(() => Math.ceil(filteredSchedules.value.length / perPage))
const pagedSchedules = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return filteredSchedules.value.slice(start, start + perPage)
})
const goToPage = (page) => { if (page >= 1 && page <= totalPages.value) currentPage.value = page }
</script>

<template>
  <div class="doctor-page">
    <div class="page-header">
      <div class="page-header-icon"><i class="pi pi-calendar"></i></div>
      <div>
        <h1 class="page-title">Jadwal Dokter</h1>
        <p class="page-subtitle">{{ filteredSchedules.length }} dokter tersedia</p>
      </div>
    </div>

    <div class="filter-section">
      <div class="search-bar">
        <i class="pi pi-search search-icon"></i>
        <InputText v-model="searchQuery" placeholder="Cari nama dokter atau poli..." class="search-input" />
      </div>
      <div class="day-filter-scroll">
        <SelectButton v-model="selectedDay" :options="days" optionLabel="label" optionValue="value" />
      </div>
      <div style="margin-top:0.75rem">
        <Select v-model="selectedPoli" :options="uniquePoli" optionLabel="label" optionValue="value" placeholder="Filter Poli" style="width:100%" />
      </div>
    </div>

    <div class="doctor-list">
      <div v-if="loading" class="loading-state">
        <ProgressBar mode="indeterminate" style="height:4px;margin-bottom:1.5rem" />
        <p style="text-align:center;color:var(--text-color-secondary)">Memuat jadwal dokter...</p>
      </div>
      <div v-else-if="error" class="error-state">
        <Message severity="error">{{ error }}</Message>
      </div>
      <template v-else>
        <div v-for="item in pagedSchedules" :key="item.kd_dokter + item.kd_poli + item.hari_kerja + item.jam_mulai" class="doctor-card">
          <div class="doctor-header">
            <Avatar :label="doctorInitial(item.nm_dokter)" size="large" shape="circle" style="background:var(--primary-color);color:white;flex-shrink:0" />
            <div class="doctor-header-info">
              <p class="doctor-name">{{ item.nm_dokter }}</p>
              <Tag :value="item.nm_poli" severity="info" rounded />
            </div>
            <Tag :value="item.hari_kerja" severity="success" rounded class="status-tag" />
          </div>
          <div class="doctor-details">
            <div class="detail-row"><i class="pi pi-clock"></i><span>{{ formatTime(item.jam_mulai) }} - {{ formatTime(item.jam_selesai) }}</span></div>
            <div class="detail-row"><i class="pi pi-calendar-clock"></i><span>{{ item.hari_kerja }}</span></div>
          </div>
        </div>
        <Card v-if="filteredSchedules.length === 0">
          <template #content>
            <div style="text-align:center;padding:2rem">
              <div style="font-size:2.5rem;margin-bottom:0.75rem;color:var(--primary-color)">
                <i class="pi pi-search"></i>
              </div>
              <p style="font-weight:600;margin:0 0 0.5rem">Jadwal tidak ditemukan</p>
              <p style="font-size:0.8rem;color:var(--text-color-secondary);margin:0">Coba ubah kata kunci atau filter</p>
            </div>
          </template>
        </Card>
        <div v-if="totalPages > 1" class="pagination">
          <Button icon="pi pi-chevron-left" severity="secondary" text rounded :disabled="currentPage === 1" @click="goToPage(currentPage - 1)" />
          <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
          <Button icon="pi pi-chevron-right" severity="secondary" text rounded :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)" />
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.doctor-page { max-width: 800px; margin: 0 auto; padding: 0 1rem; }
.page-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
.page-header-icon { width: 3rem; height: 3rem; border-radius: 0.875rem; background: var(--primary-50); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.page-header-icon i { font-size: 1.25rem; color: var(--primary-color); }
.page-title { font-size: 1.5rem; font-weight: 700; margin: 0; color: var(--text-color); }
.page-subtitle { font-size: 0.8rem; color: var(--text-color-secondary); margin: 0.15rem 0 0; }
.filter-section { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.5rem; }
.search-bar { display: flex; align-items: center; gap: 0.5rem; background: var(--surface-card); border: 1px solid var(--surface-border); border-radius: 0.75rem; padding: 0 0.85rem; }
.search-icon { color: var(--text-color-secondary); font-size: 0.9rem; }
.search-input { width: 100%; border: none !important; box-shadow: none !important; background: transparent !important; padding: 0.6rem 0 !important; }
.day-filter-scroll { overflow-x: auto; }
.doctor-list { display: flex; flex-direction: column; gap: 0.75rem; }
.doctor-card { background: var(--surface-card); border: 1px solid var(--surface-border); border-radius: 0.875rem; padding: 1rem; }
.doctor-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; }
.doctor-header-info { flex: 1; }
.doctor-name { font-weight: 600; font-size: 0.9rem; margin: 0 0 0.25rem; }
.status-tag { margin-left: auto; }
.doctor-details { display: flex; flex-direction: column; gap: 0.35rem; }
.detail-row { display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; color: var(--text-color-secondary); }
.detail-row i { font-size: 0.75rem; }
.pagination { display: flex; align-items: center; justify-content: center; gap: 1rem; margin-top: 1rem; padding: 0.5rem; }
.page-info { font-size: 0.85rem; font-weight: 600; color: var(--text-color-secondary); }
</style>
