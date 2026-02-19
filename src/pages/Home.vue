<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDoctorStore } from '../stores/doctorStore'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const doctorStore = useDoctorStore()
const authStore = useAuthStore()

const currentDateTime = ref(new Date())

const appName = import.meta.env.VITE_APP_NAME || 'Healthcare App'
const hospitalName = import.meta.env.VITE_HOSPITAL_NAME || 'Rumah Sakit'
const hospitalAddress = import.meta.env.VITE_HOSPITAL_ADDRESS || 'Alamat Rumah Sakit'
const hospitalPhone = import.meta.env.VITE_HOSPITAL_PHONE || '+62-21-1234-5678'
const hospitalEmail = import.meta.env.VITE_HOSPITAL_EMAIL || 'info@hospital.com'
const hospitallLogo = import.meta.env.VITE_HOSPITAL_LOGO || 'https://upload.wikimedia.org/wikipedia/commons/2/2b/Lambang_Kabupaten_Tanggamus.png'

const formatDateTime = () => {
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Asia/Jakarta'
  }
  return new Intl.DateTimeFormat('id-ID', options).format(currentDateTime.value)
}

const bpjsLinks = {
  ios: 'https://apps.apple.com/id/app/mobile-jkn/id1237601115',
  android: 'https://play.google.com/store/apps/details?id=app.bpjs.mobile&hl=id'
}

const redirectToBPJSApp = () => {
  const userAgent = navigator.userAgent.toLowerCase()
  let storeUrl = bpjsLinks.android

  if (/iphone|ipad|ipod|mac os/.test(userAgent)) {
    storeUrl = bpjsLinks.ios
  }

  window.open(storeUrl, '_blank')
}

// Menu items untuk super app style
const menuItems = [
  {
    label: 'Jadwal Dokter',
    icon: 'pi pi-calendar',
    severity: 'primary',
    action: () => router.push('/jadwal-dokter')
  },
  {
    label: 'Survey Kemasyarakatan',
    icon: 'pi pi-file',
    severity: 'secondary',
    action: () => router.push('/survey-kemasyarakatan')
  },
  {
    label: 'Daftar Pasien Umum',
    icon: 'pi pi-users',
    severity: 'info',
    action: () => router.push('/daftar-pasien')
  },
  {
    label: 'Daftar Pasien BPJS',
    icon: 'pi pi-credit-card',
    severity: 'success',
    action: redirectToBPJSApp
  }
]

onMounted(() => {
  doctorStore.getTodayDoctors()
  
  const timeInterval = setInterval(() => {
    currentDateTime.value = new Date()
  }, 1000)
  
  let doctorInterval = null
  if (doctorStore.todayDoctors.length > 0) {
    doctorInterval = setInterval(() => {
      doctorStore.getNextDoctor()
    }, 5000)
  }

  return () => {
    clearInterval(timeInterval)
    if (doctorInterval) clearInterval(doctorInterval)
  }
})
</script>

