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
        <ChartXY v-else :chart-id="`chart-xy-${item.id}`" :type="item.chart_type" :direction="item.direction" :data="rawData" @chart-click="handleDynamicChartClick" />
      </div>

      <div v-else class="w-full overflow-hidden flex flex-col justify-between">
        <DataTable 
          :value="rawData" 
          v-model:filters="tableFilters"
          filterDisplay="menu"
          :globalFilterFields="tableColumns" 
          :rows="5" 
          :paginator="rawData.length > 5" 
          showGridlines 
          stripedRows 
          tableStyle="min-width: 50rem" 
          responsiveLayout="scroll" 
          @row-click="handleTableDynamicRowClick"
        >
          <template #header>
            <div class="flex justify-end items-center mb-2">
              <div class="relative w-full max-w-xs">
                <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                  <i class="pi pi-search text-xs"></i>
                </span>
                <input 
                  v-model="tableFilters['global'].value" 
                  type="text" 
                  placeholder="Cari rincian data..." 
                  class="w-full pl-9 pr-4 py-1.5 bg-slate-50 text-xs rounded-xl border border-slate-100 focus:outline-hidden focus:border-brand-500 text-slate-700 font-medium transition-colors"
                />
              </div>
            </div>
          </template>
          <template #empty>
            <div class="text-center py-12 text-xs text-slate-400 italic">Tidak ada baris data.</div>
          </template>
          <Column 
            v-for="col in tableColumns" 
            :key="col" 
            :field="col" 
            :header="DataFormatter.cleanHeaderLabel(col)" 
            sortable
            filter :showFilterMatchModes="true"
          >
            <template #body="slotProps">
              <span :class="{'font-semibold text-teal-600': col.toLowerCase().includes('omset')}">
                {{ DataFormatter.autoFormat(col, slotProps.data[col], false) }}
              </span>
            </template>

            <template #filterelement="{ filterModel, filterCallback }">
              <input 
                v-model="filterModel.value" 
                type="text" 
                @input="filterCallback()" 
                class="p-1 text-xs bg-slate-50 border border-slate-200 rounded-md" 
                placeholder="Filter nilai..."
              />
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <Drawer v-model:visible="drawerVisible" position="right" class="w-full md:w-140! lg:w-180! xl:w-260! bg-slate-200 border-l border-slate-100">
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
        
        <DataTable v-else :value="drawerData" :rows="10" showGridlines stripedRows paginator responsiveLayout="scroll">
          <template #empty>
            <div class="text-center py-8 text-xs text-slate-400">Detail rincian data tidak ditemukan.</div>
          </template>
          <Column v-for="col in drawerColumns" :key="col" :field="col" :header="DataFormatter.cleanHeaderLabel(col)" sortable>
            <template #body="slotProps">
              <span>
                {{ DataFormatter.autoFormat(col, slotProps.data[col], false) }}
              </span>
            </template>
          </Column>
        </DataTable>
      </div>
    </Drawer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { FilterMatchMode, FilterOperator } from '@primevue/core/api';
import { useDashboardStore } from '../store/dashboard';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Drawer from 'primevue/drawer';
import ChartXY from './charts/ChartXY.vue';
import ChartPie from './charts/ChartPie.vue';
import { DataFormatter } from '../utils/formatter.js'

const props = defineProps({
  item: Object
});

const store = useDashboardStore();

const tableFilters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

// State Internal Komponen Kartu
const currentView = ref('chart');
const rawData = ref([]);
const drawerVisible = ref(false);
const drawerLoading = ref(false);
const drawerData = ref([]);
const selectedCategoryLabel = ref('');

const getHeader = (value) => {
  if (value.length === 0) return [];
  return Object.keys(value[0]).filter(col => {
    const lowerCol = col.toLowerCase();
    return lowerCol !== 'id' && !lowerCol.endsWith('_id');
  });
}

function loadDashboard() {
  store.socket.emit('get_chart_data', { itemId: props.item.id, filters: store.applyFilter }, (res) => {
    if (res.success) {
      rawData.value = res.data;
    }
  });
}

// Ambil Struktur Kolom Dinamis Berdasarkan Key Data yang Masuk
const tableColumns = computed(() => { return getHeader(rawData.value); });
const drawerColumns = computed(() => { return getHeader(drawerData.value); });

watch(() => store.applyFilter, () => {
  loadDashboard();
}, { deep: true });
watch(() => rawData.value, () => {
  const keys = Object.keys(rawData.value[0] || {});
  keys.forEach(key => {
    if (!tableFilters.value[key]) {
      tableFilters.value[key] = { value: null, matchMode: FilterMatchMode.CONTAINS };
    }
  });
  console.log(tableFilters.value);
}, { immediate: true });

onMounted(() => {
  loadDashboard();
});

// INTERSEPTOR KLIK UNTUK DIALOKASIKAN KE MULTI-FILTER DRILLDOWN DRAWER
function handleDynamicChartClick(payload) {
  console.log("handleDynamicChartClick")
  const { key, value } = payload; // Contoh: key = 'periode', value = '2025-02'

  selectedCategoryLabel.value = value;
  
  // Susun filter dinamis secara instan berdasarkan kolom sumbu X grafik tersebut
  const filters = { [key]: value, ...store.applyFilter };

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
</script>