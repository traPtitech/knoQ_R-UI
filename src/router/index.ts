import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import Home from '../pages/HomePage.vue'
import EventList from '../pages/EventList.vue'
import EventDetail from '../pages/EventDetail.vue'
import CreateEvent from "/@/pages/CreateEvent.vue"
import GroupList from '../pages/GroupList.vue'
import MyPage from '../pages/MyPage.vue'

const routes: RouteRecordRaw[] = [
    { path: '/', name: 'Home', component: Home },
    {
        path: '/events',
        name: 'events',
        component: EventList
    },
    {
        path: '/events/new',
        name: 'create event',
        component: CreateEvent
    },
    {
        path: '/events/:id',
        name: 'EventDetail',
        component: EventDetail,
        meta: { headerTitle: 'Event Detail' }
    },
    {
      path: '/groups',
      name: 'groups',
      component: GroupList
    },
    {
        path: '/me',
        name: 'MyPage',
        component: MyPage
    },
    {
        path: '/calendar',
        name: 'Calendar',
        component: () => import('../pages/CalendarPage.vue')
    },
    {
        path: "/callback",
        name: "Callback",
        redirect: "/"
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
