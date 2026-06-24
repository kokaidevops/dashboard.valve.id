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
import { watch, computed, nextTick, ref } from 'vue';
import { DataFormatter } from '../../utils/formatter.js';
import { useDashboardStore } from '../../store/dashboard.js';
import ApexCharts from 'apexcharts';

const store = useDashboardStore();

const emit = defineEmits(['chart-click']);

const props = defineProps({
  type: { type: String, default: 'bar' },
  data: { type: Array, default: () => [] },
  direction: { type: String, default: 'vertical' },
  chartId: { type: String, default: 'chart-xy' },
  hasGoal: { type: Boolean, default: false },
});

const filterChange = ref(false);

// 1. Dapatkan daftar nama kolom SQL secara dinamis
const columns = computed(() => props.data.length > 0 ? Object.keys(props.data[0]) : []);

const transformedData = computed(() => {
  if (props.data.length === 0) return { categories: [], series: [] };

  // Ambil nama-nama key kolom dari data hasil query SQL
  const keys = Object.keys(props.data[0]);
  const xKey = keys[0]; // Kolom pertama (e.g., 'periode' -> X-Axis)
  
  // Deteksi Multi-Series: Jika query SQL menghasilkan 3 kolom atau lebih
  const isMultiSeries = keys.length >= 3;

  // Mendapatkan list unik untuk sumbu X (Categories) secara berurutan
  const categories = [...new Set(props.data.map(row => row[xKey]))];

  if (!isMultiSeries) {
    // Jalur Single-Series (Contoh: Hanya kolom Periode dan Total)
    const yKey = keys[1];
    const seriesData = categories.map(cat => {
      const found = props.data.find(row => row[xKey] === cat);
      return found ? found[yKey] : 0;
    });

    return {
      categories,
      series: [{ name: DataFormatter.cleanHeaderLabel(yKey), data: seriesData }]
    };
  } else {
    // Jalur Multi-Series (Contoh: Kolom Periode, Kategori_Site, dan Total)
    const groupKey = keys[1]; // Kolom kedua (e.g., 'kategori' -> Legend)
    const valueKey = keys[2]; // Kolom ketiga (e.g., 'total' -> Nilai Y)

    // Dapatkan semua nama group/kategori unik (e.g., [Tambang A, Tambang B])
    const uniqueGroups = [...new Set(props.data.map(row => row[groupKey]))];

    // Bentuk struktur array objek sesuai standarisasi multi-series ApexCharts
    const series = uniqueGroups.map(groupName => {
      const dataSeries = categories.map(cat => {
        // Cari baris data yang COCOK antara Periode X dan Kategori Group Y
        const found = props.data.find(row => row[xKey] === cat && row[groupKey] === groupName);
        return found ? Number(found[valueKey]) : 0; // Kembalikan 0 jika tidak ada data di periode tersebut
      });

      return {
        name: String(groupName),
        data: dataSeries
      };
    });

    return { categories, series };
  }
});

// 2. GENERATE OPTIONS (KONFIGURASI GRAFIK) ADAPTIF SINKRON TEMA
function getAxisMax() {
  if (!props.hasGoal) return undefined;

  let target = 1
  if(store.applyFilter.range == '1 week') target = 3
  if(store.applyFilter.range == '1 month') target = 12
  if(store.applyFilter.range == '1 year') target = 48

  const values = transformedData.value.series.flatMap(s => s.data);
  const dataMax = Math.max(...values, 0);

  return Math.max(dataMax, target) + 1;
}

const chartAnnotations = computed(() => {
  if (!props.hasGoal) return {};

  let target = 1
  if(store.applyFilter.range == '1 week') target = 3
  if(store.applyFilter.range == '1 month') target = 12
  if(store.applyFilter.range == '1 year') target = 48

  const markerLineConfig = {
    strokeWidth: 3,
    dashArray: 4,
    borderColor: '#ef4444',
    label: {
      borderColor: '#ef4444',
      style: {
        color: '#fff',
        background: '#ef4444',
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        fontSize: '10px',
        fontWeight: 700
      },
      text: `Target: ${DataFormatter.autoFormat(':number', target, true)}`
    }
  };

  if (props.direction == 'horizontal') {
    return {
      xaxis: [{
        x: target,
        ...markerLineConfig
      }]
    };
  } else {
    return {
      yaxis: [{
        y: target,
        ...markerLineConfig
      }]
    };
  }
});

