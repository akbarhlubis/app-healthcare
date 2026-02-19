# 📁 Healthcare App - Project Structure dengan Vue Router

## Struktur File Lengkap

```
src/
├── App.vue                           # Layout utama (Navbar + RouterView)
├── main.js                           # Entrypoint dengan Pinia & Vue Router
├── router.js                         # Konfigurasi routing
├── style.css                         # Global styling
│
├── pages/                            # Halaman-halaman aplikasi
│   ├── Home.vue                      # / - Halaman utama
│   ├── DoctorSchedule.vue            # /jadwal-dokter - List dokter lengkap
│   ├── MedicalSurvey.vue             # /survey-kemasyarakatan - Form survey
│   └── PatientRegistration.vue       # /daftar-pasien - Form registrasi pasien
│
├── stores/                           # Pinia stores untuk state management
│   ├── authStore.js                  # User authentication state
│   ├── darkModeStore.js              # Dark mode state
│   └── doctorStore.js                # Doctor schedule state
│
├── components/
│   └── layout/
│       └── Navbar.vue                # Navigation bar dengan route buttons
│
└── assets/                           # Static assets (images, icons)
```

---

## 📄 File Descriptions

### App.vue (Layout)
```vue
- Menampilkan Navbar component
- Menampilkan RouterView untuk current page
- Menampilkan global Login Dialog
- Handle dark mode initialization
- Handle user loading dari localStorage
```

**Routes di Navbar:**
- Home (/)
- Jadwal Dokter (/jadwal-dokter)
- Survey Kemasyarakatan (/survey-kemasyarakatan)
- Daftar Pasien (/daftar-pasien)

### pages/Home.vue
```vue
- Welcome card dengan greeting
- Doctor schedule carousel (auto-rotate setiap 5 detik)
- Footer information
- Menampilkan timestamp live
```

### pages/DoctorSchedule.vue
```vue
- Tabel daftar dokter lengkap dengan pagination
- Sorting berdasarkan rating
- Detail dokter per card:
  - Nama & Spesialisasi
  - Hari praktik
  - Jam praktik
  - Pengalaman & Rating
- Button "Pesan Konsultasi"
```

### pages/MedicalSurvey.vue
```vue
- Form survey kemasyarakatan dengan fields:
  - Nama lengkap*
  - Email*
  - Nomor telepon*
  - Alamat*
  - Status kesehatan (dropdown)
  - Riwayat penyakit (textarea)
  - Masukan & saran* (textarea)
- Validasi form sebelum submit
- Success message setelah submit
```

### pages/PatientRegistration.vue
```vue
- Form registrasi pasien dengan 2 tipe:
  - Pasien Umum
  - Pasien BPJS (perlu nomor BPJS)
- Fields:
  - Nama lengkap*, DOB*, Gender*, Phone*, Address*
  - Email, Golongan darah
  - Riwayat penyakit
  - Nomor BPJS* (jika BPJS)
- Validasi kondisional berdasarkan tipe pasien
- Error handling dan success message
```

### Navbar.vue
```vue
- Logo + Hospital name di sebelah kiri
- Navigation menu buttons di tengah
  - Home, Jadwal Dokter, Survey, Daftar Pasien
- Dark mode toggle
- User name display (jika login)
- Login/Logout button
- Active route highlight
```

---

## 🔄 Views Flow

```
App.vue (Layout)
    ├── Navbar.vue
    │   └── Navigation buttons
    │
    └── RouterView (Page Content)
            ├── Home.vue (/                            )
            ├── DoctorSchedule.vue (/jadwal-dokter     )
            ├── MedicalSurvey.vue (/survey-kemasyarakatan)
            └── PatientRegistration.vue (/daftar-pasien)
```

---

## 🎯 State Management (Pinia)

### authStore
```javascript
State:
  - userName: string
  - isLoggedIn: boolean
  - showLoginModal: boolean
  - loginInput: string

Actions:
  - login(name)
  - logout()
  - loadUser()
  - openLoginModal()
  - closeLoginModal()
```

### darkModeStore
```javascript
State:
  - isDarkMode: boolean

Actions:
  - initializeDarkMode()
  - toggleDarkMode()
```

### doctorStore
```javascript
State:
  - doctorList: array
  - todayDoctors: array
  - currentDoctorIndex: number

Computed:
  - currentDayName: string

Actions:
  - getTodayDoctors()
  - getNextDoctor()
  - resetDoctorIndex()
```

---

## 🔗 Navigation

### Dari Navbar (semua halaman):
- Click "Home" → go to /
- Click "Jadwal Dokter" → go to /jadwal-dokter
- Click "Survey Kemasyarakatan" → go to /survey-kemasyarakatan
- Click "Daftar Pasien" → go to /daftar-pasien

### Programmatically (dalam pages):
```javascript
import { useRouter } from 'vue-router'
const router = useRouter()
router.push('/jadwal-dokter')
```

---

## 📦 PrimeVue Components Used

**Layout Components:**
- Toolbar - Navigation bar
- Card - Content containers
- Dialog - Login modal

**Form Components:**
- InputText - Text inputs
- Textarea - Multi-line inputs
- Dropdown - Select dropdowns
- Calendar - Date picker
- RadioButton - Radio selections
- Message - Success/error messages

**Display Components:**
- Carousel - Auto-rotating doctor schedule
- DataView - Paginated doctor list
- Rating - Star ratings
- Tag - Status badges

---

## ✅ Keuntungan Struktur Ini

✅ **Clean separation of concerns** - Pages, layouts, stores terpisah jelas  
✅ **Easy to maintain** - Tambah page baru ⟹ buat file di `pages/` + route di `router.js`  
✅ **Reusable components** - Navbar, Layout bisa digunakan kembali  
✅ **Centralized state** - Pinia stores untuk shared state  
✅ **Type-safe routing** - Explicit routes di `router.js`  
✅ **Dark mode global** - Dark mode store accessible dari mana saja  

---

## 🚀 Workflow Menambah Halaman Baru

1. **Buat file page baru di `src/pages/`**
```vue
<!-- src/pages/NewPage.vue -->
<script setup>
// your logic
</script>

<template>
  <!-- your template -->
</template>
```

2. **Tambah route di `src/router.js`**
```javascript
import NewPage from '../pages/NewPage.vue'

const routes = [
  // ... existing routes
  {
    path: '/new-page',
    name: 'NewPage',
    component: NewPage,
    meta: { title: 'New Page' }
  }
]
```

3. **(Optional) Tambah button di Navbar**
```javascript
// In Navbar.vue
const menuItems = [
  // ... existing items
  {
    label: 'New Page',
    icon: 'pi pi-file',
    to: '/new-page'
  }
]
```

Done! 🎉

---

## 📚 Resources

- [Vue Router Docs](https://router.vuejs.org/)
- [Pinia Store Docs](https://pinia.vuejs.org/)
- [PrimeVue Components](https://primevue.org/)
