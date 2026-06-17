<template>
  <div class="w-full relative min-h-80">
    <div v-if="data.length === 0" class="absolute inset-0 flex items-center justify-center text-xs text-slate-400 italic">
      Tidak ada data visualisasi untuk ditampilkan
    </div>
    
    <apexchart 
      v-else
      :type="type" 
      :options="chartOptions" 
      :series="chartSeries" 
      height="320" 
    />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useDashboardStore } from '../../store/dashboard';

const emit = defineEmits(['chart-click']);

function formatBulanIndo(value) {
  if (!value || typeof value !== 'string') return value;
  const regexBulan = /^\d{4}-\d{2}$/;
  if (!regexBulan.test(value)) return value;
  
  const [tahun, bulan] = value.split('-');
  const namaBulan = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return `${namaBulan[parseInt(bulan, 10) - 1]} ${tahun}`;
}

const props = defineProps({
  type: {
    type: String,
    default: 'bar' // Nilai default: 'bar', 'line', atau 'area'
  },
  data: {
    type: Array,
    default: () => []
  },
  direction: {
    type: String,
    default: 'vertical'
  },
});

const store = useDashboardStore();

// 1. Dapatkan daftar nama kolom SQL secara dinamis
const columns = computed(() => props.data.length > 0 ? Object.keys(props.data[0]) : []);

// 2. GENERATE OPTIONS (KONFIGURASI GRAFIK) ADAPTIF SINKRON TEMA
const chartOptions = computed(() => {
  const xKey = columns.value[0] || 'category';
  const isDark = store.isDarkMode;

  return {
    chart: {
      id: `chart-xy-${Math.random()}`,
      toolbar: { show: false }, // Hilangkan tombol bawaan apex yang mengganggu kebersihan UI SaaS
      background: 'transparent',
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      events: {
        dataPointSelection: (event, chartContext, config) => {
          // Validasi ketat: pastikan user benar-benar mengklik titik data yang valid
          if (config && config.dataPointIndex !== undefined && config.dataPointIndex !== -1) {
            const categoryKey = columns.value[0];
            
            // Ambil data baris secara aman berdasarkan dataPointIndex dari ApexCharts
            const activeRow = props.data[config.dataPointIndex];
            
            if (activeRow) {
              const selectedValue = activeRow[categoryKey];
              console.log(`[Graph Click Debug] Terdeteksi klik pada: ${categoryKey} = ${selectedValue}`);
              
              emit('chart-click', { key: categoryKey, value: selectedValue });
            }
          }
        }
      },
    },
    // Kustomisasi warna aksen SaaS (Turquoise, Indigo, Amber, Rose)
    colors: ['#14b8a6', '#6366f1', '#f59e0b', '#f43f5e', '#10b981'],
    stroke: {
      curve: 'smooth',
      width: props.type === 'line' ? 3 : 0 // Garis tebal tipis adaptif
    },
    plotOptions: {
      bar: {
        horizontal: props.direction === 'horizontal',
        columnWidth: '45%',
        borderRadius: 4, // Efek tumpul modern pada diagram batang
      }
    },
    dataLabels: { enabled: false },
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'right',
      labels: { colors: isDark ? '#94a3b8' : '#64748b' }
    },
    // Konfigurasi Grid & Sumbu Adaptif Terhadap Dark/Light Mode
    grid: {
      borderColor: isDark ? '#1e293b' : '#f1f5f9',
      strokeDashArray: 4,
    },
    xaxis: {
      categories: props.data.map(row => row[xKey]),
      labels: {
        style: { colors: isDark ? '#64748b' : '#94a3b8', fontSize: '11px' }
      },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: {
        style: { colors: isDark ? '#64748b' : '#94a3b8', fontSize: '11px' }
      }
    },
    xaxis: {
      categories: props.data.map(row => row[xKey]),
      labels: {
        style: { colors: isDark ? '#64748b' : '#94a3b8', fontSize: '11px' }
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
      // Mengaktifkan bayangan lajur vertikal yang mengikuti kursor mouse
      crosshairs: {
        show: true,
        width: props.type === 'line' ? 2 : 'auto', // Garis tipis pemandu khusus tipe line
        position: 'back',
        stroke: {
          color: isDark ? '#334155' : '#e2e8f0',
          width: 1,
          dashArray: 3,
        },
      }
    },
    tooltip: {
      theme: isDark ? 'dark' : 'light',
      x: { show: true },
      style: { fontSize: '12px' },
      shared: true,
      intersect: false
    }
  };
});

// 3. GENERATE SERIES DATA (TRANSFORMASI SQL DATA KE APEX DATA STRUCT)
const chartSeries = computed(() => {
  if (props.data.length === 0) return [];
  const xKey = columns.value[0];

  // SKENARIO A: JIKA STRUKTUR DATA MULTI-SERIES (Kueri SQL menghasilkan 3 Kolom)
  // Contoh: [ { bulan: 'Jan', departemen: 'HR', total: 10 }, { bulan: 'Jan', departemen: 'IT', total: 15 } ]
  if (columns.value.length > 2) {
    const seriesKey = columns.value[1]; // Kolom pemecah group (e.g., departemen)
    const valueKey = columns.value[2];  // Kolom nilai (e.g., total)
    
    // Cari daftar nama grup yang unik
    const uniqueSeriesNames = [...new Set(props.data.map(row => row[seriesKey]))];
    
    return uniqueSeriesNames.map(name => {
      return {
        name: String(name).toUpperCase(),
        data: props.data
          .filter(row => row[seriesKey] === name)
          .map(row => Number(row[valueKey]))
      };
    });
  }

  // SKENARIO B: JIKA STRUKTUR DATA SINGLE-SERIES STANDAR (Kueri SQL menghasilkan 2 Kolom)
  // Contoh: [ { bulan: 'Jan', total_penjualan: 50000000 } ]
  const yKey = columns.value[1] || 'value';
  const seriesLabel = yKey.replace(/_/g, ' ').toUpperCase();

  return [{
    name: seriesLabel,
    data: props.data.map(row => Number(row[yKey]))
  }];
});
</script>