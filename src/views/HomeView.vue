<template>
  <div :class="['min-h-screen relative overflow-hidden', showSplash ? 'bg-[#8C0004]' : 'bg-white']" ref="setContainer">
    <!-- Splash screen -->
    <div v-if="showSplash" class="absolute inset-0 flex items-center justify-center bg-[#8C0004] text-white">
      <div class="flex flex-col items-center">
        <div class="h-[200px] w-[200px] flex items-center justify-center animate-pop">
          <img src="@/assets/img/logo.png" alt="Logo" class="w-[150px] animate-ping-slow" />
        </div>
      </div>
    </div>

    <!-- Onboarding Slides -->
    <div v-else class="min-h-screen flex flex-col" ref="setContainer">
      <!-- Header (skip) -->
      <div class="px-5 pt-6 flex justify-end">
        <button @click="finishOnboarding" class="text-sm text-gray-500 hover:text-gray-700">Passer</button>
      </div>

      <!-- Image / Illustration -->
      <div class="flex-1 flex items-center justify-center px-6">
        <transition name="fade" mode="out-in">
          <img
            :key="current"
            :src="slides[current].img"
            :alt="slides[current].title"
            class="max-h-[60vh] w-full object-contain drop-shadow-sm select-none"
            draggable="false"
          />
        </transition>
      </div>

      <div class="mt-6 flex items-center justify-center space-x-2">
        <button
          v-for="(s, i) in slides"
          :key="i"
          @click="goTo(i)"
          class="h-2.5 rounded-full transition-all"
          :class="i === current ? 'w-6 bg-[#8C0004]' : 'w-2.5 bg-gray-300'"
          aria-label="Aller au slide"
        />
      </div>

      <!-- Texte + Controls -->
      <div class="px-6 pb-8 pt-2">
        <h2 class="text-xl font-semibold text-gray-900 text-center">{{ slides[current].title }}</h2>
        <p class="mt-2 text-sm text-gray-500 text-center max-w-md mx-auto">{{ slides[current].text }}</p>

        <!-- Dots -->
        

        <!-- Navigation -->
        <div class="mt-8">
          <div v-if="current === 0" class="flex justify-center">
            <button
              @click="next"
              class="h-12 w-12 rounded-full bg-[#8C0004] text-white flex items-center justify-center shadow hover:bg-[#8C0004]">
              <span class="sr-only">Suivant</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 12h16m0 0l-6-6m6 6l-6 6"/></svg>
            </button>
          </div>
          <div v-else-if="isLast" class="flex justify-center">
            <button
              @click="finishOnboarding"
              class="px-6 h-12 w-full rounded-[10px] bg-[#8C0004] text-white text-sm font-medium shadow hover:bg-[#8C0004]">
              Commencer
            </button>
          </div>
          <div v-else class="flex items-center justify-between">
            <button
              @click="prev"
              class="h-11 w-11 rounded-full border border-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-50">
              <span class="sr-only">Précédent</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5"><path fill-rule="evenodd" d="M15.78 3.72a.75.75 0 010 1.06L9.56 11l6.22 6.22a.75.75 0 11-1.06 1.06l-6.75-6.75a.75.75 0 010-1.06l6.75-6.75a.75.75 0 011.06 0z" clip-rule="evenodd" /></svg>
            </button>
            <button
              @click="next"
              class="h-11 w-11 rounded-full bg-[#8C0004] text-white flex items-center justify-center shadow hover:bg-[#8C0004]">
              <span class="sr-only">Suivant</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 12h16m0 0l-6-6m6 6l-6 6"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
// Images Figma
import slideA from '@/assets/img/image1.png'
import slideB from '@/assets/img/image2.png'
import slideC from '@/assets/img/image3.png'

const showSplash = ref(true)
const current = ref(0)
const router = useRouter()

const slides = [
  { img: slideA, title: 'Simplifie ta livraison avec Youdégo', text: 'Reçois tes colis rapidement et sans stress. Youdégo te permet de commander, suivre et gérer tes livraisons facilement, avec un service fiable et simple à utiliser.' },
  { img: slideB, title: 'Suis ton livreur en temps réel', text: 'Avec la géolocalisation de Youdégo, tu sais exactement où se trouve ton livreur et combien de temps il lui reste pour arriver. Plus besoin de deviner ou d’appeler, tout se fait directement depuis l’application.' },
  { img: slideC, title: 'Des livraisons rapides, simples et sécurisées', text: 'Commande et reçois tes colis facilement, avec des tarifs clairs et la possibilité de suivre chaque étape. Tout est pensé pour que tes livraisons arrivent en toute sécurité.' },
]

const isLast = computed(() => current.value === slides.length - 1)

function next() {
  if (current.value < slides.length - 1) current.value++
}
function prev() {
  if (current.value > 0) current.value--
}
function goTo(i: number) {
  current.value = i
}

function finishOnboarding() {
  router.push('/signup')
}

const touchStartX = ref<number | null>(null)
const touchEndX = ref<number | null>(null)

function handleTouchStart(e: TouchEvent) {
  touchStartX.value = e.changedTouches[0].screenX
}
function handleTouchEnd(e: TouchEvent) {
  touchEndX.value = e.changedTouches[0].screenX
  if (touchStartX.value === null || touchEndX.value === null) return
  const delta = touchStartX.value - touchEndX.value
  const threshold = 40 // px
  if (delta > threshold) {
    // swipe left -> next
    next()
  } else if (delta < -threshold) {
    // swipe right -> prev
    prev()
  }
  touchStartX.value = null
  touchEndX.value = null
}

const containerEl = ref<HTMLElement | null>(null)

function setContainer(el: HTMLElement | null) {
  containerEl.value = el
}

function setThemeColor(color: string) {
  const meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null
  if (meta) meta.setAttribute('content', color)
}

onMounted(() => {
  // Uniformiser l’entête avec la couleur du splash
  setThemeColor('#8C0004')
  setTimeout(() => {
    // Retour à un header blanc pour le reste de l’app
    setThemeColor('#ffffff')
    showSplash.value = false
  }, 1800)
  if (containerEl.value) {
    containerEl.value.addEventListener('touchstart', handleTouchStart, { passive: true })
    containerEl.value.addEventListener('touchend', handleTouchEnd, { passive: true })
  }
})

onBeforeUnmount(() => {
  // Sécurise le header blanc en quittant cette vue
  setThemeColor('#ffffff')
  if (containerEl.value) {
    containerEl.value.removeEventListener('touchstart', handleTouchStart)
    containerEl.value.removeEventListener('touchend', handleTouchEnd)
  }
})
</script>

<style>
/* Animations */
@keyframes pop {
  0% { transform: scale(0.8); opacity: 0; }
  60% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); }
}
.animate-pop { animation: pop 600ms ease-out both; }

@keyframes ping-slow { 0% { transform: scale(1); opacity: .9 } 70% { transform: scale(1.25); opacity: 0 } 100% { opacity: 0 } }
.animate-ping-slow { animation: ping-slow 2s cubic-bezier(0,0,.2,1) infinite; }

.fade-enter-active, .fade-leave-active { transition: opacity .25s ease, transform .25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(6px); }
</style>