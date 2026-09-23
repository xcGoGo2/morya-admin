import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    /** 免登录可访问 */
    public?: boolean
    /** 页面标题（页签 / document.title） */
    title?: string
    /** 面包屑层级 */
    crumb?: string[]
  }
}

export {}
