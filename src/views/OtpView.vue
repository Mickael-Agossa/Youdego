<template>
  <div class="min-h-screen px-6 pt-10 pb-8 flex flex-col">
    <h1 class="text-xl font-semibold text-gray-900 mb-6">Vérification</h1>

    <p class="text-[15px] text-gray-600 mb-6">
      Un code à 6 chiffres a été envoyé sur WhatsApp au <strong>+229 {{ maskedPhone }}</strong>.
      Il est valable 5 minutes.
    </p>

    <form @submit.prevent="verify" class="space-y-6">
      <div class="flex items-center justify-between space-x-2">
        <input v-for="i in 6" :key="i" ref="otpRefs[i-1]" v-model="otp[i-1]" maxlength="1"
          inputmode="numeric" pattern="[0-9]*" type="text"
          class="w-12 h-12 text-center text-lg rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#8C0004]"
          @input="onInput(i-1)" @keydown.backspace.prevent="onBackspace(i-1)" />
      </div>

      <div class="text-sm text-gray-500" v-if="remaining > 0">
        Code expire dans <span class="font-medium">{{ mm }}:{{ ss }}</span>
      </div>
      <div class="text-sm" v-else>
        <button :disabled="!canResend" type="button" @click="resend" class="text-[#8C0004] disabled:opacity-40">Renvoyer le code</button>
      </div>

      <button type="submit" class="w-full rounded-lg bg-[#8C0004] text-white py-3 text-sm font-medium">Vérifier</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const store = useAuthStore()
const router = useRouter()

const otp = ref<string[]>(Array(6).fill(''))
const otpRefs = Array.from({ length: 6 }, () => ref<HTMLInputElement | null>(null))

const remaining = computed(() => store.remainingSeconds)
const canResend = computed(() => store.canResend)
const mm = computed(() => String(Math.floor(remaining.value / 60)).padStart(2, '0'))
const ss = computed(() => String(remaining.value % 60).padStart(2, '0'))
const maskedPhone = computed(() => store.phoneLocal ? store.phoneLocal.replace(/^(\d{3})\d{4}(\d{3})$/, '$1••••$2') : '')

function onInput(idx: number) {
  const val = otp.value[idx]
  if (/^\d$/.test(val)) {
    if (idx < 5) otpRefs[idx + 1].value?.focus()
  } else {
    otp.value[idx] = ''
  }
}
function onBackspace(idx: number) {
  if (otp.value[idx]) {
    otp.value[idx] = ''
  } else if (idx > 0) {
    otpRefs[idx - 1].value?.focus()
  }
}

function resend() {
  if (!canResend.value) return
  store.sendCode()
}

function verify() {
  const code = otp.value.join('')
  if (/^\d{6}$/.test(code)) {
    // plus tard: axios pour vérifier
    router.push('/dashboard')
  }
}

onMounted(() => {
  otpRefs[0].value?.focus()
})
</script>
