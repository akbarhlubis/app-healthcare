import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useDoctorStore = defineStore('doctor', () => {
  // State
  const doctorList = ref([
    {
      id: 1,
      name: 'Dr. Budi Santoso, Sp.U',
      specialty: 'Urologi',
      days: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'],
      time: '08:00 - 12:00',
      experience: '15 tahun',
      rating: 4.8
    },
    {
      id: 2,
      name: 'Dr. Siti Nurhaliza, Sp.OG',
      specialty: 'Obstetri & Ginekologi',
      days: ['Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
      time: '13:00 - 17:00',
      experience: '12 tahun',
      rating: 4.9
    },
    {
      id: 3,
      name: 'Dr. Ahmad Wijaya, Sp.LL',
      specialty: 'Paru-Paru',
      days: ['Senin', 'Selasa', 'Rabu', 'Kamis'],
      time: '09:00 - 13:00',
      experience: '20 tahun',
      rating: 4.7
    },
    {
      id: 4,
      name: 'Dr. Dewi Lestari, Sp.J',
      specialty: 'Jantung',
      days: ['Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Senin'],
      time: '14:00 - 18:00',
      experience: '18 tahun',
      rating: 4.9
    },
    {
      id: 5,
      name: 'Dr. Rudi Hermawan, Sp.N',
      specialty: 'Neurologi',
      days: ['Senin', 'Selasa', 'Rabu'],
      time: '10:00 - 14:00',
      experience: '16 tahun',
      rating: 4.8
    }
  ])
  
  const currentDoctorIndex = ref(0)
  const todayDoctors = ref([])

  // Computed
  const currentDayName = computed(() => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    return days[new Date().getDay()]
  })

  // Actions
  const getTodayDoctors = () => {
    todayDoctors.value = doctorList.value.filter(doctor =>
      doctor.days.includes(currentDayName.value)
    )
    return todayDoctors.value
  }

  const getNextDoctor = () => {
    if (todayDoctors.value.length > 0) {
      currentDoctorIndex.value = (currentDoctorIndex.value + 1) % todayDoctors.value.length
    }
  }

  const resetDoctorIndex = () => {
    currentDoctorIndex.value = 0
  }

  return {
    // State
    doctorList,
    currentDoctorIndex,
    todayDoctors,
    // Computed
    currentDayName,
    // Actions
    getTodayDoctors,
    getNextDoctor,
    resetDoctorIndex
  }
})
