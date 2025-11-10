<template>
  <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center py-3 px-2 shadow-lg z-50">
    <button
      v-for="item in navItems"
      :key="item.name"
      @click="activeTab = item.name"
      class="flex flex-col items-center justify-center flex-1 mx-1 transition-all duration-300"
    >
      <div
        class="flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300"
        :class="activeTab === item.name 
          ? 'bg-red-50 text-red-600 transform scale-105' 
          : 'text-gray-400 hover:text-gray-600'"
      >
        <Icon 
          :icon="item.icon" 
          class="w-6 h-6 transition-all duration-300"
          :class="activeTab === item.name ? 'scale-110' : ''"
        />
        <span class="text-xs font-medium mt-1 transition-all duration-300">
          {{ item.label }}
        </span>
      </div>
      
      <!-- Point indicateur actif -->
      <div
        v-if="activeTab === item.name"
        class="w-1.5 h-1.5 bg-red-600 rounded-full mt-1 transition-all duration-300"
      ></div>
      <div v-else class="w-1.5 h-1.5 transparent mt-1"></div>
    </button>
  </nav>
</template>

<script setup>
import { ref } from 'vue';
import { Icon } from '@iconify/vue';

const activeTab = ref('Accueil');

const navItems = [
  { 
    name: 'Accueil', 
    label: 'Accueil', 
    icon: 'solar:home-smile-bold' 
  },
  { 
    name: 'Livraison', 
    label: 'Livraison', 
    icon: 'solar:box-bold' 
  },
  { 
    name: 'Adresse', 
    label: 'Adresse', 
    icon: 'solar:map-point-bold' 
  },
  { 
    name: 'Aide', 
    label: 'Aide', 
    icon: 'solar:info-circle-bold' 
  },
  { 
    name: 'Compte', 
    label: 'Compte', 
    icon: 'solar:user-bold' 
  }
];
</script>