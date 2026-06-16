import { createApp } from 'vue';
import { createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import VueApexCharts from "vue3-apexcharts";
import Aura from '@primeuix/themes/aura';

import App from './App.vue';
import router from './router';

import 'primeicons/primeicons.css';
import './assets/main.css';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            darkModeSelector: '.dark',
        }
    },
    ripple: true 
});
app.use(VueApexCharts);

app.mount('#app');