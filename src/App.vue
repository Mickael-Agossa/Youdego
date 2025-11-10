<template>
  <div>
    <div v-if="!isMobile" class="min-h-screen flex items-center justify-center bg-gray-50 text-center p-8">
      <div class="max-w-md">
        <h1 class="text-2xl font-semibold text-gray-800 mb-4">Application mobile uniquement</h1>
        <p class="text-gray-600 mb-2">Veuillez ouvrir cette application sur un téléphone ou une tablette.</p>
        <p class="text-xs text-gray-400">Largeur détectée: {{ width }}px</p>
      </div>
    </div>
    <router-view v-else />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

// Seuil de largeur maximum pour considérer l'appareil comme mobile/tablette
const MOBILE_MAX_WIDTH = 900
const width = ref<number>(window.innerWidth)
const isMobile = ref<boolean>(width.value <= MOBILE_MAX_WIDTH)

function update() {
  width.value = window.innerWidth
  isMobile.value = width.value <= MOBILE_MAX_WIDTH
}

onMounted(() => {
  update()
  window.addEventListener('resize', update)
})

onUnmounted(() => {
  window.removeEventListener('resize', update)
})
</script>

<style>
.parent::-webkit-scrollbar {
  width: 0%;
  height: 0%;
}
</style>
