import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../store/auth';
import DashboardView from '../views/DashboardView.vue';
import LoginView from '../views/LoginView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { hideSidebar: true }
    },
    {
      path: '/',
      redirect: '/page/home'
    },
    {
      path: '/page/:slug',
      name: 'dashboard',
      component: DashboardView
    }
  ]
});

// Pengecekan Pintu Depan (Navigation Guard)
router.beforeEach((to) => {
  const authStore = useAuthStore();

  // Jika mencoba ke halaman login padahal sudah login, kembalikan ke utama
  if (to.name === 'login' && authStore.isAuthenticated) {
    return { path: '/' };
  }

});

export default router;