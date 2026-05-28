import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'Home', component: () => import('./pages/Home.vue'), meta: { title: 'Home' } },
  { path: '/jadwal-dokter', name: 'DoctorSchedule', component: () => import('./pages/DoctorSchedule.vue'), meta: { title: 'Jadwal Dokter' } },
  { path: '/survey/:slug', name: 'MedicalSurvey', component: () => import('./pages/MedicalSurvey.vue'), meta: { title: 'Survey' } },
  { path: '/forgot-password', name: 'ForgotPassword', component: () => import('./pages/ForgotPassword.vue'), meta: { title: 'Lupa Password' } },
  { path: '/reset-password', name: 'ResetPassword', component: () => import('./pages/ResetPassword.vue'), meta: { title: 'Reset Password' } },
  { path: '/riwayat-kunjungan', name: 'VisitHistory', component: () => import('./pages/VisitHistory.vue'), meta: { title: 'Riwayat Kunjungan' } },
  { path: '/profile', name: 'Profile', component: () => import('./pages/Profile.vue'), meta: { title: 'Profil' } },
  { path: '/register', name: 'Register', component: () => import('./pages/Register.vue'), meta: { title: 'Registrasi' } },
  { path: '/daftar-pasien', name: 'PatientRegistration', component: () => import('./pages/PatientRegistration.vue'), meta: { title: 'Daftar Pasien' } },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('./pages/NotFound.vue'), meta: { title: '404' } },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.afterEach((to) => {
  document.title = `${to.meta.title} | Healthcare App`
})
