<script setup>
import { ref } from 'vue'

const formData = ref({
  fullName: '',
  dateOfBirth: null,
  gender: '',
  phone: '',
  email: '',
  address: '',
  bloodType: '',
  medicalHistory: ''
})

const submitted = ref(false)
const errorMessage = ref('')

const handleSubmit = () => {
  errorMessage.value = ''
  
  if (!validateForm()) {
    errorMessage.value = 'Silakan isi semua field yang wajib'
    return
  }

  submitted.value = true
  console.log('Patient registered:', formData.value)
  
  setTimeout(() => {
    resetForm()
    submitted.value = false
  }, 3000)
}

const validateForm = () => {
  return formData.value.fullName && 
         formData.value.dateOfBirth &&
         formData.value.gender &&
         formData.value.phone &&
         formData.value.address
}

const resetForm = () => {
  formData.value = {
    fullName: '',
    dateOfBirth: null,
    gender: '',
    phone: '',
    email: '',
    address: '',
    bloodType: '',
    medicalHistory: ''
  }
}
</script>

<template>
  <div style="padding: 2rem;">
    <div style="max-width: 800px; margin: 0 auto;">
      <Card style="margin-bottom: 2rem;">
        <template #content>
          <div style="text-align: center; margin-bottom: 2rem;">
            <h1 style="font-size: 2rem; font-weight: bold; margin: 0;">Daftar Pasien Umum</h1>
            <p style="margin-top: 0.5rem;">Formulir pendaftaran pasien umum</p>
          </div>
        </template>
      </Card>

      <!-- Success Message -->
      <Message v-if="submitted" severity="success" style="margin-bottom: 2rem;">
        <strong>Pendaftaran Berhasil!</strong> Data pasien Anda telah terdata di sistem kami.
      </Message>

      <!-- Error Message -->
      <Message v-if="errorMessage" severity="error" style="margin-bottom: 2rem;">
        {{ errorMessage }}
      </Message>

      <!-- Registration Form -->
      <Card>
        <template #content>
          <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            
            <!-- Full Name -->
            <div>
              <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Nama Lengkap *</label>
              <InputText 
                v-model="formData.fullName" 
                type="text" 
                placeholder="Masukkan nama lengkap"
                style="width: 100%;"
              />
            </div>

            <!-- Date of Birth -->
            <div>
              <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Tanggal Lahir *</label>
              <Calendar 
                v-model="formData.dateOfBirth"
                dateFormat="dd/mm/yy"
                placeholder="Pilih tanggal lahir"
                style="width: 100%;"
              />
            </div>

            <!-- Gender -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div>
                <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Jenis Kelamin *</label>
                <Dropdown
                  v-model="formData.gender"
                  :options="[
                    { label: 'Laki-Laki', value: 'male' },
                    { label: 'Perempuan', value: 'female' }
                  ]"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Pilih jenis kelamin"
                  style="width: 100%;"
                />
              </div>

              <!-- Blood Type -->
              <div>
                <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Golongan Darah</label>
                <Dropdown
                  v-model="formData.bloodType"
                  :options="[
                    { label: 'A', value: 'A' },
                    { label: 'B', value: 'B' },
                    { label: 'AB', value: 'AB' },
                    { label: 'O', value: 'O' }
                  ]"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Pilih golongan darah"
                  style="width: 100%;"
                />
              </div>
            </div>

            <!-- Phone -->
            <div>
              <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Nomor Telepon *</label>
              <InputText 
                v-model="formData.phone" 
                type="tel" 
                placeholder="Masukkan nomor telepon"
                style="width: 100%;"
              />
            </div>

            <!-- Email -->
            <div>
              <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Email</label>
              <InputText 
                v-model="formData.email" 
                type="email" 
                placeholder="Masukkan email"
                style="width: 100%;"
              />
            </div>

            <!-- Address -->
            <div>
              <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Alamat *</label>
              <Textarea 
                v-model="formData.address" 
                placeholder="Masukkan alamat lengkap"
                :rows="3"
                style="width: 100%;"
              />
            </div>

            <!-- Medical History -->
            <div>
              <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Riwayat Penyakit</label>
              <Textarea 
                v-model="formData.medicalHistory" 
                placeholder="Ceritakan riwayat penyakit Anda (opsional)"
                :rows="3"
                style="width: 100%;"
              />
            </div>

            <!-- BPJS Number (conditional) -->
            <div v-if="patientType === 'bpjs'">
              <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Nomor BPJS *</label>
              <InputText 
                v-model="formData.bpjsNumber" 
                type="text" 
                placeholder="Masukkan nomor BPJS"
                style="width: 100%;"
              />
              <small style="color: var(--text-color-secondary); margin-top: 0.25rem; display: block;">
                Belum punya BPJS? <Button 
                  label="Download aplikasi Mobile JKN" 
                  link
                  @click="redirectToBPJSApp"
                  style="padding: 0; height: auto;"
                />
              </small>
            </div>

            <!-- Buttons -->
            <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1rem;">
              <Button 
                label="Reset" 
                icon="pi pi-refresh"
                severity="secondary"
                @click="resetForm"
              />
              <Button 
                label="Daftar" 
                icon="pi pi-check"
                severity="success"
                @click="handleSubmit"
                :disabled="!validateForm()"
              />
            </div>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>
