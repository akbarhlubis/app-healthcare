<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="page">
    <div class="not-found">
      <div class="not-found-icon">
        <i class="pi pi-search"></i>
      </div>
      <h1>Halaman Tidak Ditemukan</h1>
      <p>URL yang Anda tuju tidak tersedia</p>
      <Button label="Kembali ke Beranda" icon="pi pi-home" severity="primary" rounded @click="router.push('/')" />
    </div>
  </div>
</template>

<style scoped>
.not-found {
  text-align: center;
  padding: 4rem 1rem;
}

.not-found-icon {
  color: var(--primary-color);
  font-size: 5rem;
  margin-bottom: 1rem;
}

.not-found h1 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
}

.not-found p {
  color: var(--text-color-secondary);
  margin: 0 0 1.5rem;
}
</style>
