import { createRouter, createWebHistory } from 'vue-router'
import SVGImporter from '../views/SVGImporter.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: SVGImporter
    }
  ]
})

export default router
