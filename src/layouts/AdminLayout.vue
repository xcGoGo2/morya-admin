<script setup lang="ts">
import type { CommandMenuItem, MenuItem } from 'morya-ui'
import {
  MBreadcrumb,
  MButton,
  MCommandMenu,
  MIcon,
  MLayout,
  MLayoutContent,
  MLayoutHeader,
  MLayoutSider,
  MMenu,
  MScrollbar,
  MSpace,
  MTag,
  useTheme,
} from 'morya-ui'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import NotifyPopover from '../components/NotifyPopover.vue'
import UserMenuPopover from '../components/UserMenuPopover.vue'
import { useTabsStore } from '../stores/tabs'

const route = useRoute()
const router = useRouter()
const { isDark, toggleTheme } = useTheme()
const { tabs, active, close } = useTabsStore()

const collapsed = ref(window.matchMedia('(max-width: 900px)').matches)

const menuModel: MenuItem[] = [
  { key: '/dashboard', label: '工作台', icon: 'layout-dashboard', to: '/dashboard' },
  {
    key: 'system',
    label: '系统管理',
    icon: 'settings',
    items: [
      { key: '/system/user', label: '用户管理', icon: 'users', to: '/system/user' },
      { key: '/system/role', label: '角色管理', icon: 'shield-check', to: '/system/role' },
      { key: '/system/menu', label: '菜单管理', icon: 'list', to: '/system/menu' },
      { key: '/system/dept', label: '部门管理', icon: 'sitemap', to: '/system/dept' },
    ],
  },
  {
    key: 'business',
    label: '业务管理',
    icon: 'shopping-cart',
    items: [
      { key: '/business/order', label: '订单管理', icon: 'file-invoice', to: '/business/order' },
      { key: '/business/product', label: '商品管理', icon: 'box', to: '/business/product' },
    ],
  },
  {
    key: 'logs',
    label: '日志管理',
    icon: 'file-text',
    items: [
      { key: '/log/operation', label: '操作日志', icon: 'file-analytics', to: '/log/operation' },
      { key: '/log/login', label: '登录日志', icon: 'history', to: '/log/login' },
    ],
  },
  {
    key: 'errors',
    label: '异常页面',
    icon: 'alert-circle',
    items: [{ key: '/404', label: '404 页面', icon: 'ban', to: '/404' }],
  },
]

const selectedKey = computed(() => route.path)
const commandOpen = ref(false)

const commands = computed<CommandMenuItem[]>(() => {
  const items: CommandMenuItem[] = []
  const walk = (nodes: MenuItem[]) => {
    for (const node of nodes) {
      if (node.to && node.label) {
        const to = node.to
        items.push({
          key: node.key,
          label: node.label,
          icon: node.icon,
          command: () => {
            commandOpen.value = false
            void router.push(to)
          },
        })
      }
      if (node.items)
        walk(node.items)
    }
  }
  walk(menuModel)
  return items
})

function onSearchKey(event: KeyboardEvent) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    commandOpen.value = true
  }
}

onMounted(() => window.addEventListener('keydown', onSearchKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onSearchKey))

const breadcrumbModel = computed(() => {
  const crumb = route.meta.crumb ?? []
  return crumb.map((label, index) => ({
    label,
    ...(index < crumb.length - 1 && label === '首页' ? { to: '/dashboard' } : {}),
  }))
})

function toggleFullscreen() {
  if (document.fullscreenElement) {
    void document.exitFullscreen()
  }
  else {
    void document.documentElement.requestFullscreen().catch(() => {})
  }
}

function onTabChange(value: string) {
  // 关闭按钮的点击会冒泡到标签根节点，需抑制本次导航
  if (suppressClick === value)
    return
  if (value !== route.path)
    void router.push(value)
}

let suppressClick: string | null = null

function onTabClose(value: string) {
  suppressClick = value
  setTimeout(() => (suppressClick = null))
  const next = close(value)
  if (next)
    void router.push(next)
}
</script>

