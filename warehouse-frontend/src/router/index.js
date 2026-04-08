import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { public: true },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
    },
    {
      path: '/products',
      name: 'products',
      component: () => import('@/views/ProductsView.vue'),
    },
    {
      path: '/suppliers',
      name: 'suppliers',
      component: () => import('@/views/SuppliersView.vue'),
    },
    {
      path: '/customers',
      name: 'customers',
      component: () => import('@/views/CustomersView.vue'),
    },
  ],
})

router.beforeEach((to) => {
  if (to.meta.public) return true
  const auth = useAuthStore()
  if (!auth.isAuthed) return { name: 'login', query: { next: to.fullPath } }
  return true
})

export default router
