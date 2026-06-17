import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { io } from 'socket.io-client';
import { useAuthStore } from './auth';

export const useDashboardStore = defineStore('dashboard', () => {
  const socket = io('http://192.168.1.11:31213');
  // const socket = io({ transports: ['websocket', 'polling'] });
  const authStore = useAuthStore();
  
  // State Navigasi & Komponen Layout
  const pagesList = ref([]);
  const currentPageName = ref('');
  const dashboardItems = ref([]);
  const isLoading = ref(false);
  const errorMessage = ref('');
  const isSidebarOpen = ref(false);

  // ── FIX: REAKTIVITAS DARK MODE GLOBAL ──
  // Mengambil preferensi tema tersimpan atau default ke mode terang (false)
  const isDarkMode = ref(localStorage.getItem('theme') === 'dark');

  // Watcher ini bertugas menyuntikkan class .dark ke root <html> secara instan
  watch(isDarkMode, (valueAwal) => {
    // if (valueAwal) {
    //   document.documentElement.classList.add('dark');
    //   localStorage.setItem('theme', 'dark');
    // } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    // }
  }, { immediate: true }); // immediate: true memastikan tema langsung diterapkan saat aplikasi pertama dimuat

  function toggleTheme() {
    isDarkMode.value = !isDarkMode.value;
  }

  // ── FUNGSI NAVIGASI & LAYOUT ──
  function fetchSidebarPages() {
    const userId = authStore.user ? authStore.user.id : null;
    socket.emit('get_dashboard_pages', { userId }, (res) => {
      if (res.success) {
        pagesList.value = res.data;
      }
    });
  }

  function fetchDashboardLayout(slug) {
    isLoading.value = true;
    errorMessage.value = '';
    const userId = authStore.user ? authStore.user.id : null;
    
    socket.emit('get_dashboard_layout', { slug, userId }, (res) => {
      isLoading.value = false;
      if (res.success) {
        currentPageName.value = res.page_name;
        dashboardItems.value = res.items;
        setupRealtimeListeners();
      } else {
        errorMessage.value = res.error;
      }
    });
  }

  function setupRealtimeListeners() {
    dashboardItems.value.forEach(item => {
      socket.off(`chart_refresh:${item.id}`);
      socket.on(`chart_refresh:${item.id}`, (pushData) => {
        const idx = dashboardItems.value.findIndex(i => i.id === item.id);
        if (idx !== -1) {
          dashboardItems.value[idx].realtimeData = pushData.chart_data;
        }
      });
    });
  }

  return {
    socket, pagesList, currentPageName, dashboardItems, isLoading, errorMessage,
    isSidebarOpen, isDarkMode, toggleTheme, fetchSidebarPages, fetchDashboardLayout
  };
});