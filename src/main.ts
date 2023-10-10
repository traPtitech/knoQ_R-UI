import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { setupWorker } from 'msw'
import { userHandlers } from './features/user/mock'
import { eventHandlers } from './features/event/mock'
import { groupHandlers } from './features/group/mock'

const app = createApp(App)
app.use(router)
const pinia = createPinia()
app.use(pinia)
if (process.env.NODE_ENV === 'development') {
  const handlers = [userHandlers, eventHandlers, groupHandlers].flat()
  const worker = setupWorker(...handlers)
  worker.start()
}
app.mount('#app')
