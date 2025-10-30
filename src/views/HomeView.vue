<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="text-center max-w-2xl" v-if="!started">
      <!-- Logo minimaliste -->
      <div class="mb-10 flex justify-center">
        <div class="h-20 w-20 rounded-lg bg-[#014AA9] flex items-center justify-center shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
      </div>
      
      <h1 class="text-4xl font-light text-gray-800 mb-6 tracking-tight">
        Welcome to <span class="font-medium text-[#014AA9]">Vaybe</span>
      </h1>
      
      <div class="border-t border-gray-200 w-24 mx-auto mb-8"></div>
      
      <p class="text-lg text-gray-600 mb-10 leading-relaxed max-w-md mx-auto">
        This is a simple Vue.js application crafted by 
        <a href="https://vaybe.tech" class="text-[#014AA9] font-medium hover:underline decoration-[#014AA9]/30">
          Vaybe
        </a>.
      </p>
      
      <div class="mt-12 space-x-4">
        <button 
          @click="started = true"
          class="px-6 py-2.5 rounded-md bg-[#014AA9] text-white font-medium hover:bg-[#013a87] transition-colors duration-200 shadow-sm">
          Get Started
        </button>
        
        <button class="px-6 py-2.5 rounded-md border border-gray-300 text-gray-700 font-medium hover:bg-gray-100/50 transition-colors duration-200">
          Learn More
        </button>
      </div>
      
      <!-- Détails subtils -->
      <div class="absolute bottom-8 left-0 right-0 text-center">
        <p class="text-xs text-gray-400 tracking-wide">VAYBE - Innovation & Technologie © since 2023</p>
      </div>
    </div>

    <!-- Contenu vide après avoir cliqué -->
    <div v-else>
      <!-- Vous pouvez ajouter ici un nouveau contenu si besoin -->
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const started = ref(false)
</script>

<style>
/* Animation subtile au hover des boutons */
button {
  transition-property: color, background-color, border-color, transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

button:hover {
  transform: translateY(-1px);
}
</style>