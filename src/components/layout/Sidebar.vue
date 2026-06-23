<template>
  <div v-if="layoutStore.mobileSidebarOpen" class="fixed inset-0 bg-black/30 z-40 lg:hidden" @click="layoutStore.closeMobileSidebar" />

  <aside 
    class="fixed lg:relative z-50 bg-white border-r border-slate-200 min-h-screen px-5 py-7 flex flex-col transition-all duration-300"
    :class="[
      layoutStore.mobileSidebarOpen
      ? 'translate-x-0'
      : '-translate-x-full lg:translate-x-0',
      layoutStore.sidebarCollapsed ? 'w-24' : 'w-70',
    ]"
  >
    
    <div class="mb-10">
      <h1 class="font-bold text-slate-900" :class="layoutStore.sidebarCollapsed ? 'text-lg' : 'text-2xl'">
        KIA<span class="text-indigo-600"> {{ layoutStore.sidebarCollapsed ? ' Dash' : ' Dashboard' }} </span>
      </h1>

      <p v-if="!layoutStore.sidebarCollapsed" class="text-sm text-slate-400 mt-1">
        Modern ERP Dashboard
      </p>
    </div>

    <nav class="grow space-y-1.5 overflow-y-auto">
      <div class="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-2">
        Analitis Menu
      </div>
      <div v-if="store.pagesList.length === 0" class="px-3 py-4 text-xs text-slate-600 italic">
        Tidak ada dashboard tersedia
      </div>

      <router-link 
        v-for="page in store.pagesList" 
        :key="page.id"
        :to="'/page/' + page.slug"
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        active-class="bg-brand-500/5 text-brand-600 font-semibold border-l-1 border-brand-500 rounded-l-none!"
      >
        <i :class="['pi', page.icon, 'text-xs text-slate-400 group-hover:text-brand-500 transition-colors']"></i>
        
        <span  v-if="!layoutStore.sidebarCollapsed" class="truncate">{{ page.name }}</span>

        <span 
          v-if="page.access_type === 'private'" 
          class="ml-auto text-[10px] bg-slate-100 group-hover:bg-slate-200 text-slate-400 px-1.5 py-0.5 rounded-md flex items-center gap-1 transition-colors"
          title="Halaman Terproteksi Privat"
        >
          <i class="pi pi-lock text-[8px]"></i> Privat
        </span>
      </router-link>
    </nav>

    <div class="mt-auto flex justify-between items-center gap-3">
      <div v-if="!layoutStore.sidebarCollapsed">
        <p class="text-xs text-slate-500">PT. Kokai Indo Abadi</p>
      </div>
      <button 
        v-if="authStore.isAuthenticated"
        @click="handleLogout" 
        class="flex items-center gap-1.5 text-[11px] font-semibold text-rose-500 hover:text-rose-600 px-3 py-2 rounded-xl hover:bg-rose-500/5 transition-all cursor-pointer"
      >
        <i class="pi pi-sign-out text-[10px]"></i> Keluar
      </button>
    </div>
  </aside>
</template>

<script setup>
import { onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useDashboardStore } from '../../store/dashboard';
import { useAuthStore } from '../../store/auth';
import { useLayoutStore } from '../../composables/useLayout'

const store = useDashboardStore();
const authStore = useAuthStore();
const router = useRouter();
const layoutStore = useLayoutStore();

onMounted(() => {
  store.fetchSidebarPages();
});

watch(() => authStore.isAuthenticated, () => {
  store.fetchSidebarPages();
});

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>