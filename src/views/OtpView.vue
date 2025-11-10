<template>
  <div class="min-h-screen px-6 pt-10 pb-8 flex flex-col">
    <h1 class="text-xl font-semibold text-gray-900 mb-6">Vérification</h1>

    <p class="text-[15px] text-gray-600 mb-6">
      Un code à 6 chiffres a été envoyé sur WhatsApp au <strong>+229 {{ maskedPhone }}</strong>.
      Il est valable 5 minutes.
    </p>

    <form @submit.prevent="verify" class="space-y-6">
      <div class="flex items-center justify-between space-x-2">
        <input
          v-for="(_, i) in 6"
          :key="i"
          :value="otp[i]"
          @input="handleInput($event, i)"
          @keydown="onKeydown($event, i)"
          @paste="onPaste($event, i)"
          inputmode="numeric"
          autocomplete="one-time-code"
          pattern="[0-9]*"
          type="tel"
          class="w-12 h-12 text-center text-lg rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#8C0004]"
          :ref="el => setOtpRef(el, i)"
          maxlength="1"
        />
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
const otpRefs = ref<Array<HTMLInputElement | null>>([])

function setOtpRef(el: any, idx: number) {
  otpRefs.value[idx] = (el as HTMLInputElement) || null
}

const remaining = computed(() => store.remainingSeconds)
const canResend = computed(() => store.canResend)
const mm = computed(() => String(Math.floor(remaining.value / 60)).padStart(2, '0'))
const ss = computed(() => String(remaining.value % 60).padStart(2, '0'))
const maskedPhone = computed(() => store.phoneLocal ? store.phoneLocal.replace(/^(\d{3})\d{4}(\d{3})$/, '$1••••$2') : '')

function focusIndex(i: number) {
  const el = otpRefs.value[i]
  el?.focus()
  el?.select()
}

function distribute(digits: string) {
  const ds = digits.replace(/\D/g, '').slice(0, 6)
  for (let i = 0; i < 6; i++) {
    otp.value[i] = ds[i] || ''
  }
  const firstEmpty = otp.value.findIndex(d => !d)
  focusIndex(firstEmpty === -1 ? 5 : firstEmpty)
}

function handleInput(e: Event, idx: number) {
  const target = e.target as HTMLInputElement
  const val = (target.value || '').replace(/\D/g, '')

  // Collage rapide (plusieurs chiffres d'un coup)
  if (val.length > 1) {
    distribute(val)
    return
  }

  otp.value[idx] = val
  if (val && idx < 5) {
    focusIndex(idx + 1)
  }
}

function onKeydown(e: KeyboardEvent, idx: number) {
  const key = e.key
  if (key === 'Backspace') {
    if (otp.value[idx]) {
      otp.value[idx] = ''
    } else if (idx > 0) {
      otp.value[idx - 1] = ''
      focusIndex(idx - 1)
    }
    e.preventDefault()
  } else if (key === 'ArrowLeft' && idx > 0) {
    focusIndex(idx - 1)
    e.preventDefault()
  } else if (key === 'ArrowRight' && idx < 5) {
    focusIndex(idx + 1)
    e.preventDefault()
  }
}

function onPaste(e: ClipboardEvent, _idx: number) {
  const pasted = e.clipboardData?.getData('text') || ''
  const digits = pasted.replace(/\D/g, '')
  if (!digits) return
  e.preventDefault()
  distribute(digits)
}

function resend() {
  if (!canResend.value) return
  store.sendCode()
  otp.value = Array(6).fill('')
  focusIndex(0)
}

function verify() {
  const code = otp.value.join('')
  if (/^\d{6}$/.test(code)) {
    router.push('/dashboard')
  }
}

onMounted(() => {
  focusIndex(0)
})
</script>
