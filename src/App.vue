<template>
  <RouterView />
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import { useAuthStore } from './store/auth';

const authStore = useAuthStore();

// Fungsi penyegar aktivitas jika pengguna berinteraksi dengan aplikasi
const updateActivity = () => {
  if (authStore.token) {
    authStore.refreshActivity();
  }
};

onMounted(() => {
  // Pasang event listener global untuk mendeteksi keaktifan user
  window.addEventListener('click', updateActivity);
  window.addEventListener('keydown', updateActivity);
  window.addEventListener('mousemove', updateActivity);
});

onUnmounted(() => {
  // Bersihkan listener saat aplikasi dihancurkan
  window.removeEventListener('click', updateActivity);
  window.removeEventListener('keydown', updateActivity);
  window.removeEventListener('mousemove', updateActivity);
});
</script>