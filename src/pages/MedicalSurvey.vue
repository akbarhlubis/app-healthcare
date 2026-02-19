<script setup>
import { ref } from 'vue'

const formData = ref({
  fullName: '',
  email: '',
  phone: '',
  address: '',
  healthStatus: '',
  medicalHistory: '',
  feedback: ''
})

const submitted = ref(false)

const handleSubmit = () => {
  if (validateForm()) {
    submitted.value = true
    console.log('Survey submitted:', formData.value)
    
    setTimeout(() => {
      resetForm()
      submitted.value = false
    }, 3000)
  }
}

const validateForm = () => {
  return formData.value.fullName && 
         formData.value.email && 
         formData.value.phone && 
         formData.value.address &&
         formData.value.feedback
}

const resetForm = () => {
  formData.value = {
    fullName: '',
    email: '',
    phone: '',
    address: '',
    healthStatus: '',
    medicalHistory: '',
    feedback: ''
  }
}
</script>

<template>
  <div class="form-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="page-header-icon" style="background: var(--primary-50);">
        <i class="pi pi-chart-bar" style="color: var(--primary-color);"></i>
      </div>
      <div>
        <h1 class="page-title">Survey Kemasyarakatan</h1>
        <p class="page-subtitle">Berikan masukan untuk pelayanan kami</p>
      </div>
    </div>

    <!-- Success Message -->
    <Message v-if="submitted" severity="success" style="margin-bottom: 1.25rem; border-radius: 0.75rem;">
      <strong>Terima kasih!</strong> Survey Anda telah berhasil dikirim.
    </Message>

    <!-- Form Sections -->
    <div class="form-sections">

      <!-- Section: Data Pribadi -->
      <div class="form-card">
        <div class="form-card-header">
          <i class="pi pi-user"></i>
          <span>Data Pribadi</span>
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
            <label class="field-label">Email <span class="required">*</span></label>
            <div class="input-with-icon">
              <i class="pi pi-envelope"></i>
              <InputText 
                v-model="formData.email" 
                type="email" 
                placeholder="nama@email.com"
                class="field-input"
              />
            </div>
          </div>

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

      <!-- Section: Informasi Kesehatan -->
      <div class="form-card">
        <div class="form-card-header">
          <i class="pi pi-heart"></i>
          <span>Informasi Kesehatan</span>
        </div>
        <div class="form-fields">
          <div class="form-field">
            <label class="field-label">Status Kesehatan</label>
            <Dropdown
              v-model="formData.healthStatus"
              :options="[
                { label: 'Sangat Baik', value: 'excellent' },
                { label: 'Baik', value: 'good' },
                { label: 'Sedang', value: 'fair' },
                { label: 'Kurang Baik', value: 'poor' }
              ]"
              optionLabel="label"
              optionValue="value"
              placeholder="Pilih status kesehatan"
              style="width: 100%;"
            />
          </div>

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

      <!-- Section: Masukan -->
      <div class="form-card">
        <div class="form-card-header">
          <i class="pi pi-comments"></i>
          <span>Masukan & Saran</span>
        </div>
        <div class="form-fields">
          <div class="form-field">
            <label class="field-label">Masukan <span class="required">*</span></label>
            <Textarea 
              v-model="formData.feedback" 
              placeholder="Berikan masukan Anda untuk meningkatkan pelayanan kami"
              :rows="4"
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
          label="Kirim Survey" 
          icon="pi pi-send"
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
  .form-actions {
    flex-direction: column-reverse;
  }

  .form-actions .p-button {
    width: 100%;
  }
}
</style>
