import { defineStore } from 'pinia';
import { ref } from 'vue';
import { io } from 'socket.io-client';
import { useAuthStore } from './auth';

export const useDashboardStore = defineStore('dashboard', () => {
  function formatDate (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, 0);
      return `${year}-${month}-${day}`;
    }

  const socket = io('http://localhost:3000');
  // const socket = io({ transports: ['websocket', 'polling'] });
  const authStore = useAuthStore();
  
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
    { name: 'Last Month', code: 'lm' },
    { name: 'Last Year', code: 'ly' },
  ]);
  const today = new Date();
  const currentFilter = ref({ name: 'This Month', code: 'monthly' });
  const applyFilter = ref({ 
    start: formatDate(new Date(today.getFullYear(), today.getMonth(), 1)), 
    range: '1 month',
    format: 'YYYY-MM'
  });

  function setFilter(newValue) {
    currentFilter.value = newValue;
    const dateToday = formatDate(today);
    const currentDay = today.getDay();

    let start = dateToday;
    let range = '1 day'
    let format = 'YYYY-MM-DD'
    
    if(newValue.code == 'weekly') {
      const distanceToMonday = currentDay === 0 ? 6 : currentDay -1;
      const monday = new Date(today);
      monday.setDate(today.getDate() - distanceToMonday);

      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      start = formatDate(monday);
      range = '1 week'
      format = 'WW'
    }
    if(newValue.code == 'monthly') {
      start = formatDate(new Date(today.getFullYear(), today.getMonth(), 1));
      range = '1 month'
      format = 'YYYY-MM'
    }
    if(newValue.code == 'yearly') {
      start = formatDate(new Date(today.getFullYear(), 0, 1));
      range = '1 year'
      format = 'YYYY'
    }
    if(newValue.code == 'lm') {
      start = formatDate(new Date(today.getFullYear(), today.getMonth() - 1, 1));
      range = '1 month'
      format = 'YYYY-MM'
    }
    if(newValue.code == 'ly') {
      start = formatDate(new Date(today.getFullYear() - 1, 0, 1));
      range = '1 year'
      format = 'YYYY'
    }

    applyFilter.value = {start: start, range: range, format: format};
    console.log(`Filter global berubah: ${newValue.code} - [start: ${start}, range: ${range}, format: ${format}], menyegarkan data engine...`);
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
    isSidebarOpen, filters, currentFilter, applyFilter, setFilter, fetchSidebarPages, fetchDashboardLayout
  };
});