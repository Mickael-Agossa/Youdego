<template>
  <div class="bg-white min-h-screen pb-24">
    <!-- Header -->
    <div class="flex items-center justify-between px-4 pt-4">
      <div class="flex items-center space-x-3">
        <img
          src="https://vaybe.tech/_nuxt/product_designer_homme_sans_logo.DPf1CHnK.png"
          alt="avatar"
          class="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <h2 class="font-semibold text-gray-800 text-sm">Marius AGOSSA</h2>
          <p class="text-gray-500 text-xs flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c.5304 0 1.0391-.2107 1.4142-.5858C13.7893 10.0391 14 9.5304 14 9s-.2107-1.0391-.5858-1.4142C13.0391 7.2107 12.5304 7 12 7s-1.0391.2107-1.4142.5858C10.2107 7.9609 10 8.4696 10 9s.2107 1.0391.5858 1.4142C10.9609 10.7893 11.4696 11 12 11z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 22s8-4.5 8-11a8 8 0 10-16 0c0 6.5 8 11 8 11z" />
            </svg>
            Abomey-calavi
          </p>
        </div>
      </div>

      <div class="relative">
        <button class="relative">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C8.67 6.165 8 7.388 8 9v5.159c0 .538-.214 1.055-.595 1.436L6 17h9z" />
          </svg>
          <span class="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-3 h-3 flex items-center justify-center"></span>
        </button>
      </div>
    </div>

    <!-- Wallet -->
    <div class="px-4 mt-4">
      <div class="bg-red-700 rounded-2xl text-white p-4 flex justify-between items-center">
        <div>
          <p class="text-sm opacity-90">Porte-feuille</p>
          <p class="text-2xl font-semibold">10.000 FCFA</p>
        </div>
        <button class="bg-white/20 p-2 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Search Section -->
    <div class="px-4 mt-6">
      <p class="font-semibold text-gray-800 text-sm mb-2">Suivre Votre colis</p>
      <div class="flex items-center space-x-2">
        <input
          type="text"
          placeholder="Rechercher un colis"
          class="flex-1 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
        />
        <button class="bg-red-600 p-3 rounded-xl">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Categories -->
    <div class="flex justify-between px-4 mt-6">
      <div class="flex flex-col items-center">
        <div class="bg-orange-100 p-3 rounded-2xl">
          <img src="https://cdn-icons-png.flaticon.com/512/1548/1548439.png" class="w-8 h-8" />
        </div>
        <p class="text-xs mt-1">Colis</p>
      </div>

      <div class="flex flex-col items-center">
        <div class="bg-orange-100 p-3 rounded-2xl">
          <img src="https://cdn-icons-png.flaticon.com/512/3075/3075977.png" class="w-8 h-8" />
        </div>
        <p class="text-xs mt-1">Repas</p>
      </div>

      <div class="flex flex-col items-center">
        <div class="bg-orange-100 p-3 rounded-2xl">
          <img src="https://cdn-icons-png.flaticon.com/512/3081/3081559.png" class="w-8 h-8" />
        </div>
        <p class="text-xs mt-1">Courses</p>
      </div>

      <div class="flex flex-col items-center">
        <div class="bg-orange-100 p-3 rounded-2xl">
          <img src="https://cdn-icons-png.flaticon.com/512/942/942748.png" class="w-8 h-8" />
        </div>
        <p class="text-xs mt-1">Documents</p>
      </div>
    </div>

    <!-- Last Deliveries -->
    <div class="px-4 mt-6">
      <div class="flex justify-between items-center">
        <h3 class="font-semibold text-gray-800 text-sm">Dernières livraisons</h3>
        <a href="#" class="text-red-600 text-xs font-semibold">Voir tout</a>
      </div>

      <!-- Delivery Card -->
      <div class="mt-3 space-y-3">
        <div class="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-3">
          <div>
            <span class="bg-yellow-100 text-yellow-600 text-xs px-2 py-1 rounded-full">Suivre</span>
            <p class="text-sm font-semibold mt-1">Colis</p>
            <p class="text-xs text-gray-500">Code de suivi : #68329532-4526YE</p>
            <p class="text-xs text-gray-400">Date : 29/10/2025</p>
          </div>
          <img src="https://cdn-icons-png.flaticon.com/512/1548/1548439.png" class="w-10 h-10" />
        </div>

        <div class="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-3">
          <div>
            <span class="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full">Livré</span>
            <p class="text-sm font-semibold mt-1">Colis</p>
            <p class="text-xs text-gray-500">Code de suivi : #68329532-4526YE</p>
            <p class="text-xs text-gray-400">Date : 29/10/2025</p>
          </div>
          <img src="https://cdn-icons-png.flaticon.com/512/1548/1548439.png" class="w-10 h-10" />
        </div>
      </div>
    </div>
  </div>
    <BottomNav />
</template>

<script setup>
import BottomNav from '@/components/BottomNav.vue'
// Aucun script spécifique pour l'instant
</script>
