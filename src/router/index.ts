import { createRouter, createWebHistory } from "vue-router";
import Home from "../pages/HomePage.vue";
import EventDetail from "../pages/EventDetailPage.vue";

const routes = [
  { path: "/", name: "Home", component: Home },
  {
    path: "/events/:id",
    name: "EventDetail",
    component: EventDetail,
    meta: { headerTitle: "Event Detail" },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
