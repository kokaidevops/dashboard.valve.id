<template>
  <header class="bg-white border-b border-slate-200 px-6 lg:px-8 py-5 flex justify-between items-center">
    <div class="flex items-center gap-4">
      <button class="lg:hidden w-11 h-11 rounded-2xl bg-slate-100">
        <i class="pi pi-bars" />
      </button>

      <button class="hidden lg:flex w-11 h-11 rounded-2xl bg-slate-100 items-center justify-center"
        >
        <i class="pi pi-angle-left" />
      </button>

      <div>
        <h2 class="text-2xl font-bold text-slate-800 tracking-tight">
          {{ dashboardStore.currentPageName || 'Memuat...' }}
        </h2>
        <p class="page-subtitle">Welcome back.</p>
      </div>
    </div>
  
    <div class="flex items-center gap-4">
      <router-link 
        v-if="!authStore.isAuthenticated" 
        to="/login"
        class="bg-brand-500 hover:bg-brand-600 text-slate-900 font-medium px-4 py-2 rounded-lg transition-all flex items-center gap-2"
      >
        <i class="pi pi-sign-in text-[10px]"></i> Login
      </router-link>

      <div v-else class="flex items-center gap-2.5">
        <div class="text-right hidden sm:block">
          <p class="text-xs font-semibold text-slate-700 dark:text-slate-200">{{ authStore.user?.name }}</p>
          <p class="text-[10px] text-slate-400">Odoo User ID: {{ authStore.user?.id }}</p>
        </div>
        <div class="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
          <i class="pi pi-user text-xs"></i>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useAuthStore } from '../../store/auth';
import { useDashboardStore } from '../../store/dashboard';

const authStore = useAuthStore();
const dashboardStore = useDashboardStore();
</script>