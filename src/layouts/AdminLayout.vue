<script setup lang="ts">
import {
  MAvatar,
  MBreadcrumb,
  MButton,
  MDropdown,
  MLayout,
  MLayoutContent,
  MLayoutHeader,
  MLayoutSider,
  MMenu,
  MSpace,
  message,
  type MenuItem,
} from 'morya-ui'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const siderCollapsed = ref(false)
const userMenuOpen = ref(false)

const menuModel: MenuItem[] = [
  { key: 'dashboard', label: '工作台', icon: 'layout-dashboard', to: '/dashboard' },
  { key: 'users', label: '用户管理', icon: 'users', to: '/users' },
  { key: 'settings', label: '系统设置', icon: 'settings', to: '/settings' },
]

const selectedKey = computed(() =>
  typeof route.meta.menuKey === 'string' ? route.meta.menuKey : 'dashboard',
)

const breadcrumbModel = computed(() => {
  const title = typeof route.meta.title === 'string' ? route.meta.title : '工作台'
  return [{ label: '首页', to: '/dashboard' }, { label: title }]
})

const userInitial = computed(() => {
  const name = auth.user?.name?.trim()
  return name ? name.slice(0, 1) : 'M'
})

const userMenuItems = [
  { value: 'logout', label: '退出登录', icon: 'logout' },
]

async function onUserMenuSelect(item: { value?: string }) {
  userMenuOpen.value = false
  if (item.value !== 'logout') return

  await auth.logout()
  message.success('已退出登录')
  await router.replace('/login')
}
</script>

<template>
  <MLayout fill-viewport has-sider>
    <MLayoutSider
      v-model:collapsed="siderCollapsed"
      bordered
      show-trigger="arrow-circle"
      collapse-mode="width"
      :width="220"
      :collapsed-width="72"
    >
      <div class="sider-brand" :class="{ 'sider-brand--collapsed': siderCollapsed }">
        <span class="sider-brand__mark" aria-hidden="true">M</span>
        <span v-if="!siderCollapsed" class="sider-brand__text">Morya Admin</span>
      </div>
      <MMenu
        :model="menuModel"
        :selected-key="selectedKey"
        :collapsed="siderCollapsed"
        :collapsed-width="72"
        embedded
      />
    </MLayoutSider>

    <MLayout>
      <MLayoutHeader
        bordered
        :padding="'var(--m-space-3) var(--m-space-6)'"
        class="admin-header"
      >
        <MBreadcrumb :model="breadcrumbModel" />
        <MSpace alignment="center" :size="12">
          <span class="admin-header__user">{{ auth.user?.name }}</span>
          <MDropdown
            v-model="userMenuOpen"
            :items="userMenuItems"
            placement="bottom-end"
            @select="onUserMenuSelect"
          >
            <template #trigger>
              <MButton severity="secondary" text aria-label="打开账户菜单">
                <MAvatar :label="userInitial" size="sm" shape="circle" />
              </MButton>
            </template>
          </MDropdown>
        </MSpace>
      </MLayoutHeader>

      <MLayoutContent>
        <RouterView />
      </MLayoutContent>
    </MLayout>
  </MLayout>
</template>

<style scoped>
.sider-brand {
  display: flex;
  align-items: center;
  gap: var(--m-space-3);
  min-height: 3.5rem;
  padding: 0 var(--m-space-4);
  border-bottom: 1px solid var(--m-color-border);
}

.sider-brand--collapsed {
  justify-content: center;
  padding: 0;
}

.sider-brand__mark {
  display: inline-grid;
  place-items: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: var(--m-radius-md);
  background: color-mix(in srgb, var(--m-color-primary) 16%, var(--m-color-surface));
  color: var(--m-color-primary);
  font-size: 0.875rem;
  font-weight: 700;
}

.sider-brand__text {
  font-weight: 650;
  letter-spacing: -0.02em;
  color: var(--m-color-text);
}

.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--m-space-4);
}

.admin-header__user {
  color: var(--m-color-text-muted);
  font-size: 0.875rem;
}
</style>