<template>
  <MLayout has-sider fill-viewport>
    <MLayoutSider
      v-model:collapsed="collapsed"
      bordered
      :width="234"
      :collapsed-width="64"
      collapse-mode="width"
      show-trigger="bar"
    >
      <div class="brand">
        <span class="brand__logo"><MIcon name="bolt" size="sm" /></span>
        <span v-if="!collapsed" class="brand__name">Morya Admin</span>
      </div>

      <MMenu
        :model="menuModel"
        :selected-key="selectedKey"
        :collapsed="collapsed"
        :collapsed-width="64"
        :default-expanded-keys="['system']"
        aria-label="主导航"
      />
    </MLayoutSider>

    <MLayout>
      <MLayoutHeader bordered padding="0 var(--m-space-4)" class="topbar">
        <MButton
          icon="menu"
          icon-only
          quaternary
          aria-label="折叠菜单"
          @click="collapsed = !collapsed"
        />

        <MBreadcrumb :model="breadcrumbModel" class="topbar__crumb" />

        <MSpace class="topbar__right">
          <MButton
            class="topbar__search"
            icon="search"
            icon-only
            quaternary
            aria-label="搜索菜单"
            @click="commandOpen = true"
          />

          <MButton
            :icon="isDark ? 'sun' : 'moon'"
            icon-only
            quaternary
            :aria-label="isDark ? '切换到浅色模式' : '切换到深色模式'"
            @click="toggleTheme"
          />
          <MButton
            icon="maximize"
            icon-only
            quaternary
            aria-label="全屏"
            @click="toggleFullscreen"
          />

          <NotifyPopover />
          <UserMenuPopover class="ml-4" />
        </MSpace>
      </MLayoutHeader>

      <div class="tabbar" role="navigation" aria-label="页面页签">
        <MTag
          v-for="t in tabs"
          :key="t.value"
          :value="t.label"
          :icon="t.icon"
          :severity="t.value === active ? 'primary' : 'secondary'"
          :closable="t.closable"
          class="tabbar__tag"
          :class="{ 'is-active': t.value === active }"
          tabindex="0"
          role="link"
          @click="onTabChange(t.value)"
          @keydown.enter="onTabChange(t.value)"
          @close="onTabClose(t.value)"
        />
      </div>

      <MCommandMenu v-model="commandOpen" :model="commands" placeholder="搜索菜单、页面…" />

      <MLayoutContent class="content-scroll">
        <MScrollbar class="content-scroll__bar">
          <RouterView />
        </MScrollbar>
      </MLayoutContent>
    </MLayout>
  </MLayout>
</template>

<style scoped>
.brand {
  display: flex;
  align-items: center;
  gap: var(--m-space-3);
  height: 3.75rem;
  padding: 0 var(--m-space-4);
  overflow: hidden;
  white-space: nowrap;
  color: var(--m-color-text);
}

.brand__logo {
  flex: none;
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  border-radius: var(--m-radius-md);
  color: var(--m-color-on-emphasis);
  background: linear-gradient(135deg, var(--m-color-primary), var(--m-color-help));
  box-shadow: var(--m-shadow-md);
}

.brand__name {
  font-size: var(--m-font-size-md);
  font-weight: 700;
  letter-spacing: 0.02em;
}

.topbar {
  display: flex;
  align-items: center;
  gap: var(--m-space-3);
}

.topbar__crumb {
  flex: 1;
  min-width: 0;
}

.topbar__right {
  display: flex;
}

.topbar__search {
  margin-right: var(--m-space-2);
}

.tabbar {
  flex: none;
  display: flex;
  align-items: center;
  gap: var(--m-space-2);
  padding: var(--m-space-2) var(--m-space-4);
  border-bottom: 1px solid var(--m-color-border);
  background: var(--m-color-surface);
  overflow-x: auto;
}

.tabbar__tag {
  flex: none;
  min-width: 4.5rem;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  transition:
    transform var(--m-motion-fast),
    box-shadow var(--m-motion-fast);
}

.tabbar__tag:hover {
  transform: translateY(-1px);
}

.tabbar__tag.is-active {
  box-shadow: var(--m-shadow-sm);
}

.tabbar__tag:focus-visible {
  outline: 2px solid var(--m-color-focus-ring);
  outline-offset: 1px;
}

/* 内容区滚动：MLayoutContent 为单层壳，滚动交由 MScrollbar 承担 */
.content-scroll {
  min-height: 0;
}

.content-scroll__bar {
  height: 100%;
}
</style>