const chartOptions = computed(() => {
  const categories = transformedData.value.categories;
  const xlabel = columns.value[0];

  function triggerDrilldown(dataPointIndex) {
    if (dataPointIndex === -1 || dataPointIndex === undefined) return;
    const selectedCategory = categories[dataPointIndex];
    const xlabelClean = DataFormatter.cleanHeaderLabel(xlabel);
    if (selectedCategory) {
      console.log(`[Graph Click Debug] Terdeteksi klik pada: ${xlabelClean.toLowerCase()} = ${selectedCategory}`);
      emit('chart-click', { key: xlabelClean.toLowerCase(), value: selectedCategory });
    }
  }

  return {
    chart: {
      id: props.chartId,
      stacked: false, // Set 'true' jika ingin model grafik balok bertumpuk
      toolbar: { show: false }, // Hilangkan tombol bawaan apex yang mengganggu kebersihan UI SaaS
      background: 'transparent',
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      events: {
        dataPointSelection: (event, chartContext, config) => {
          triggerDrilldown(config.dataPointIndex);
        },
        click: function(event, chartContext, config) {
          triggerDrilldown(config.dataPointIndex);
        },
        markerClick: function(event, chartContext, config) {
          triggerDrilldown(config.dataPointIndex);
        },
      },
    },
    markers: {
      size: props.type === 'line' || props.type === 'area' ? 4 : 0,
      strokeWidth: 2,
      strokeColors: '#ffffff',
      hover: {
        size: 6,
        sizeOffset: 3
      }
    },
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
      labels: { colors: '#64748b' }
    },
    grid: {
      borderColor: '#f1f5f9',
      strokeDashArray: 4,
    },
    tooltip: {
      theme: 'light',
      x: { show: true },
      style: { fontSize: '12px' },
      shared: true,
      intersect: false
    },
    ...getFormatterConfiguration()
  };
});

// 3. GENERATE SERIES DATA (TRANSFORMASI SQL DATA KE APEX DATA STRUCT)
const chartSeries = computed(() => transformedData.value.series);

function getFormatterConfiguration() {
  const categories = transformedData.value.categories;
  const xlabel = columns.value[0];
  const ylabel = columns.value[columns.value.length - 1];

  if (filterChange.value) {
    return {
      annotations: chartAnnotations.value
    };
  };
  console.log(getAxisMax())

  return {
    xaxis: {
      max: props.direction === 'horizontal' ? getAxisMax() : undefined,
      categories: categories,
      labels: {
        formatter: (val) => { return DataFormatter.autoFormat(props.direction === 'horizontal' ? ylabel : xlabel , val, false) },
        style: { colors: '#94a3b8', fontSize: '11px' }
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
      crosshairs: {
        show: true,
        width: props.type === 'line' ? 2 : 'auto',
        position: 'back',
        stroke: {
          color: '#e2e8f0',
          width: 1,
          dashArray: 3,
        },
      }
    },
    yaxis: {
      max: props.direction !== 'horizontal' ? getAxisMax() : undefined,
      labels: {
        formatter: (val) => { return DataFormatter.autoFormat(props.direction === 'horizontal' ? xlabel : ylabel , val, false) },
        style: { colors: '#94a3b8', fontSize: '11px' }
      }
    },
    annotations: chartAnnotations.value
  }
}

watch(
  [() => props.data, () => store.applyFilter],
  async ([newData]) => {
    if (newData && newData.length > 0) {
      await nextTick();

      filterChange.value = true;

      ApexCharts.exec(
        props.chartId,
        'updateOptions',
        {
          ...getFormatterConfiguration()
        },
        false,
        true
      );
    }
  },
  { deep: true, immediate: true }
);

</script>