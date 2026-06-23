<template>
  <div @click="$emit('card-click')" class="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between h-35 transition-all duration-300 relative overflow-hidden">
    
    <div class="flex items-center justify-between shrink-0">
      <span class="text-xs font-bold text-slate-400 uppercase tracking-wider truncate max-w-[80%]">
        {{ title }}
      </span>
      <div class="flex items-center justify-center gap-1">
        <div v-if="hasGoal" :class="[
          'w-14 h-8 text-xs rounded-xl flex items-center justify-center border transition-colors',
          achievement < 75
          ? 'bg-rose-50/60 border-rose-100/70 text-rose-600'
          : 'bg-teal-50/60 border-teal-100/70 text-teal-600' 
        ]">
          {{ DataFormatter.autoFormat(':percentage', achievement, false) }}
        </div>
        <div :class="[
          'w-8 h-8 rounded-xl flex items-center justify-center border transition-colors',
          isPositive 
          ? 'bg-teal-50/60 border-teal-100/70 text-teal-600' 
          : 'bg-rose-50/60 border-rose-100/70 text-rose-600'
        ]">
          <i :class="['pi', icon, 'text-xs']"></i>
        </div>
      </div>
    </div>

    <div class="my-2 min-w-0">
      <h2 class="text-xl sm:text-2xl font-black text-slate-800 tracking-tight truncate">
        {{ DataFormatter.autoFormat(label, value, false) }}
      </h2>
    </div>

    <div v-if="percentage !== 0" class="flex items-center gap-1.5 text-[11px] font-semibold shrink-0">
      <span :class="[
        'flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg border',
        isPositive 
          ? 'bg-teal-500/10 border-teal-500/20 text-teal-600' 
          : 'bg-rose-500/10 border-rose-500/20 text-rose-600'
      ]">
        <i :class="['pi', isPositive ? 'pi-arrow-up-right' : 'pi-arrow-down-left', 'text-[9px]']"></i>
        {{ Math.abs(percentage) }}%
      </span>
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue';
import { DataFormatter } from '../utils/formatter.js';
defineEmits(['card-click']);

const props = defineProps({
  title: { type: String, default: 'KPI Title' },
  label: { type: String, default: 'Label' },
  value: { type: [Number, String], default: 0 },
  percentage: { type: Number, default: 0 },
  achievement: { type: Number, default: 0 },
  hasGoal: { type: Boolean, default: false },
  icon: { type: String, default: 'pi-chart-line' },
});

const isPositive = computed(() => props.percentage >= 0);
</script>