<template>
  <RouterView />
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import { useAuthStore } from './store/auth';

const authStore = useAuthStore();

const updateActivity = () => {
  if (authStore.token) {
    authStore.refreshActivity();
  }
};

onMounted(() => {
  window.addEventListener('click', updateActivity);
  window.addEventListener('keydown', updateActivity);
  window.addEventListener('mousemove', updateActivity);
});

onUnmounted(() => {
  window.removeEventListener('click', updateActivity);
  window.removeEventListener('keydown', updateActivity);
  window.removeEventListener('mousemove', updateActivity);
});
</script>