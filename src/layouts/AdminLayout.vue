<script setup lang="ts">
import type { CommandMenuItem, MenuItem } from 'morya-ui'
import {
  MBreadcrumb,
  MButton,
  MCard,
  MCommandMenu,
  MFlex,
  MIcon,
  MLayout,
  MLayoutContent,
  MLayoutHeader,
  MLayoutSider,
  MMenu,
  MTag,
  useTheme,
} from 'morya-ui'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import LayoutSettingsDrawer from '../components/LayoutSettingsDrawer.vue'
import NotifyPopover from '../components/NotifyPopover.vue'
import UserMenuPopover from '../components/UserMenuPopover.vue'
import { useAuthStore } from '../stores/auth'
import { useSettingsStore } from '../stores/settings'
import { useTabsStore } from '../stores/tabs'
import { buildMenuModel } from '../utils/menu'

const route = useRoute()
const router = useRouter()
const { isDark, toggleTheme } = useTheme()
const { tabs, active, close } = useTabsStore()
const { permissions } = useAuthStore()
const { showTabs, contentWidth } = useSettingsStore()

const collapsed = ref(window.matchMedia('(max-width: 900px)').matches)
const settingsOpen = ref(false)

const menuModel = computed<MenuItem[]>(() => buildMenuModel(permissions.value))

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
  walk(menuModel.value)
  return items
})

const defaultExpandedKeys = computed(() =>
  menuModel.value
    .filter(n => n.items?.length)
    .map(n => n.key)
    .filter((k): k is string => typeof k === 'string'),
)

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
  // 点击关闭按钮时 click 会冒泡到标签根元素，此时页签已被移除，跳过导航
  if (!tabs.value.some(t => t.value === value))
    return
  if (value !== route.path)
    void router.push(value)
}

function onTabClose(value: string) {
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
        <span class="brand__logo" aria-hidden="true"><MIcon name="bolt" size="sm" /></span>
        <span v-if="!collapsed" class="brand__name">Morya Admin</span>
      </div>

      <MMenu
        :model="menuModel"
        :selected-key="selectedKey"
        :collapsed="collapsed"
        :collapsed-width="64"
        :default-expanded-keys="defaultExpandedKeys"
        embedded
        aria-label="主导航"
      />
    </MLayoutSider>

    <MLayout>
      <MLayoutHeader bordered padding="0 var(--m-space-4)" class="topbar">
        <MButton icon="menu" icon-only aria-label="折叠菜单" @click="collapsed = !collapsed" type="text" />

        <MBreadcrumb :model="breadcrumbModel" class="topbar__crumb" />

        <MFlex class="topbar__right gap-2" align="center">
          <MButton class="topbar__search" icon="search" icon-only aria-label="搜索菜单" @click="commandOpen = true" type="text" />

          <MButton :icon="isDark ? 'sun' : 'moon'" icon-only :aria-label="isDark ? '切换到浅色模式' : '切换到深色模式'" @click="toggleTheme" type="text" />
          <MButton icon="settings" icon-only aria-label="布局设置" @click="settingsOpen = true" type="text" />
          <MButton icon="maximize" icon-only aria-label="全屏" @click="toggleFullscreen" type="text" />

          <NotifyPopover />
          <UserMenuPopover class="ml-4" />
        </MFlex>
      </MLayoutHeader>

      <TransitionGroup
        v-if="showTabs"
        tag="div"
        name="tab"
        class="tabbar"
        role="navigation"
        aria-label="页面页签"
      >
        <MTag
          v-for="t in tabs"
          :key="t.value"
          :value="t.label"
          :icon="t.icon"
          :type="t.value === active ? 'primary' : 'secondary'"
          :closable="t.closable"
          :bordered="t.value === active"
          class="tabbar__tag"
          :class="{ 'tabbar__tag--active': t.value === active }"
          tabindex="0"
          size="large"
          role="link"
          @click="onTabChange(t.value)"
          @keydown.enter="onTabChange(t.value)"
          @close="onTabClose(t.value)"
        />
      </TransitionGroup>

      <MCommandMenu v-model="commandOpen" :model="commands" placeholder="搜索菜单、页面…" />
      <LayoutSettingsDrawer v-model="settingsOpen" />

      <MLayoutContent class="layout-content">
        <div class="admin-canvas">
          <MCard
            class="content-shell page-card page-card--fill"
            bordered
            shadow="always"
            aria-label="主内容"
          >
            <div
              class="content-inner"
              :class="{ 'content-inner--fixed': contentWidth === 'fixed' }"
            >
              <RouterView />
            </div>
          </MCard>
        </div>
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
  background: var(--m-color-primary);
}

.brand__name {
  font-size: var(--m-font-size-md);
  font-weight: 650;
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
  background: var(--m-color-fill-lighter);
  overflow-x: auto;
}

.tabbar__tag {
  flex: none;
  min-width: 4.5rem;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  transition:
    transform var(--m-motion-fast) var(--m-motion-ease),
    box-shadow var(--m-motion-fast) var(--m-motion-ease);
}

.tabbar__tag:hover {
  transform: translateY(-1px);
}

.tabbar__tag:active {
  transform: translateY(0) scale(0.97);
}

.tabbar__tag:focus-visible {
  outline: 2px solid var(--m-color-focus-ring);
  outline-offset: 1px;
}

.tabbar__tag--active {
  box-shadow: var(--m-shadow-sm);
}

/* 页签进出场 / 重排（TransitionGroup）——声明在 .tabbar__tag 之后，过渡期覆盖其 fast 过渡 */
.tab-move,
.tab-enter-active,
.tab-leave-active {
  transition:
    transform var(--m-motion-normal) var(--m-motion-ease),
    opacity var(--m-motion-normal) var(--m-motion-ease);
}

.tab-enter-from,
.tab-leave-to {
  opacity: 0;
  transform: translateY(calc(var(--m-space-2) * 0.75)) scale(0.92);
}

.layout-content {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.admin-canvas {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
  padding: var(--m-space-4);
  background: var(--m-color-fill-lighter);
}

.content-shell.page-card {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.content-shell.page-card > :deep(.m-card__body) {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  /* 仅主壳去 padding；工作台等内部 MCard 保留组件默认内边距 */
  padding: 0;
  overflow: hidden;
}

.content-inner {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
  width: 100%;
  /* 无表格 fill / 自带 MScrollbar 的页：卡片内不原生滚动 */
  overflow: auto;
}

.content-inner:has(.m-page-content--fill),
.content-inner:has(.m-scrollbar) {
  overflow: hidden;
}

.content-inner--fixed {
  max-width: 75rem;
  margin-inline: auto;
}

.content-inner :deep(.m-page-content--fill) {
  flex: 1 1 auto;
  min-height: 0;
  height: 100%;
}

/* 字典等非直接 MTable 主区，同样吃掉剩余高度 */
.content-inner :deep(.m-page-content--fill > .dict-split) {
  flex: 1 1 auto;
  min-height: 0;
}
</style>
