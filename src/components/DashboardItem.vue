<template>
  <div class="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col h-full transition-colors duration-300">
    
    <div class="flex justify-between items-center mb-5">
      <div class="space-y-0.5">
        <h3 class="text-xs font-bold text-slate-800 tracking-tight">
          {{ item.name }}
        </h3>
        <p class="text-[10px] text-slate-400 font-medium">
          Terbarui secara otomatis (Real-time)
        </p>
      </div>
      
      <div v-if="item.allow_toggle_view" class="inline-flex rounded-xl bg-slate-50 p-0.5 border border-slate-100">
        <button 
          @click="currentView = 'chart'"
          :class="currentView === 'chart' ? 'bg-white text-slate-600 shadow-xs font-semibold' : 'text-slate-400 hover:text-slate-600'"
          class="px-2.5 py-1 text-[10px] rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <i class="pi pi-chart-bar text-[9px]"></i> Visual
        </button>
        <button 
          @click="currentView = 'table'"
          :class="currentView === 'table' ? 'bg-white text-slate-600 shadow-xs font-semibold' : 'text-slate-400 hover:text-slate-600'"
          class="px-2.5 py-1 text-[10px] rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <i class="pi pi-table text-[9px]"></i> Tabel
        </button>
      </div>
    </div>

    <div class="grow flex items-center justify-center min-h-80">
      
      <div v-if="currentView === 'chart'" class="w-full cursor-pointer">
        <ChartPie v-if="['pie', 'donut', 'polarArea', 'radialBar'].includes(item.chart_type)" :type="item.chart_type" :data="rawData" @chart-click="handleDynamicChartClick" />
        <ChartXY v-else :type="item.chart_type" :data="rawData" @chart-click="handleDynamicChartClick" />
      </div>

      <div v-else class="w-full overflow-hidden flex flex-col justify-between">
        <DataTable :value="rawData" :rows="5" :paginator="rawData.length > 5" stripedRows tableStyle="min-width: 50rem" responsiveLayout="scroll" @row-click="handleTableDynamicRowClick">
          <template #empty>
            <div class="text-center py-12 text-xs text-slate-400 italic">Tidak ada baris data.</div>
          </template>
          <Column v-for="col in tableColumns" :key="col" :field="col" :header="cleanHeaderLabel(col)" sortable>
            <template #body="slotProps">
              <span :class="{'font-semibold text-teal-600': col.toLowerCase().includes('omset')}">
                {{ formatCellData(col, slotProps.data[col]) }}
              </span>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <Sidebar v-model:visible="drawerVisible" position="right" class="w-full max-w-3xl md:max-w-4xl lg:max-w-5xl bg-slate-200 md:w-280 border-l border-slate-100">
      <template #header>
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-slate-500/10 text-slate-500 flex items-center justify-center">
            <i class="pi pi-search-plus text-sm"></i>
          </div>
          <div class="flex flex-col">
            <span class="text-sm font-bold text-slate-900">Analisis Detail Transaksi</span>
            <span class="text-[10px] text-slate-400 mt-0.5 font-medium">Kategori Terpilih: {{ selectedCategoryLabel }}</span>
          </div>
        </div>
      </template>

      <div class="mt-5 space-y-4 h-full flex flex-col">
        <div v-if="drawerLoading" class="grow flex flex-col items-center justify-center gap-2 py-20">
          <i class="pi pi-spin pi-spinner text-slate-500 text-lg"></i>
          <span class="text-xs text-slate-400">Menarik data dari database...</span>
        </div>
        
        <DataTable v-else :value="drawerData" :rows="10" paginator responsiveLayout="scroll">
          <template #empty>
            <div class="text-center py-8 text-xs text-slate-400">Detail rincian data tidak ditemukan.</div>
          </template>
          <Column v-for="col in drawerColumns" :key="col" :field="col" :header="cleanHeaderLabel(col)" sortable>
            <template #body="slotProps">
              <span :class="{'font-semibold text-teal-600': col.toLowerCase().includes('omset')}">
                {{ formatCellData(col, slotProps.data[col]) }}
              </span>
            </template>
          </Column>
        </DataTable>
      </div>
    </Sidebar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useDashboardStore } from '../store/dashboard';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Sidebar from 'primevue/sidebar';
import ChartXY from './charts/ChartXY.vue';
import ChartPie from './charts/ChartPie.vue';

const props = defineProps({
  item: Object
});

const store = useDashboardStore();

// State Internal Komponen Kartu
const currentView = ref('chart');
const rawData = ref([]);
const drawerVisible = ref(false);
const drawerLoading = ref(false);
const drawerData = ref([]);
const selectedCategoryLabel = ref('');

// Format Otomatis Nama Kolom SQL Database (e.g., 'total_amount' -> 'Total Amount')
const cleanHeaderLabel = (text) => text.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

