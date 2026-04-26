import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'
import i18n from './plugins/i18n'
import { useAuthStore } from '@/modules/auth/stores/authStore'

const startApp = async () => {
  const app = createApp(App)
  const pinia = createPinia()

  app.use(pinia)
  app.use(router)
  app.use(i18n)

  const authStore = useAuthStore()
  await authStore.initialize()

  app.mount('#app')
}

startApp()
