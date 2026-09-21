import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { guest: true, title: '登录' },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/auth/RegisterView.vue'),
    meta: { guest: true, title: '注册' },
  },
  {
    path: '/',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/dashboard',
      },
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/views/dashboard/DashboardView.vue'),
        meta: { title: '工作台', menuKey: 'dashboard' },
      },
      {
        path: 'users',
        name: 'users',
        component: () => import('@/views/system/PlaceholderView.vue'),
        meta: {
          title: '用户管理',
          menuKey: 'users',
          placeholder: {
            title: '用户管理',
            description: '后续在此接入用户列表、角色绑定与状态启停。',
          },
        },
      },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('@/views/system/PlaceholderView.vue'),
        meta: {
          title: '系统设置',
          menuKey: 'settings',
          placeholder: {
            title: '系统设置',
            description: '后续在此接入偏好、主题与通知等配置项。',
          },
        },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard',
  },
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  const title = typeof to.meta.title === 'string' ? to.meta.title : 'Morya Admin'
  document.title = `${title} · Morya Admin`

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return {
      name: 'login',
      query: { redirect: to.fullPath },
    }
  }

  if (to.meta.guest && auth.isAuthenticated) {
    return { name: 'dashboard' }
  }

  return true
})
