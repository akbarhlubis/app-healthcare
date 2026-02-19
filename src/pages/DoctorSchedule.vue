<script setup>
import { useDoctorStore } from '../stores/doctorStore'

const doctorStore = useDoctorStore()

const columns = [
  { field: 'name', header: 'Nama Dokter' },
  { field: 'specialty', header: 'Spesialisasi' },
  { field: 'days', header: 'Hari Praktik' },
  { field: 'time', header: 'Jam Praktik' },
  { field: 'experience', header: 'Pengalaman' },
  { field: 'rating', header: 'Rating' }
]

const formatDays = (days) => {
  return days.join(', ')
}
</script>

<template>
  <div style="padding: 2rem;">
    <div style="max-width: 1200px; margin: 0 auto;">
      <Card style="margin-bottom: 2rem;">
        <template #content>
          <div style="text-align: center; margin-bottom: 2rem;">
            <h1 style="font-size: 2rem; font-weight: bold; margin: 0;">Jadwal Dokter</h1>
            <p style="margin-top: 0.5rem;">Daftar lengkap jadwal dokter kami</p>
          </div>
        </template>
      </Card>

      <!-- Doctor List Table -->
      <Card>
        <template #content>
          <DataView
            :value="doctorStore.doctorList"
            :paginator="true"
            :rows="5"
            layout="list"
            :sortOrder="-1"
            sortField="rating"
          >
            <template #list="slotProps">
              <div class="grid-container" style="width: 100%;">
                <div 
                  v-for="(item, index) in slotProps.items"
                  :key="index"
                  style="margin-bottom: 1rem;"
                >
                  <Card>
                    <template #content>
                      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                        <div>
                          <h3 style="font-size: 1.1rem; font-weight: bold; margin: 0;">{{ item.name }}</h3>
                          <p style="margin: 0.5rem 0;">
                            <strong>Spesialisasi:</strong> {{ item.specialty }}
                          </p>
                          <p style="margin: 0.5rem 0;">
                            <strong>Pengalaman:</strong> {{ item.experience }}
                          </p>
                        </div>
                        <div>
                          <p style="margin: 0.5rem 0;">
                            <strong>Hari Praktik:</strong> {{ formatDays(item.days) }}
                          </p>
                          <p style="margin: 0.5rem 0;">
                            <strong>Jam Praktik:</strong> {{ item.time }}
                          </p>
                          <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.75rem;">
                            <strong>Rating:</strong>
                            <Rating 
                              v-model="item.rating" 
                              :readonly="true" 
                              :cancel="false"
                              style="font-size: 0.9rem;"
                            />
                            <span>{{ item.rating }}</span>
                          </div>
                        </div>
                      </div>
                      <div style="margin-top: 1rem;">
                        <Button 
                          label="Pesan Konsultasi" 
                          icon="pi pi-calendar"
                          severity="info"
                          size="small"
                        />
                      </div>
                    </template>
                  </Card>
                </div>
              </div>
            </template>
          </DataView>
        </template>
      </Card>
    </div>
  </div>
</template>
