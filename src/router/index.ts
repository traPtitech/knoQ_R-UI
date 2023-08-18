import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/HomePage.vue'
import EventList from '../pages/EventList.vue'
import EventDetail from '../pages/EventDetailPage.vue'
import EventForm from '../pages/EventFormPage.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  {
    path: '/events',
    name: 'events',
    component: EventList
  },
  {
    path: '/events/new',
    name: 'create event',
    component: EventForm
  },
  {
    path: '/events/:id',
    name: 'EventDetail',
    component: EventDetail,
    meta: { headerTitle: 'Event Detail' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
