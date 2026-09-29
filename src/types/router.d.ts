import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    /** 免登录可访问 */
    public?: boolean
    /** 已登录即可访问，不做菜单权限校验（个人中心 / 403 等） */
    authOnly?: boolean
    /** 页面标题（页签 / document.title） */
    title?: string
    /** 面包屑层级 */
    crumb?: string[]
    /** 显式权限码；缺省用 route.path 匹配 */
    permission?: string
  }
}

export {}
