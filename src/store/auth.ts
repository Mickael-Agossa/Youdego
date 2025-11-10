import { defineStore } from 'pinia'

export type AuthFlow = 'signup' | 'login' | null

const FIVE_MIN_MS = 5 * 60 * 1000

export const useAuthStore = defineStore('auth', {
  state: () => ({
    phoneLocal: '' as string, // format local: 0XXXXXXXXX (10 chiffres)
    countryCode: '+229' as string, // Bénin uniquement
    flow: null as AuthFlow,
    codeExpiresAt: null as number | null,
    lastCodeSentAt: null as number | null,
  }),
  getters: {
    // temps restant en secondes
    remainingSeconds: (state) => {
      if (!state.codeExpiresAt) return 0
      const diff = Math.max(0, state.codeExpiresAt - Date.now())
      return Math.floor(diff / 1000)
    },
    canResend: (state): boolean => {
      if (!state.lastCodeSentAt) return true
      return Date.now() - state.lastCodeSentAt >= FIVE_MIN_MS
    },
  },
  actions: {
    startSignup(phoneLocal: string) {
      this.flow = 'signup'
      this.phoneLocal = phoneLocal
      this.sendCode()
    },
    startLogin(phoneLocal: string) {
      this.flow = 'login'
      this.phoneLocal = phoneLocal
      this.sendCode()
    },
    sendCode() {
      const now = Date.now()
      this.lastCodeSentAt = now
      this.codeExpiresAt = now + FIVE_MIN_MS
      // Intégration API plus tard avec axios
    },
    clear() {
      this.flow = null
      this.phoneLocal = ''
      this.codeExpiresAt = null
      this.lastCodeSentAt = null
    }
  }
})
