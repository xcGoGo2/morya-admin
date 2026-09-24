import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useTabsStore } from '../stores/tabs'

const AdminLayout = () => import('../layouts/AdminLayout.vue')

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/auth/LoginView.vue'),
      meta: { public: true, title: '登录' },
    },
    {
      path: '/lock',
      name: 'lock',
      component: () => import('../views/auth/LockView.vue'),
      meta: { title: '锁定屏幕' },
    },
    {
      path: '/404',
      name: 'not-found',
      component: () => import('../views/error/NotFoundView.vue'),
      meta: { public: true, title: '页面不存在' },
    },
    {
      path: '/',
      component: AdminLayout,
      redirect: '/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('../views/dashboard/DashboardView.vue'),
          meta: { title: '工作台', crumb: ['首页', '工作台'] },
        },
        {
          path: 'system/user',
          name: 'system-user',
          component: () => import('../views/system/UserListView.vue'),
          meta: { title: '用户管理', crumb: ['系统管理', '用户管理'] },
        },
        {
          path: 'system/role',
          name: 'system-role',
          component: () => import('../views/system/RoleListView.vue'),
          meta: { title: '角色管理', crumb: ['系统管理', '角色管理'] },
        },
        {
          path: 'system/menu',
          name: 'system-menu',
          component: () => import('../views/system/MenuListView.vue'),
          meta: { title: '菜单管理', crumb: ['系统管理', '菜单管理'] },
        },
        {
          path: 'system/dept',
          name: 'system-dept',
          component: () => import('../views/system/DeptListView.vue'),
          meta: { title: '部门管理', crumb: ['系统管理', '部门管理'] },
        },
        {
          path: 'business/order',
          name: 'business-order',
          component: () => import('../views/business/OrderListView.vue'),
          meta: { title: '订单管理', crumb: ['业务管理', '订单管理'] },
        },
        {
          path: 'business/product',
          name: 'business-product',
          component: () => import('../views/business/ProductListView.vue'),
          meta: { title: '商品管理', crumb: ['业务管理', '商品管理'] },
        },
        {
          path: 'log/operation',
          name: 'log-operation',
          component: () => import('../views/log/OperationLogView.vue'),
          meta: { title: '操作日志', crumb: ['日志管理', '操作日志'] },
        },
        {
          path: 'log/login',
          name: 'log-login',
          component: () => import('../views/log/LoginLogView.vue'),
          meta: { title: '登录日志', crumb: ['日志管理', '登录日志'] },
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('../views/profile/ProfileView.vue'),
          meta: { title: '个人中心', crumb: ['个人', '个人中心'] },
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      component: () => import('../views/error/NotFoundView.vue'),
      meta: { public: true, title: '页面不存在' },
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (auth.isAuthenticated.value && to.path === '/login') {
    return { path: '/' }
  }
  if (!auth.isAuthenticated.value && !to.meta.public) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
  if (auth.state.locked && !to.meta.public && to.path !== '/lock') {
    return { path: '/lock', query: { redirect: to.fullPath } }
  }
  return true
})

router.afterEach((to) => {
  const title = to.meta.title
  document.title = title ? `${title} · Morya Admin` : 'Morya Admin'

  // 仅后台壳内页面参与页签
  if (to.meta.crumb && title) {
    useTabsStore().open({ label: title, value: to.path })
  }
})
