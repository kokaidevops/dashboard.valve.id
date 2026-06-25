<template>
  <KpiCard 
    v-if="!loading"
    :title="item.name" 
    :value="data" 
    :percentage="percent" 
    :icon="item.icon" 
    :label="label"
    :has-goal="item.has_goal"
    :achievement="achievement"
    :target="target"
    @card-click="handleDynamicCardClick"
    class="col-span-2"
  />

  <Drawer v-model:visible="drawerVisible" position="right" class="w-full md:w-140! lg:w-180! xl:w-260! bg-slate-200 border-l border-slate-100">
      <template #header>
        <div class="flex items-center gap-3">
          <div v-if="drawerButton" 
            class="w-9 h-9 rounded-xl bg-slate-500/10 text-slate-500 flex items-center justify-center" 
            @click="handleDynamicCardClick"
          >
            <i class="pi pi-angle-left text-sm"></i>
          </div>
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
        
        <DataTable v-else 
          :value="drawerData" 
          v-model:filters="filters"
          :globalFilterFields="drawerColumns" 
          :rows="10" 
          removableSort 
          stripedRows 
          showGridlines 
          paginator 
          responsiveLayout="scroll"
        >
          <template #header>
            <div class="flex justify-end items-center mb-2">
              <div class="relative w-full max-w-xs">
                <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                  <i class="pi pi-search text-xs"></i>
                </span>
                <input 
                  v-model="filters['global'].value" 
                  type="text" 
                  placeholder="Cari rincian data..." 
                  class="w-full pl-9 pr-4 py-1.5 bg-slate-50 text-xs rounded-xl border border-slate-100 focus:outline-hidden focus:border-brand-500 text-slate-700 font-medium transition-colors"
                />
              </div>
            </div>
          </template>
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
          <Column v-if="props.item.action !== 'no' && !drawerButton" headerStyle="width: 8rem; text-align: center" bodyStyle="text-align: center; overflow: visible">
            <template #body="slotProps">
              <Button icon="pi pi-eye" rounded class="mr-2" size="small" severity="secondary" @click="actionButton(slotProps.data)" />
            </template>
          </Column>
        </DataTable>
      </div>
    </Drawer>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';

import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Drawer from 'primevue/drawer';

import { FilterMatchMode } from '@primevue/core/api';

import { useDashboardStore } from '../store/dashboard';
import { DataFormatter } from '../utils/formatter.js';

import KpiCard from './KpiCard.vue';

const props = defineProps({
  item: { type: Object, required: true }
});

const drawerVisible = ref(false);
const drawerLoading = ref(false);
const drawerData = ref([]);
const drawerButton = ref(false);

const drawerColumns = computed(() => {
  if (drawerData.value.length === 0) return [];
  
  return Object.keys(drawerData.value[0]).filter(col => {
    const lowerCol = col.toLowerCase();
    return lowerCol !== 'id' && !lowerCol.endsWith('_id');
  });
});


const store = useDashboardStore();
const loading = ref(true);
const data = ref(0);
const percent = ref(0);
const achievement = ref(0);
const target = ref(0);
const label = ref('');
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

function handleDynamicCardClick(filters = {}, action = false) {
  console.log("handleDynamicCardClick")
  drawerButton.value = action;
  drawerVisible.value = true;
  drawerLoading.value = true;

  store.socket.emit('get_chart_detail_multi', { itemId: props.item.id, filters: {...store.applyFilter, ...filters}, action }, (res) => {
    drawerLoading.value = false;
    drawerData.value = res.success ? res.data : [];
  });
}

function actionButton(data) {
  switch (props.item.action) {
    case 'drawer':
      console.log(`Open Drawer!`);
      if (props.item.filter_action == null) {
        console.log("Filter key not found!");
        break;
      }
      const filters = {}
      props.item.filter_action.split(",").forEach((key) => {
        filters[key] = data[key] || "";
      });
      handleDynamicCardClick(filters, true);
      break;
    case 'odoo':
      console.log("Open Odoo!");
      break
    default:
      console.log(`No Action for ${props.item.name}`);
      break;
  }
}

function loadDashboard() {
  store.socket.emit('get_chart_data', { itemId: props.item.id, filters: store.applyFilter }, (res) => {
    loading.value = false;
    if (res.success && res.data && res.data.length > 0) {
      const rowData = res.data[0]; // Kpi kueri selalu mengembalikan 1 baris objek teratas
      const keys = Object.keys(rowData);
      label.value = keys[0];
      data.value = parseFloat(rowData[keys[0]]) || 0;
      percent.value = parseFloat(rowData[keys[1]]) || 0;
      achievement.value = parseFloat(rowData[keys[2]]) || 0;
      target.value = parseFloat(rowData[keys[3]]) || 0;
    }
  });
}

onMounted(() => {
  loadDashboard();
});

watch(() => store.applyFilter, () => {
  loadDashboard();
}, { deep: true });
</script>