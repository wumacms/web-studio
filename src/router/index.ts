import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/modules/auth/stores/authStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/modules/site-builder/components/SiteDashboard/SiteDashboard.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/site/:siteId/dashboard',
      name: 'site-dashboard',
      component: () => import('@/modules/site-builder/components/PageManager/PageManager.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/site/:siteId/settings',
      name: 'site-settings',
      component: () => import('@/modules/site-builder/components/SiteSettings/SiteSettings.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/site/:siteId/editor/:pageId',
      name: 'editor',
      component: () => import('@/modules/page-editor/components/EditorCanvas/EditorCanvas.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/marketplace/:type?',
      name: 'marketplace',
      component: () => import('@/modules/marketplace/components/MarketplaceHome/MarketplaceHome.vue'),
      meta: { requiresAuth: true }
    },

    {
      path: '/preview/:siteId',
      name: 'site-preview',
      component: () => import('@/shared/components/Preview/PreviewView.vue')
    },
    {
      path: '/preview/:siteId/:pageId',
      name: 'page-preview',
      component: () => import('@/shared/components/Preview/PreviewView.vue')
    },
    {
      path: '/preview/market/:type/:id',
      name: 'market-preview',
      component: () => import('@/shared/components/Preview/PreviewView.vue')
    },

    {
      path: '/login',
      name: 'login',
      component: () => import('@/modules/auth/components/LoginView.vue'),
      meta: { guestOnly: true }
    }
  ],
})

router.beforeEach(async (to, _from) => {
  const authStore = useAuthStore()
  
  // 关键修复：确保在进行路由守卫判断前，Auth 状态已经初始化完成
  // 如果正在加载（刷新页面时），等待 initialize 完成
  if (authStore.loading) {
    await authStore.initialize()
  }
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return '/login'
  }
  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return '/'
  }
})


export default router
