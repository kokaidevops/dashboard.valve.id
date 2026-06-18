<template>
  <Layout>
    <div class="max-w-7xl mx-auto space-y-6 animate-page-in">
      <div v-if="store.isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="n in 3"
          :key="n"
        >
          <div class="h-35 bg-white border border-slate-100 rounded-2xl p-5 flex flex-col justify-between animate-pulse">
            <div class="h-3 w-1/3 bg-slate-100 rounded-md"></div>
            <div class="h-6 w-1/2 bg-slate-200 rounded-md my-2"></div>
            <div class="h-3 w-1/4 bg-slate-100 rounded-md"></div>
          </div>
        </div>
        <div 
          v-for="n in 3" 
          :key="n" 
          class="h-88 bg-white border border-slate-100 rounded-2xl p-5 space-y-4 shadow-xs"
        >
          <div class="flex justify-between items-center">
            <div class="h-4 bg-slate-100 rounded-md w-1/3 animate-pulse"></div>
            <div class="h-6 bg-slate-50 rounded-lg w-16 animate-pulse"></div>
          </div>
          <div class="h-64 bg-slate-50/60 rounded-xl w-full flex items-center justify-center animate-pulse">
            <i class="pi pi-chart-bar text-slate-200  text-3xl"></i>
          </div>
        </div>
      </div>

      <div 
        v-else-if="store.errorMessage" 
        class="bg-rose-50/50 border border-rose-100 text-rose-700 p-6 rounded-2xl flex flex-col sm:flex-row items-center sm:items-start gap-4 shadow-xs"
      >
        <div class="w-10 h-10 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center shrink-0">
          <i class="pi pi-lock text-base"></i>
        </div>
        <div class="space-y-1 text-center sm:text-left">
          <h4 class="font-bold text-slate-900">Akses Halaman Terbatas</h4>
          <p class="text-xs text-slate-500 leading-relaxed max-w-xl">
            {{ store.errorMessage }}. Halaman ini bersifat privat. Silakan masuk menggunakan akun Odoo resmi Anda yang memiliki hak akses untuk melihat data analitik ini.
          </p>
          <div class="pt-2">
            <router-link 
              to="/login"
              class="inline-flex items-center gap-2 text-xs font-semibold text-brand-600 hover:underline"
            >
              Menuju Halaman Login <i class="pi pi-arrow-right text-[10px]"></i>
            </router-link>
          </div>
        </div>
      </div>

      <div v-else-if="store.dashboardItems.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardKpiWrapper 
          v-for="item in store.dashboardItems.filter(item => item.chart_type === 'card')" 
          :key="item.id" 
          :item="item" 
        />
        <div 
          v-for="item in store.dashboardItems.filter(item => item.chart_type !== 'card')" 
          :key="item.id"
          :class="[
            ['pie', 'donut', 'polarArea', 'radialBar'].includes(item.chart_type) 
              ? 'col-span-1' 
              : 'col-span-1 md:col-span-2 lg:col-span-3'
          ]"
          class="transition-all duration-300 transform"
        >
          <DashboardItem :item="item" />
        </div>
      </div>

      <div 
        v-else 
        class="h-80 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center p-6"
      >
        <div class="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
          <i class="pi pi-folder-open text-lg"></i>
        </div>
        <h3 class="text-sm font-bold text-slate-700">Dashboard Masih Kosong</h3>
        <p class="text-xs text-slate-400 max-w-xs mt-1">
          Halaman ini berhasil dimuat, namun belum ada kueri komponen grafik yang ditambahkan dari admin Odoo.
        </p>
      </div>

    </div>
  </Layout>
</template>

<script setup>
import { onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useDashboardStore } from '../store/dashboard';
import DashboardItem from '../components/DashboardItem.vue';
import Layout from '../components/layout/Layout.vue';
import DashboardKpiWrapper from '../components/DashboardKpiWrapper.vue';

const route = useRoute();
const store = useDashboardStore();

const loadDashboardContent = () => {
  const slug = route.params.slug;
  if (slug) {
    store.fetchDashboardLayout(slug);
  }
};

onMounted(() => {
  loadDashboardContent();
});

// AMATI PERUBAHAN URL SLUG
// Jika user mengklik menu lain di sidebar (misal dari /page/sales ke /page/mining),
// fungsi ini akan reaktif mendeteksi perubahan parameter slug lalu menarik layout baru.
watch(() => route.params.slug, () => {
  loadDashboardContent();
});
</script>

<style scoped>
.animate-page-in {
  animation: pageIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes pageIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>