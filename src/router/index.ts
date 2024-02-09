import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/HomePage.vue'
import EventList from '../pages/EventList.vue'
import EventDetail from '../pages/EventDetailPage.vue'
import EventForm from '../pages/EventFormPage.vue'
import GroupList from '../pages/GroupList.vue'
import SettingsPage from '../pages/SettingsPage.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  {
    path: '/events',
    name: 'events',
    component: EventList
  },
  // {
  //   path: '/events/new',
  //   name: 'create event',
  //   component: EventForm
  // },
  {
    path: '/events/:id',
    name: 'EventDetail',
    component: EventDetail,
    meta: { headerTitle: 'Event Detail' }
  }
  // {
  //   path: '/groups',
  //   name: 'groups',
  //   component: GroupList
  // },
  // {
  //   path: '/settings/ical',
  //   name: 'ical',
  //   component: SettingsPage
  // }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
