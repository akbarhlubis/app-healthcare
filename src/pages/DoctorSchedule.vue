<script setup>

import { ref, computed, onMounted, watch } from 'vue'
import { useDoctorSchedule } from '../composables/useDoctorSchedule'

const searchQuery = ref('')
const selectedDay = ref('all')
const selectedPoli = ref('all')

const { schedules, loading, error, fetchSchedules } = useDoctorSchedule()

// Fetch all schedules on mount
onMounted(() => {
  fetchSchedules()
})

// Refetch when filters change
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
    list = list.filter(d =>
      d.nm_dokter.toLowerCase().includes(q) ||
      d.nm_poli.toLowerCase().includes(q)
    )
  }
  return list
})

const uniquePoli = computed(() => {
  const map = new Map()
  schedules.value.forEach(d => {
    map.set(d.kd_poli, d.nm_poli)
  })
  return [{ label: 'Semua Poli', value: 'all' }, ...Array.from(map, ([value, label]) => ({ value, label }))]
})

const days = [
  { label: 'Semua', value: 'all' },
  { label: 'Senin', value: 'Senin' },
  { label: 'Selasa', value: 'Selasa' },
  { label: 'Rabu', value: 'Rabu' },
  { label: 'Kamis', value: 'Kamis' },
  { label: 'Jumat', value: 'Jumat' },
  { label: 'Sabtu', value: 'Sabtu' }
]


const formatTime = (t) => t?.slice(0,5) || ''
</script>

<template>
  <div class="doctor-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="page-header-icon">
        <i class="pi pi-calendar"></i>
      </div>
      <div>
        <h1 class="page-title">Jadwal Dokter</h1>
        <p class="page-subtitle">{{ filteredSchedules.length }} dokter tersedia</p>
      </div>
    </div>

    <!-- Search & Filter -->
    <div class="filter-section">
      <div class="search-bar">
        <i class="pi pi-search search-icon"></i>
        <InputText 
          v-model="searchQuery"
          placeholder="Cari nama dokter atau poli..."
          class="search-input"
        />
      </div>
      <div class="day-filter-scroll">
        <button
          v-for="day in days"
          :key="day.value"
          :class="['day-chip', { active: selectedDay === day.value }]"
          @click="selectedDay = day.value"
        >
          {{ day.label }}
        </button>
      </div>
    </div>

    <!-- Doctor Schedule Cards -->
    <div class="doctor-list">
      <div v-if="loading" class="loading-state">
        <ProgressBar mode="indeterminate" style="height: 4px; margin-bottom: 1.5rem;" />
        <p style="text-align:center; color: var(--text-color-secondary);">Memuat jadwal dokter...</p>
      </div>
      <div v-else-if="error" class="error-state">
        <Message severity="error">{{ error }}</Message>
      </div>
      <template v-else>
        <div 
          v-for="item in filteredSchedules" 
          :key="item.kd_dokter + item.kd_poli + item.hari_kerja + item.jam_mulai"
          class="doctor-card"
        >
          <div class="doctor-header">
            <Avatar 
              :label="item.nm_dokter.charAt(4)" 
              size="large"
              shape="circle"
              style="background: var(--primary-color); color: white; flex-shrink: 0;"
            />
            <div class="doctor-header-info">
              <p class="doctor-name">{{ item.nm_dokter }}</p>
              <Tag :value="item.nm_poli" severity="info" rounded />
            </div>
            <Tag 
              :value="item.hari_kerja" 
              severity="success"
              rounded
              class="status-tag"
            />
          </div>

          <div class="doctor-details">
            <div class="detail-row">
              <i class="pi pi-clock"></i>
              <span>{{ formatTime(item.jam_mulai) }} - {{ formatTime(item.jam_selesai) }}</span>
            </div>
            <div class="detail-row">
              <i class="pi pi-calendar-clock"></i>
              <span>{{ item.hari_kerja }}</span>
            </div>
          </div>

          <div class="doctor-footer">
            <Button 
              label="Konsultasi"
              icon="pi pi-comments"
              size="small"
              rounded
            />
          </div>
        </div>

        <!-- Empty State -->
        <Card v-if="filteredSchedules.length === 0">
          <template #content>
            <div style="text-align: center; padding: 2rem;">
              <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">🔍</div>
              <p style="font-weight: 600; margin: 0 0 0.5rem;">Jadwal tidak ditemukan</p>
              <p style="font-size: 0.8rem; color: var(--text-color-secondary); margin: 0;">
                Coba ubah kata kunci pencarian atau filter
              </p>
            </div>
          </template>
        </Card>
      </template>
    </div>
  </div>
</template>

<style scoped>
.doctor-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Page Header */
.page-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.page-header-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.875rem;
  background: var(--primary-50);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.page-header-icon i {
  font-size: 1.25rem;
  color: var(--primary-color);
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.3;
  color: var(--text-color);
}

.page-subtitle {
  font-size: 0.8rem;
  color: var(--text-color-secondary);
  margin: 0.15rem 0 0;
}

/* Filter Section */
.filter-section {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 2rem;
  padding: 0.5rem 1rem;
}

.search-icon {
  font-size: 1rem;
  color: var(--text-color-secondary);
}

.search-input {
  width: 100%;
  border: none !important;
  box-shadow: none !important;
  background: transparent !important;
  padding: 0.35rem 0 !important;
  font-size: 0.85rem;
}

.day-filter-scroll {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.day-filter-scroll::-webkit-scrollbar {
  display: none;
}

.day-chip {
  padding: 0.4rem 0.9rem;
  border-radius: 2rem;
  border: 1px solid var(--surface-border);
  background: var(--surface-card);
  color: var(--text-color-secondary);
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: all 0.2s;
  font-family: inherit;
}

.day-chip:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.day-chip.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
  font-weight: 600;
}

/* Doctor Cards */
.doctor-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.doctor-card {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 1rem;
  padding: 1.25rem;
  transition: box-shadow 0.2s;
}

.doctor-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.doctor-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.doctor-header-info {
  flex: 1;
  min-width: 0;
}

.doctor-name {
  font-weight: 700;
  font-size: 0.95rem;
  margin: 0 0 0.35rem;
  line-height: 1.3;
  color: var(--text-color);
}

.status-tag {
  flex-shrink: 0;
}

.doctor-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding-left: 0.25rem;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.82rem;
  color: var(--text-color-secondary);
}

.detail-row i {
  font-size: 0.8rem;
  color: var(--primary-color);
  width: 1rem;
  text-align: center;
}

.doctor-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 0.75rem;
  border-top: 1px solid var(--surface-border);
}

.doctor-rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.rating-num {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-color);
}

@media (max-width: 480px) {
  .doctor-header {
    flex-wrap: wrap;
  }

  .status-tag {
    order: -1;
    margin-left: auto;
  }
}
</style>
