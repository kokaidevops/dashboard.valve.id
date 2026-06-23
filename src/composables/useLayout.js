import { defineStore } from 'pinia';
import { ref } from "vue";

export const useLayoutStore = defineStore('layout', () => {
  const sidebarCollapsed = ref(false);
  const mobileSidebarOpen = ref(false);

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value;
  };

  function toggleMobileSidebar() {
    mobileSidebarOpen.value = !mobileSidebarOpen.value;
  };

  function closeMobileSidebar() {
    mobileSidebarOpen.value = false;
  };

  return {
    sidebarCollapsed, mobileSidebarOpen,
    toggleSidebar, toggleMobileSidebar, closeMobileSidebar
  };

});