import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '../api'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import ListView from '../views/ListView.vue'
import FormView from '../views/FormView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: LoginView },
    { path: '/', component: DashboardView },
    { path: '/requests', component: ListView },
    { path: '/new', component: FormView, meta: { roles: ['user', 'admin'] } },
    { path: '/edit/:id', component: FormView },
  ],
})

// ตรวจสิทธิ์ก่อนเข้าแต่ละหน้า
router.beforeEach((to) => {
  if (to.path !== '/login' && !auth.token) return '/login'
  if (to.meta.roles && !to.meta.roles.includes(auth.user.role)) return '/'
})

export default router
