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
import { DataFormatter } from '../../utils/formatter.js';

const emit = defineEmits(['chart-click']);

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
  const xlabel = columns.value[0]; // Ambil kolom pertama sebagai teks label (e.g., status, kategori)
  const labelsArray = props.data.map(row => String(row[xlabel] || 'N/A').toUpperCase());

  return {
    chart: {
      id: `chart-pie-${Math.random()}`,
      background: 'transparent',
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      events: {
        dataPointSelection: (event, chartContext, config) => {
          // Ambil nama kolom kategori (Sumbu X)
          const categoryKey = DataFormatter.cleanHeaderLabel(columns.value[0]);
          // Dapatkan nilai teks berdasarkan indeks batang yang diklik pengguna
          const activeRow = props.data[config.dataPointIndex];
          
          if (activeRow) {
            const selectedValue = activeRow[categoryKey];
            console.log(`[Graph Click Debug] Terdeteksi klik pada: ${categoryKey} = ${selectedValue}`);
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
      colors: ['#ffffff'],
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
              color: '#94a3b8'
            },
            value: {
              show: true,
              fontSize: '16px',
              fontWeight: '700',
              color: '#0f172a',
              formatter: (val) => DataFormatter.autoFormat(xlabel, val, false)
            },
            total: {
              show: true,
              label: 'TOTAL',
              fontSize: '10px',
              fontWeight: '700',
              color: '#94a3b8',
              formatter: (w) => {
                const totalSum = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                return DataFormatter.autoFormat(xlabel, totalSum, false);
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
      horizontalAlign: 'left',
      fontSize: '11px',
      labels: { colors: '#64748b' },
      markers: { radius: 6 }
    },
    tooltip: {
      theme: 'light',
      style: { fontSize: '11px' }
    }
  };
});
</script>