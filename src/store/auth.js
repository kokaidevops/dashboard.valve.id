import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('user')) || null);
  const token = ref(localStorage.getItem('token') || null);

  // Batas toleransi idle: 5 hari dalam milidetik (5 * 24 * 60 * 60 * 1000)
  const MAX_IDLE_TIME = 5 * 24 * 60 * 60 * 1000;

  const isAuthenticated = computed(() => {
    if (!token.value) return false;
    
    // Periksa apakah sesi sudah kedaluwarsa berdasarkan aktivitas terakhir
    const lastActivity = Number(localStorage.getItem('lastActivity') || 0);
    const now = Date.now();

    // FIX: Jika lastActivity masih 0 (baru login), lewati pengecekan expired
    if (lastActivity === 0) {
      refreshActivity();
      return true;
    }
    
    if (now - lastActivity > MAX_IDLE_TIME) {
      logout(); // Otomatis hapus sesi jika sudah lewat 5 hari tanpa kegiatan
      return false;
    }
    
    // Jika masih valid, perbarui aktivitas terakhir (karena fungsi ini sering dipanggil saat navigasi)
    refreshActivity();
    return true;
  });

  function refreshActivity() {
    localStorage.setItem('lastActivity', Date.now().toString());
  }

  function login(userData, userToken) {
    user.value = userData;
    token.value = userToken;
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userToken);
  }

  function logout() {
    user.value = null;
    token.value = null;
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('lastActivity');
  }

  return { user, token, isAuthenticated, login, logout, refreshActivity };
});