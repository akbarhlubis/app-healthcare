<script setup>
import { ref, computed } from 'vue'
import { useDoctorStore } from '../stores/doctorStore'

const doctorStore = useDoctorStore()
const searchQuery = ref('')
const selectedDay = ref('all')

const days = [
  { label: 'Semua', value: 'all' },
  { label: 'Senin', value: 'Senin' },
  { label: 'Selasa', value: 'Selasa' },
  { label: 'Rabu', value: 'Rabu' },
  { label: 'Kamis', value: 'Kamis' },
  { label: 'Jumat', value: 'Jumat' },
  { label: 'Sabtu', value: 'Sabtu' }
]

const filteredDoctors = computed(() => {
  let list = doctorStore.doctorList
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(d => d.name.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q))
  }
  if (selectedDay.value !== 'all') {
    list = list.filter(d => d.days.includes(selectedDay.value))
  }
  return list
})

const formatDays = (days) => days.join(', ')

const isAvailableToday = (days) => {
  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const today = dayNames[new Date().getDay()]
  return days.includes(today)
}
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
        <p class="page-subtitle">{{ filteredDoctors.length }} dokter tersedia</p>
      </div>
    </div>

    <!-- Search & Filter -->
    <div class="filter-section">
      <div class="search-bar">
        <i class="pi pi-search search-icon"></i>
        <InputText 
          v-model="searchQuery"
          placeholder="Cari nama dokter atau spesialisasi..."
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

    <!-- Doctor Cards -->
    <div class="doctor-list">
      <div 
        v-for="doctor in filteredDoctors" 
        :key="doctor.id"
        class="doctor-card"
      >
        <div class="doctor-header">
          <Avatar 
            :label="doctor.name.charAt(4)" 
            size="large"
            shape="circle"
            style="background: var(--primary-color); color: white; flex-shrink: 0;"
          />
          <div class="doctor-header-info">
            <p class="doctor-name">{{ doctor.name }}</p>
            <Tag :value="doctor.specialty" severity="info" rounded />
          </div>
          <Tag 
            :value="isAvailableToday(doctor.days) ? 'Aktif' : 'Libur'" 
            :severity="isAvailableToday(doctor.days) ? 'success' : 'secondary'"
            rounded
            class="status-tag"
          />
        </div>

        <div class="doctor-details">
          <div class="detail-row">
            <i class="pi pi-clock"></i>
            <span>{{ doctor.time }}</span>
          </div>
          <div class="detail-row">
            <i class="pi pi-briefcase"></i>
            <span>{{ doctor.experience }}</span>
          </div>
          <div class="detail-row">
            <i class="pi pi-calendar-clock"></i>
            <span>{{ formatDays(doctor.days) }}</span>
          </div>
        </div>

        <div class="doctor-footer">
          <div class="doctor-rating">
            <Rating 
              v-model="doctor.rating" 
              :readonly="true" 
              :cancel="false"
              style="font-size: 0.8rem;"
            />
            <span class="rating-num">{{ doctor.rating }}</span>
          </div>
          <Button 
            label="Konsultasi"
            icon="pi pi-comments"
            size="small"
            rounded
          />
        </div>
      </div>

      <!-- Empty State -->
      <Card v-if="filteredDoctors.length === 0">
        <template #content>
          <div style="text-align: center; padding: 2rem;">
            <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">🔍</div>
            <p style="font-weight: 600; margin: 0 0 0.5rem;">Dokter tidak ditemukan</p>
            <p style="font-size: 0.8rem; color: var(--text-color-secondary); margin: 0;">
              Coba ubah kata kunci pencarian atau filter hari
            </p>
          </div>
        </template>
      </Card>
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