<template>
  <div style="display: flex; justify-content: center; align-items: center; min-height: calc(100vh - 100px); padding: 2rem;">
    <div style="max-width: 800px; width: 100%;">
      
      <!-- Welcome Card -->
      <Card style="margin-bottom: 2rem;">
        <template #content>
          <div style="text-align: center;">
            <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 2rem;">
                <img :src="hospitallLogo" style="height: 8rem; width: auto; object-fit: contain;" alt="Logo Rumah Sakit" />
            </div>
            <h1 style="font-size: 2rem; font-weight: bold; margin: 1rem 0;">
              {{ hospitalName }}
            </h1>
            <p v-if="authStore.isLoggedIn" style="font-size: 1.5rem; font-weight: 600; margin: 1rem 0;">
              Selamat Datang, {{ authStore.userName }}! 👋
            </p>
            <p style="font-size: 1rem; margin: 0.5rem 0;">
              Sistem Informasi Pelayanan Kesehatan Terpadu
            </p>
            <p style="font-size: 0.875rem; margin-top: 0.5rem;">
              📅 {{ formatDateTime() }}
            </p>
            <hr style="margin: 1.5rem 0; border: none; border-top: 1px solid var(--surface-border);">
            <p>Silakan pilih menu layanan di bawah ini</p>
          </div>
        </template>
      </Card>

      <!-- Doctor Schedule Carousel -->
      <Carousel 
        v-if="doctorStore.todayDoctors.length > 0"
        :value="doctorStore.todayDoctors" 
        :numVisible="1" 
        :numScroll="1" 
        :autoplayInterval="5000"
        :responsiveOptions="[
          { breakpoint: '1024px', numVisible: 1, numScroll: 1 }
        ]"
        style="margin-bottom: 2rem;"
      >
        <template #item="slotProps">
          <div style="padding: 1rem;">
            <Card class="doctor-schedule-card">
              <template #content>
                <div>
                  <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                    <Tag 
                      value="Jadwal Dokter Hari Ini" 
                      severity="warning"
                      style="padding: 0.5rem 1rem;"
                    />
                    <span style="font-size: 0.875rem;">
                      {{ doctorStore.todayDoctors.indexOf(slotProps.data) + 1 }} / {{ doctorStore.todayDoctors.length }}
                    </span>
                  </div>
                  <h2 style="font-size: 1.5rem; margin: 1rem 0; font-weight: bold;">
                    {{ slotProps.data.name }}
                  </h2>
                  <div style="display: flex; flex-direction: column; gap: 0.75rem; font-size: 0.9rem;">
                    <p style="margin: 0;">
                      <strong>Spesialisasi:</strong> {{ slotProps.data.specialty }}
                    </p>
                    <p style="margin: 0;">
                      <strong>Jam Praktik:</strong> {{ slotProps.data.time }}
                    </p>
                    <p style="margin: 0;">
                      <strong>Pengalaman:</strong> {{ slotProps.data.experience }}
                    </p>
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem;">
                      <strong>Rating:</strong>
                      <Rating 
                        v-model="slotProps.data.rating" 
                        :readonly="true" 
                        :cancel="false"
                        iconCancelClass="pi pi-star-fill"
                        iconOnClass="pi pi-star-fill"
                        iconOffClass="pi pi-star"
                        style="font-size: 1rem;"
                      />
                      <span>{{ slotProps.data.rating }}</span>
                    </div>
                  </div>
                  <div style="margin-top: 1.5rem; text-align: center;">
                    <Button 
                      label="Pesan Konsultasi" 
                      icon="pi pi-calendar"
                      severity="warning"
                      @click="redirectToBPJSApp"
                    />
                  </div>
                </div>
              </template>
            </Card>
          </div>
        </template>
      </Carousel>

      <!-- No Doctor Schedule -->
      <Card class="no-doctor-card" style="margin-bottom: 2rem;" v-else>
        <template #content>
          <div style="text-align: center;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">😴</div>
            <h2 style="font-size: 1.5rem; margin: 1rem 0; font-weight: bold;">
              Tidak Ada Jadwal Dokter
            </h2>
            <p style="font-size: 0.875rem; margin: 0.5rem 0;">
              Mohon maaf, saat ini tidak ada dokter yang bertugas hari ini.
            </p>
            <p style="font-size: 0.875rem; margin-top: 0.5rem;">
              Silakan cek kembali besok atau hubungi customer service kami.
            </p>
            <div style="margin-top: 1.5rem;">
              <Button 
                label="Hubungi Customer Service" 
                icon="pi pi-phone"
                severity="warning"
              />
            </div>
          </div>
        </template>
      </Card>

      <!-- Super App Menu Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
        <Button
          v-for="(menu, index) in menuItems"
          :key="index"
          :label="menu.label"
          :icon="menu.icon"
          :severity="menu.severity"
          class="p-button-lg"
          style="height: 120px; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 0.875rem; font-weight: 600; white-space: normal; line-height: 1.3;"
          @click="menu.action"
        />
      </div>

      <!-- Footer Info Card -->
      <Card>
        <template #content>
          <div>
            <p style="font-weight: 600; margin: 0.5rem 0;">{{ hospitalName }}</p>
            <p style="font-size: 0.875rem; margin: 0.25rem 0;">📍 {{ hospitalAddress }}</p>
            <p style="font-size: 0.875rem; margin: 0.25rem 0;">📞 {{ hospitalPhone }}</p>
            <p style="font-size: 0.875rem; margin: 0.25rem 0;">📧 {{ hospitalEmail }}</p>
            <hr style="margin: 1rem 0; border: none; border-top: 1px solid var(--surface-border);">
            <p style="font-size: 0.75rem; margin: 0;">© 2026 {{ appName }} - Pelayanan Kesehatan Terpadu</p>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>