// Ambil Struktur Kolom Dinamis Berdasarkan Key Data yang Masuk
const tableColumns = computed(() => {
  if (rawData.value.length === 0) return [];
  
  return Object.keys(rawData.value[0]).filter(col => {
    const lowerCol = col.toLowerCase();
    // Mengecualikan kolom bernama murni 'id' atau yang berakhiran '_id' (e.g., partner_id, user_id)
    return lowerCol !== 'id' && !lowerCol.endsWith('_id');
  });
});
const drawerColumns = computed(() => {
  if (drawerData.value.length === 0) return [];
  
  return Object.keys(drawerData.value[0]).filter(col => {
    const lowerCol = col.toLowerCase();
    // Mengecualikan kolom bernama murni 'id' atau yang berakhiran '_id' (e.g., partner_id, user_id)
    return lowerCol !== 'id' && !lowerCol.endsWith('_id');
  });
});

// Sinkronisasi Data Real-time (Push Update dari Node.js / Odoo Bridge)
watch(() => props.item.realtimeData, (newData) => {
  if (newData) {
    rawData.value = newData;
  }
}, { deep: true });

// Pemuatan Data Pertama Kali (Initial Pull) Saat Kartu Terpasang
onMounted(() => {
  store.socket.emit('get_chart_data', { itemId: props.item.id }, (res) => {
    if (res.success) {
      rawData.value = res.data;
    }
  });
});

// INTERSEPTOR KLIK UNTUK DIALOKASIKAN KE MULTI-FILTER DRILLDOWN DRAWER
function handleDynamicChartClick(payload) {
  console.log("handleDynamicChartClick")
  const { key, value } = payload; // Contoh: key = 'periode', value = '2025-02'

  selectedCategoryLabel.value = value;
  
  // Susun filter dinamis secara instan berdasarkan kolom sumbu X grafik tersebut
  const filters = { [key]: value };

  // Buka laci samping dan hidupkan animasi loading
  drawerVisible.value = true;
  drawerLoading.value = true;

  // Tembak ke Node.js Bridge Server
  store.socket.emit('get_chart_detail_multi', { itemId: props.item.id, filters }, (res) => {
    drawerLoading.value = false;
    if (res.success) {
      drawerData.value = res.data;
    }
  });
}

// FUNGSI BARU: Menangkap klik langsung dari baris tabel angka PrimeVue
function handleTableDynamicRowClick(event) {
  // data berisi objek baris yang diklik, misal: { periode: '2025-02', jumlah_new_lead: 5 }
  const rowDataSelected = event.data; 
  const categoryKey = tableColumns.value[0]; // Kolom pertama (Sumbu X)
  const selectedValue = rowDataSelected[categoryKey];

  if (selectedValue) {
    // Teruskan ke fungsi drilldown utama kita yang sudah dinamis
    handleDynamicChartClick({ key: categoryKey, value: selectedValue });
  }
}

// ── UTALITAS FORMATTER DATA SAAS ──

// 1. Format Angka ke Rupiah (Mendeteksi kolom bernilai uang/omset)
function formatRupiah(value) {
  if (value === null || value === undefined || isNaN(value)) return '-';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value);
}

// 2. Format ISO Bulan (YYYY-MM) menjadi Teks Indonesia (Maret 2026)
function formatBulanIndo(value) {
  if (!value || typeof value !== 'string') return value;
  
  // Mencocokkan pola format YYYY-MM (e.g., 2026-03)
  const regexBulan = /^\d{4}-\d{2}$/;
  if (!regexBulan.test(value)) return value; // Jika bukan format YYYY-MM, kembalikan teks asli

  const [tahun, bulan] = value.split('-');
  const namaBulan = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const indexBulan = parseInt(bulan, 10) - 1;
  return `${namaBulan[indexBulan]} ${tahun}`;
}

// 3. Parser Utama: Menentukan kapan format harus diterapkan berdasarkan nama teknis kolom SQL
function formatCellData(colName, value) {
  const lowerCol = colName.toLowerCase();
  
  // Deteksi kolom uang (omset, penjualan, revenue, total_amount, nilai_kerugian, dll)
  if (lowerCol.includes('omset') || lowerCol.includes('sales') || lowerCol.includes('revenue') || lowerCol.includes('harga') || lowerCol.includes('nominal') || lowerCol.includes('nilai')) {
    return formatRupiah(value);
  }
  
  // Deteksi kolom waktu/periode
  if (lowerCol === 'periode' || lowerCol === 'bulan') {
    return formatBulanIndo(value);
  }
  
  // Jika kolom teks biasa atau angka murni (seperti jumlah lead, qty stok)
  if (typeof value === 'number') {
    return value.toLocaleString('id-ID'); // Berikan pemisah ribuan standar (e.g., 1.500)
  }

  return value;
}
</script>