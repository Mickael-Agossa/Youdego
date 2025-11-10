<template>
  <div class="min-h-screen px-6 pt-10 pb-8 flex flex-col">
    <h1 class="text-xl font-semibold text-gray-900 mb-6">Entrez votre numéro WhatsApp</h1>
    <p class="text-[15px] text-gray-600 mb-6">
        Entrez votre numéro de téléphone pour vous connecter ou créer un nouveau compte
    </p>
    <form @submit.prevent="handleSubmit" class="space-y-5">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Numéro WhatsApp <span class="text-red-800 font-bold">*</span></label>
        <div class="flex items-center space-x-3">
          <div class="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 36 36"><!-- Icon from Twitter Emoji by Twitter - https://creativecommons.org/licenses/by/4.0/ --><path fill="#FCD116" d="M32 5H14v13h22V9a4 4 0 0 0-4-4"/><path fill="#E8112D" d="M14 31h18a4 4 0 0 0 4-4v-9H14z"/><path fill="#008751" d="M14 5H4a4 4 0 0 0-4 4v18a4 4 0 0 0 4 4h10z"/></svg>
          </div>
          <input v-model="phoneLocal" maxlength="10" pattern="0[0-9]{9}" placeholder="0XXXXXXXXX" required class="flex-1 w-[calc(100%-58px)] rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8C0004]" />
        </div>
        <p v-if="phoneLocal && !validPhone" class="mt-1 text-xs text-red-600">Format invalide (ex: 0XXXXXXXXX).</p>
      </div>
      <button :disabled="!validPhone" type="submit" class="w-full rounded-lg bg-[#8C0004] text-white py-3 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed">Continuer</button>
    </form>
    <div class="mt-6 text-center text-sm">
        Pas de compte ? 
      <router-link to="/signup" class="text-[#8C0004] hover:underline">Inscription</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const router = useRouter()
const store = useAuthStore()

const phoneLocal = ref('')
const validPhone = computed(() => /^0\d{9}$/.test(phoneLocal.value))

function handleSubmit() {
  if (!validPhone.value) return
  store.startLogin(phoneLocal.value)
  router.push('/otp')
}
</script>
