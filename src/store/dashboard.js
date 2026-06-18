import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { io } from 'socket.io-client';
import { useAuthStore } from './auth';

export const useDashboardStore = defineStore('dashboard', () => {
  const socket = io('http://localhost:3000');
  // const socket = io({ transports: ['websocket', 'polling'] });
  const authStore = useAuthStore();
  
  // State Navigasi & Komponen Layout
  const pagesList = ref([]);
  const currentPageName = ref('');
  const dashboardItems = ref([]);
  const isLoading = ref(false);
  const errorMessage = ref('');
  const isSidebarOpen = ref(false);
  const filters = ref([
    { name: 'Today', code: 'today' },
    { name: 'This Week', code: 'weekly' },
    { name: 'This Month', code: 'monthly' },
    { name: 'This Year', code: 'yearly' },
    { name: 'Month to Day', code: 'mtd' },
    { name: 'Year to Day', code: 'yd' },
    { name: 'Last Month', code: 'lm' },
    { name: 'Last Year', code: 'ly' },
  ]);
  const currentFilter = ref({ name: 'This Month', code: 'monthly' });

  function setFilter(newValue) {
    currentFilter.value = newValue;
    console.log(`Filter global berubah: ${newValue.code}, menyegarkan data engine...`);
  }

  watch(currentFilter, () => {

  });

  const isDarkMode = ref(localStorage.getItem('theme') === 'dark');

  watch(isDarkMode, (valueAwal) => {
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
      console.log(item);
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
    isSidebarOpen, filters, currentFilter, setFilter, toggleTheme, fetchSidebarPages, fetchDashboardLayout
  };
});