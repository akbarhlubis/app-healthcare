<script setup>
const appName = import.meta.env.VITE_APP_NAME || 'Healthcare App'
const hospitalName = import.meta.env.VITE_HOSPITAL_NAME || 'Rumah Sakit'
const hospitalAddress = import.meta.env.VITE_HOSPITAL_ADDRESS || 'Alamat Rumah Sakit'
const hospitalPhone = import.meta.env.VITE_HOSPITAL_PHONE || '+62-21-1234-5678'
const hospitalEmail = import.meta.env.VITE_HOSPITAL_EMAIL || 'info@hospital.com'
const hospitallLogo = import.meta.env.VITE_HOSPITAL_LOGO || 'https://upload.wikimedia.org/wikipedia/commons/2/2b/Lambang_Kabupaten_Tanggamus.png'
</script>

<template>
  <footer class="app-footer" id="footer-info">
    <div class="footer-wrapper">
      <!-- Logo & Name -->
      <div class="footer-brand">
        <img :src="hospitallLogo" class="footer-logo" alt="Logo" />
        <div>
          <p class="footer-name">{{ hospitalName }}</p>
          <p class="footer-tagline">Pelayanan Kesehatan Terpadu</p>
        </div>
      </div>

      <hr class="footer-divider" />

      <!-- Contact Grid -->
      <div class="footer-contacts">
        <div class="footer-contact-item">
          <div class="footer-contact-icon">
            <i class="pi pi-map-marker"></i>
          </div>
          <div>
            <p class="footer-contact-label">Alamat</p>
            <p class="footer-contact-value">{{ hospitalAddress }}</p>
          </div>
        </div>
        <div class="footer-contact-item">
          <div class="footer-contact-icon">
            <i class="pi pi-phone"></i>
          </div>
          <div>
            <p class="footer-contact-label">Telepon</p>
            <p class="footer-contact-value">{{ hospitalPhone }}</p>
          </div>
        </div>
        <div class="footer-contact-item">
          <div class="footer-contact-icon">
            <i class="pi pi-envelope"></i>
          </div>
          <div>
            <p class="footer-contact-label">Email</p>
            <p class="footer-contact-value">{{ hospitalEmail }}</p>
          </div>
        </div>
      </div>

      <hr class="footer-divider" />

      <!-- Operating Hours -->
      <div class="footer-hours">
        <p class="footer-hours-title"><i class="pi pi-clock"></i> Jam Operasional</p>
        <div class="footer-hours-grid">
          <div class="footer-hours-row">
            <span class="footer-hours-day">Senin - Jumat</span>
            <span class="footer-hours-time">08:00 - 20:00</span>
          </div>
          <div class="footer-hours-row">
            <span class="footer-hours-day">Sabtu</span>
            <span class="footer-hours-time">08:00 - 14:00</span>
          </div>
          <div class="footer-hours-row">
            <span class="footer-hours-day">Minggu & Hari Libur</span>
            <span class="footer-hours-time closed">Tutup</span>
          </div>
        </div>
        <!-- IGD Badge -->
        <div class="footer-igd">
          <i class="pi pi-shield"></i>
          <span>IGD (Instalasi Gawat Darurat) — <strong>Buka 24 Jam</strong></span>
        </div>
      </div>

      <hr class="footer-divider" />

      <!-- Copyright -->
      <p class="footer-copyright">
        © 2026 {{ appName }} — Dibuat dengan <i class="pi pi-heart-fill" style="color: #EF4444; font-size: 0.6rem;"></i> untuk pelayanan yang lebih baik
      </p>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  padding: 0 1rem 1rem;
  max-width: 800px;
  margin: 0 auto;
}

.footer-wrapper {
  background: var(--surface-card);
  border-radius: 1.25rem;
  padding: 1.5rem 1.25rem;
  border: 1px solid var(--surface-border);
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 0.875rem;
}

.footer-logo {
  height: 2.75rem;
  width: auto;
  flex-shrink: 0;
}

.footer-name {
  font-weight: 700;
  font-size: 0.95rem;
  margin: 0;
  color: var(--text-color);
  line-height: 1.3;
}

.footer-tagline {
  font-size: 0.72rem;
  color: var(--primary-color);
  font-weight: 500;
  margin: 0.1rem 0 0;
}

.footer-divider {
  border: none;
  border-top: 1px solid var(--surface-border);
  margin: 1rem 0;
}

.footer-contacts {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.footer-contact-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.footer-contact-icon {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.625rem;
  background: var(--primary-50);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.footer-contact-icon i {
  font-size: 0.85rem;
  color: var(--primary-color);
}

.footer-contact-label {
  font-size: 0.65rem;
  color: var(--text-color-secondary);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: 500;
}

.footer-contact-value {
  font-size: 0.82rem;
  font-weight: 600;
  margin: 0.1rem 0 0;
  color: var(--text-color);
}

.footer-hours {
  text-align: center;
}

.footer-hours-title {
  font-size: 0.78rem;
  font-weight: 700;
  margin: 0 0 0.75rem;
  color: var(--text-color);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
}

.footer-hours-title i {
  font-size: 0.8rem;
  color: var(--primary-color);
}

.footer-hours-grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.footer-hours-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.4rem 0.75rem;
  background: var(--surface-ground);
  border-radius: 0.5rem;
}

.footer-hours-day {
  font-size: 0.75rem;
  color: var(--text-color);
  font-weight: 500;
}

.footer-hours-time {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--primary-color);
}

.footer-hours-time.closed {
  color: #EF4444;
}

.footer-igd {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding: 0.6rem 1rem;
  background: linear-gradient(135deg, #DC262610, #EF444415);
  border: 1px solid #EF444430;
  border-radius: 0.625rem;
  font-size: 0.75rem;
  color: #EF4444;
}

.footer-igd i {
  font-size: 0.9rem;
}

.footer-copyright {
  text-align: center;
  font-size: 0.65rem;
  color: var(--text-color-secondary);
  margin: 0;
  line-height: 1.5;
}
</style>
