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
    // Here you would normally send data to backend
    console.log('Survey submitted:', formData.value)
    
    // Reset after 3 seconds
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
  <div style="padding: 2rem;">
    <div style="max-width: 800px; margin: 0 auto;">
      <Card style="margin-bottom: 2rem;">
        <template #content>
          <div style="text-align: center; margin-bottom: 2rem;">
            <h1 style="font-size: 2rem; font-weight: bold; margin: 0;">Survey Kemasyarakatan</h1>
            <p style="margin-top: 0.5rem;">Berikan masukan untuk meningkatkan pelayanan kami</p>
          </div>
        </template>
      </Card>

      <!-- Success Message -->
      <Message v-if="submitted" severity="success" style="margin-bottom: 2rem;">
        <strong>Terima kasih!</strong> Survey Anda telah berhasil dikirim.
      </Message>

      <!-- Survey Form -->
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

            <!-- Email -->
            <div>
              <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Email *</label>
              <InputText 
                v-model="formData.email" 
                type="email" 
                placeholder="Masukkan email"
                style="width: 100%;"
              />
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

            <!-- Address -->
            <div>
              <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Alamat *</label>
              <InputText 
                v-model="formData.address" 
                type="text" 
                placeholder="Masukkan alamat"
                style="width: 100%;"
              />
            </div>

            <!-- Health Status -->
            <div>
              <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Status Kesehatan</label>
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

            <!-- Feedback -->
            <div>
              <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Masukan dan Saran *</label>
              <Textarea 
                v-model="formData.feedback" 
                placeholder="Berikan masukan Anda untuk meningkatkan pelayanan kami"
                :rows="4"
                style="width: 100%;"
              />
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
                label="Kirim" 
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
