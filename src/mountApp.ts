import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from '/@/App.vue'
import router from '/@/router'

export const mountApp = (): void => {
  createApp(App).use(createPinia()).use(router).mount('#app')
}
