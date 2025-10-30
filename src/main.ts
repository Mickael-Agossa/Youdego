import { createApp } from 'vue'
import { createPinia } from 'pinia' // Importez createPinia
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import './assets/style.css'

// Créez l'instance Pinia
const pinia = createPinia()
const app = createApp(App)

// Utilisez Pinia avant le router
app.use(pinia)
app.use(router)

app.mount('#app')