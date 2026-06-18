<template>
  <KpiCard 
    v-if="!loading"
    :title="item.name" 
    :value="data" 
    :percentage="percent" 
    :icon="item.icon" 
    :isCurrency="item.xaxis_value_type.toLowerCase() === 'currency'" 
    @card-click="handleDynamicCardClick"
  />

  <Drawer v-model:visible="drawerVisible" position="right" class="w-full md:w-140! lg:w-180! bg-slate-200 border-l border-slate-100">
      <template #header>
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-slate-500/10 text-slate-500 flex items-center justify-center">
            <i class="pi pi-search-plus text-sm"></i>
          </div>
          <div class="flex flex-col">
            <span class="text-sm font-bold text-slate-900">Analisis Detail Transaksi</span>
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
    </Drawer>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useDashboardStore } from '../store/dashboard';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Drawer from 'primevue/drawer';
import KpiCard from './KpiCard.vue';

const props = defineProps({
  item: { type: Object, required: true }
});

const drawerVisible = ref(false);
const drawerLoading = ref(false);
const drawerData = ref([]);

const cleanHeaderLabel = (text) => text.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

const drawerColumns = computed(() => {
  if (drawerData.value.length === 0) return [];
  
  return Object.keys(drawerData.value[0]).filter(col => {
    const lowerCol = col.toLowerCase();
    // Mengecualikan kolom bernama murni 'id' atau yang berakhiran '_id' (e.g., partner_id, user_id)
    return lowerCol !== 'id' && !lowerCol.endsWith('_id');
  });
});

const store = useDashboardStore();
const loading = ref(true);
const data = ref(0);
const percent = ref(0);

function handleDynamicCardClick() {
  console.log("handleDynamicCardClick")
  // Buka laci samping dan hidupkan animasi loading
  drawerVisible.value = true;
  drawerLoading.value = true;

  // Tembak ke Node.js Bridge Server
  store.socket.emit('get_chart_detail_multi', { itemId: props.item.id, filters: {} }, (res) => {
    drawerLoading.value = false;
    if (res.success) {
      drawerData.value = res.data;
    }
  });
}

function loadDashboard() {
  store.socket.emit('get_chart_data', { itemId: props.item.id, filters: store.applyFilter }, (res) => {
    loading.value = false;
    if (res.success && res.data && res.data.length > 0) {
      const rowData = res.data[0]; // Kpi kueri selalu mengembalikan 1 baris objek teratas
      
      // Ambil secara dinamis nilai dari key pertama dan kedua hasil kueri SQL Odoo
      const keys = Object.keys(rowData);
      data.value = parseFloat(rowData[keys[0]]) || 0;
      percent.value = parseFloat(rowData[keys[1]]) || 0;
    }
  });
}

onMounted(() => {
  loadDashboard();
});

watch(() => store.applyFilter, () => {
  loadDashboard();
}, { deep: true });

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