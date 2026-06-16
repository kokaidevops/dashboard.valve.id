<template>
  <div class="w-full relative min-h-80 flex items-center justify-center">
    <div v-if="data.length === 0" class="absolute inset-0 flex items-center justify-center text-xs text-slate-400 italic">
      Tidak ada data distribusi untuk ditampilkan
    </div>
    
    <apexchart 
      v-else
      :type="type" 
      :options="chartOptions" 
      :series="chartSeries" 
      height="600"
      class="w-full"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useDashboardStore } from '../../store/dashboard';

const props = defineProps({
  type: {
    type: String,
    default: 'donut' // Bisa berupa 'pie', 'donut', 'polarArea', atau 'radialBar'
  },
  data: {
    type: Array,
    default: () => []
  }
});

const store = useDashboardStore();

// Dapatkan nama kolom dari data SQL
const columns = computed(() => props.data.length > 0 ? Object.keys(props.data[0]) : []);

// 1. EXTRACT SERIES (Kumpulan nilai numerik saja untuk Pie)
const chartSeries = computed(() => {
  if (props.data.length === 0) return [];
  const valKey = columns.value[1]; // Ambil kolom kedua (e.g., total_qty, total_amount)
  return props.data.map(row => Number(row[valKey] || 0));
});

// 2. GENERATE OPTIONS & LABELS ADAPTIF
const chartOptions = computed(() => {
  const labelKey = columns.value[0]; // Ambil kolom pertama sebagai teks label (e.g., status, kategori)
  const isDark = store.isDarkMode;
  const labelsArray = props.data.map(row => String(row[labelKey] || 'N/A').toUpperCase());

  return {
    chart: {
      id: `chart-pie-${Math.random()}`,
      background: 'transparent',
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      events: {
        dataPointSelection: (event, chartContext, config) => {
          // Ambil nama kolom kategori (Sumbu X)
          const categoryKey = columns.value[0];
          // Dapatkan nilai teks berdasarkan indeks batang yang diklik pengguna
          const selectedValue = props.data[config.dataPointIndex]?.[categoryKey];
          
          if (selectedValue) {
            // Emit data keluar menuju DashboardItem.vue
            emit('chart-click', { key: categoryKey, value: selectedValue });
          }
        }
      }
    },
    labels: labelsArray,
    // Palet warna premium SaaS yang senada dengan ChartXY
    colors: ['#14b8a6', '#6366f1', '#f59e0b', '#f43f5e', '#10b981', '#8b5cf6', '#ec4899'],
    stroke: {
      show: true,
      // Berikan pemisah tipis antar potongan chart sesuai tema latar belakang
      colors: [isDark ? '#0f172a' : '#ffffff'],
      width: 2
    },
    // Konfigurasi internal Donut/Pie Hole
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '11px',
              color: isDark ? '#64748b' : '#94a3b8'
            },
            value: {
              show: true,
              fontSize: '16px',
              fontWeight: '700',
              color: isDark ? '#f8fafc' : '#0f172a',
              formatter: (val) => Number(val).toLocaleString('id-ID')
            },
            total: {
              show: true,
              label: 'TOTAL',
              fontSize: '10px',
              fontWeight: '700',
              color: isDark ? '#475569' : '#94a3b8',
              formatter: (w) => {
                const totalSum = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                return totalSum.toLocaleString('id-ID');
              }
            }
          }
        }
      }
    },
    dataLabels: {
      enabled: props.type === 'pie', // Hanya aktifkan text persentase di dalam potongan jika tipenya murni 'pie'
      dropShadow: { enabled: false }
    },
    legend: {
      show: true,
      position: 'bottom',
      horizontalAlign: 'center',
      fontSize: '11px',
      labels: { colors: isDark ? '#94a3b8' : '#64748b' },
      markers: { radius: 6 }
    },
    tooltip: {
      theme: isDark ? 'dark' : 'light',
      style: { fontSize: '11px' }
    }
  };
});
</script>