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
  errorMessage.value = ''
}
</script>

<template>
  <div class="form-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="page-header-icon" style="background: var(--primary-50);">
        <i class="pi pi-user-plus" style="color: var(--primary-color);"></i>
      </div>
      <div>
        <h1 class="page-title">Daftar Pasien Umum</h1>
        <p class="page-subtitle">Formulir pendaftaran pasien baru</p>
      </div>
    </div>

    <!-- Success Message -->
    <Message v-if="submitted" severity="success" style="margin-bottom: 1.25rem; border-radius: 0.75rem;">
      <strong>Pendaftaran Berhasil!</strong> Data pasien Anda telah terdata di sistem kami.
    </Message>

    <!-- Error Message -->
    <Message v-if="errorMessage" severity="error" style="margin-bottom: 1.25rem; border-radius: 0.75rem;">
      {{ errorMessage }}
    </Message>

    <!-- Form Sections -->
    <div class="form-sections">

      <!-- Section: Identitas Pasien -->
      <div class="form-card">
        <div class="form-card-header">
          <i class="pi pi-id-card"></i>
          <span>Identitas Pasien</span>
        </div>
        <div class="form-fields">
          <div class="form-field">
            <label class="field-label">Nama Lengkap <span class="required">*</span></label>
            <div class="input-with-icon">
              <i class="pi pi-user"></i>
              <InputText 
                v-model="formData.fullName" 
                placeholder="Masukkan nama lengkap"
                class="field-input"
              />
            </div>
          </div>

          <div class="form-field">
            <label class="field-label">Tanggal Lahir <span class="required">*</span></label>
            <Calendar 
              v-model="formData.dateOfBirth"
              dateFormat="dd/mm/yy"
              placeholder="Pilih tanggal lahir"
              style="width: 100%;"
              showIcon
              iconDisplay="input"
            />
          </div>

          <div class="form-row">
            <div class="form-field">
              <label class="field-label">Jenis Kelamin <span class="required">*</span></label>
              <Dropdown
                v-model="formData.gender"
                :options="[
                  { label: 'Laki-Laki', value: 'male' },
                  { label: 'Perempuan', value: 'female' }
                ]"
                optionLabel="label"
                optionValue="value"
                placeholder="Pilih"
                style="width: 100%;"
              />
            </div>

            <div class="form-field">
              <label class="field-label">Golongan Darah</label>
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
                placeholder="Pilih"
                style="width: 100%;"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Section: Kontak -->
      <div class="form-card">
        <div class="form-card-header">
          <i class="pi pi-phone"></i>
          <span>Informasi Kontak</span>
        </div>
        <div class="form-fields">
          <div class="form-field">
            <label class="field-label">Nomor Telepon <span class="required">*</span></label>
            <div class="input-with-icon">
              <i class="pi pi-phone"></i>
              <InputText 
                v-model="formData.phone" 
                type="tel" 
                placeholder="08xxxxxxxxxx"
                class="field-input"
              />
            </div>
          </div>

          <div class="form-field">
            <label class="field-label">Email</label>
            <div class="input-with-icon">
              <i class="pi pi-envelope"></i>
              <InputText 
                v-model="formData.email" 
                type="email" 
                placeholder="nama@email.com (opsional)"
                class="field-input"
              />
            </div>
          </div>

          <div class="form-field">
            <label class="field-label">Alamat <span class="required">*</span></label>
            <div class="input-with-icon" style="align-items: flex-start; padding-top: 0.75rem;">
              <i class="pi pi-map-marker"></i>
              <Textarea 
                v-model="formData.address" 
                placeholder="Masukkan alamat lengkap"
                :rows="2"
                class="field-input"
                style="border: none; box-shadow: none; background: transparent; resize: vertical;"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Section: Riwayat Kesehatan -->
      <div class="form-card">
        <div class="form-card-header">
          <i class="pi pi-heart"></i>
          <span>Riwayat Kesehatan</span>
        </div>
        <div class="form-fields">
          <div class="form-field">
            <label class="field-label">Riwayat Penyakit</label>
            <Textarea 
              v-model="formData.medicalHistory" 
              placeholder="Ceritakan riwayat penyakit Anda (opsional)"
              :rows="3"
              style="width: 100%;"
            />
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="form-actions">
        <Button 
          label="Reset" 
          icon="pi pi-refresh"
          severity="secondary"
          outlined
          rounded
          @click="resetForm"
        />
        <Button 
          label="Daftar Sekarang" 
          icon="pi pi-check-circle"
          severity="success"
          rounded
          @click="handleSubmit"
          :disabled="!validateForm()"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.form-page {
  max-width: 700px;
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
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.page-header-icon i {
  font-size: 1.25rem;
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

/* Form Sections */
.form-sections {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-card {
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 1rem;
  overflow: hidden;
}

.form-card-header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.85rem 1.25rem;
  background: var(--surface-ground);
  border-bottom: 1px solid var(--surface-border);
  font-weight: 700;
  font-size: 0.85rem;
}

.form-card-header i {
  font-size: 0.9rem;
  color: var(--primary-color);
}

.form-fields {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.field-label {
  font-weight: 600;
  font-size: 0.82rem;
  color: var(--text-color);
}

.required {
  color: #EF4444;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.input-with-icon {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--surface-ground);
  border: 1px solid var(--surface-border);
  border-radius: 0.75rem;
  padding: 0 1rem;
  transition: border-color 0.2s;
}

.input-with-icon:focus-within {
  border-color: var(--primary-color);
}

.input-with-icon i {
  font-size: 0.9rem;
  color: var(--text-color-secondary);
  flex-shrink: 0;
}

.field-input {
  width: 100%;
  border: none !important;
  box-shadow: none !important;
  background: transparent !important;
  padding: 0.6rem 0 !important;
  font-size: 0.85rem;
}

/* Actions */
.form-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  padding: 0.5rem 0;
}

@media (max-width: 480px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .form-actions .p-button {
    width: 100%;
  }
}
</style>
