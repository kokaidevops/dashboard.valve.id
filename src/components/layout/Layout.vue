<script setup>
import Sidebar from "./Sidebar.vue";
import Header from "./Header.vue";

</script>

<template>
  <div class="flex bg-slate-50 min-h-screen">
    <Sidebar />

    <main class="flex-1 transition-all duration-300 min-w-0">
      <Header />

      <section class="p-5 lg:p-8">
        <slot />
      </section>
    </main>
  </div>
</template>
