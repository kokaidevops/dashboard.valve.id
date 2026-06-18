<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-100 px-4">
    
    <div class="dashboard-card p-8 w-full max-w-md">
      
      <div class="text-center space-y-3 mb-4">
        <div class="space-y-1">
          <h2 class="text-3xl font-bold tracking-tight">
            Kokai Analytics
          </h2>
          <p class="text-xs text-slate-500">
            Masuk dengan kredensial sistem ERP Odoo Anda
          </p>
        </div>
      </div>

      <div 
        v-if="errorMessage" 
        class="bg-rose-50 border border-rose-100 text-rose-600 p-3.5 rounded-xl text-xs flex items-center gap-2.5 animate-fade-in mb-4"
      >
        <i class="pi pi-exclamation-circle text-sm"></i>
        <span>{{ errorMessage }}</span>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        
        <div class="space-y-1.5">
          <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Username / Email Odoo
          </label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <i class="pi pi-user text-xs"></i>
            </span>
            <input 
              v-model="username" 
              type="text" 
              required
              :disabled="loading"
              class="w-full pl-9 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm transition-all focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 disabled:opacity-60"
              placeholder="contoh: budi.admin@valve.id"
            />
          </div>
        </div>

        <div class="space-y-1.5">
          <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Kata Sandi (Password)
          </label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <i class="pi pi-lock text-xs"></i>
            </span>
            <input 
              v-model="password" 
              type="password" 
              required
              :disabled="loading"
              class="w-full pl-9 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm transition-all focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 disabled:opacity-60"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button 
          type="submit" 
          :disabled="loading"
          class="w-full bg-indigo-500 hover:bg-indigo-600 active:scale-[0.99] text-white font-semibold py-3 rounded-xl text-sm transition-all shadow-md shadow-brand-500/10 disabled:opacity-60 flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:cursor-not-allowed"
        >
          <i v-if="loading" class="pi pi-spin pi-spinner text-xs"></i>
          <span>{{ loading ? 'Mengautentikasi ke Odoo...' : 'Masuk Ke Dashboard' }}</span>
        </button>
        <button 
          @click="backToHome" 
          class="w-full items-center gap-1.5 text-[11px] font-semibold text-slate-500 hover:text-slate-600 px-3 py-2 rounded-xl hover:bg-slate-500/5 transition-all cursor-pointer"
        >
          Kembali ke Dashboard
        </button>
      </form>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';
import { useDashboardStore } from '../store/dashboard';

const username = ref('');
const password = ref('');
const loading = ref(false);
const errorMessage = ref('');

const router = useRouter();
const authStore = useAuthStore();
const dashboardStore = useDashboardStore();

const handleSubmit = () => {
  loading.value = true;
  errorMessage.value = '';

  // Menembak sinyal otentikasi aman ke Node.js Bridge Server
  dashboardStore.socket.emit('authenticate_user', {
    username: username.value,
    password: password.value
  }, (response) => {
    loading.value = false;
    
    if (response.success) {
      // Simpan sesi ke Pinia & LocalStorage dengan enkapsulasi waktu aktivitas
      console.log(response)
      authStore.login(
        { id: response.user.id, name: response.user.name, email: response.user.email },
        response.token
      );
      
      // Ambil ulang daftar halaman di sidebar agar rute private terbuka sesuai hak akses baru
      dashboardStore.fetchSidebarPages();
      
      // Arahkan user langsung ke halaman utama/dashboard operasional pertama
      router.push('/');
    } else {
      // Tampilkan pesan error yang dikembalikan langsung dari kegagalan auth Odoo RPC
      errorMessage.value = response.message || 'Kombinasi username atau password salah.';
    }
  });
};

const backToHome = () => {
  router.push('/');
}
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.2s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>