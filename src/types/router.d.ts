import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    guest?: boolean
    requiresAuth?: boolean
    title?: string
    menuKey?: string
    placeholder?: {
      title: string
      description: string
    }
  }
}

export {}
