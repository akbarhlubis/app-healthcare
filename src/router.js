import { createRouter, createWebHistory } from 'vue-router'
import Home from './pages/Home.vue'
import DoctorSchedule from './pages/DoctorSchedule.vue'
import MedicalSurvey from './pages/MedicalSurvey.vue'
import PatientRegistration from './pages/PatientRegistration.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { title: 'Home' }
  },
  {
    path: '/jadwal-dokter',
    name: 'DoctorSchedule',
    component: DoctorSchedule,
    meta: { title: 'Jadwal Dokter' }
  },
  {
    path: '/survey-kemasyarakatan',
    name: 'MedicalSurvey',
    component: MedicalSurvey,
    meta: { title: 'Survey Kemasyarakatan' }
  },
  {
    path: '/daftar-pasien',
    name: 'PatientRegistration',
    component: PatientRegistration,
    meta: { title: 'Daftar Pasien' }
  }
]

export const router = createRouter({
  history: createWebHistory(),
  routes
})

// Update document title
router.afterEach((to) => {
  document.title = `${to.meta.title} | Healthcare App`
})
