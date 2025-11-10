/* eslint-disable no-console */

import { register } from 'register-service-worker'

if (process.env.NODE_ENV === 'production') {
  register(`${process.env.BASE_URL}sw.js`, {
    ready () {
      console.log('PWA prête (cache).')
    },
    registered (registration) {
      console.log('Service worker enregistré.')
      // Vérification périodique des updates
      setInterval(() => {
        registration.update()
      }, 1000 * 60 * 5) // toutes les 5 minutes
    },
    cached () {
      console.log('Contenu mis en cache pour usage offline.')
    },
    updatefound () {
      console.log('Nouveau contenu en cours de téléchargement…')
    },
    updated (registration) {
      console.log('Nouveau contenu disponible. Activation immédiate…')
      // Force activation immédiate
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      }
      // Rechargement de la page pour servir la nouvelle version
      window.location.reload()
    },
    offline () {
      console.log('Connexion internet absente, mode hors-ligne.')
    },
    error (error) {
      console.error('Erreur d\'enregistrement SW:', error)
    }
  })
}

// Ecoute du message skipWaiting
navigator.serviceWorker?.addEventListener('controllerchange', () => {
  console.log('Service worker actif mis à jour.')
})
