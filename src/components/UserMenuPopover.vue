<script setup lang="ts">
import { MAvatar, MBadge, MButton, message, MIcon, MPopover } from 'morya-ui'
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import { logoutApi } from '../api/auth'
import { useAuthStore } from '../stores/auth'
import { useTabsStore } from '../stores/tabs'

const router = useRouter()
const { state: authState, avatarText, nickname, lock, signOut } = useAuthStore()

const open = ref(false)
const now = ref(Date.now())
const timer = window.setInterval(() => (now.value = Date.now()), 30_000)
onBeforeUnmount(() => window.clearInterval(timer))

const onlineDuration = computed(() => {
  if (!authState.loginAt)
    return ''
  const minutes = Math.max(1, Math.floor((now.value - authState.loginAt) / 60_000))
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h ? `${h} 小时 ${m} 分` : `${m} 分钟`
})

function go(path: string, query?: Record<string, string>) {
  open.value = false
  void router.push({ path, query })
}

function onLock() {
  open.value = false
  lock()
  void router.push('/lock')
}

async function onLogout() {
  open.value = false
  await logoutApi()
  signOut()
  useTabsStore().reset()
  message.success('已安全退出')
  void router.push('/login')
}
</script>

<template>
  <MPopover v-model="open" placement="bottom-end" :pt="{ root: { style: 'padding:0' } }">
    <MButton type="link" class="user-trigger" :class="{ open }" @click="open = !open">
      <MAvatar class="user-trigger__avatar" :label="avatarText" shape="circle" />
      <span class="user-trigger__name">{{ nickname }}</span>
      <MIcon name="chevron-down" size="sm" class="user-trigger__chev" />
    </MButton>

    <template #content>
      <div class="user-panel">
        <div class="user-panel__card">
          <MAvatar :label="avatarText" shape="square" size="large" class="user-panel__avatar" />
          <div class="user-panel__info">
            <div class="user-panel__name">
              {{ nickname }}
              <span class="user-panel__role">{{ authState.user?.role }}</span>
            </div>
            <div class="user-panel__mail">
              {{ authState.user?.email }}
            </div>
          </div>
        </div>

        <div class="user-panel__status">
          <span class="user-panel__dot" />
          在线 · 已登录 <b>{{ onlineDuration }}</b>
        </div>

        <div class="user-panel__group">
          <MButton type="text" class="user-panel__item" block @click="go('/profile')">
            <MIcon name="user" size="sm" />
            <span class="user-panel__label">个人中心</span>
          </MButton>
          <MButton type="text" class="user-panel__item" block @click="go('/profile', { tab: 'security' })">
            <MIcon name="shield" size="sm" />
            <span class="user-panel__label">安全设置</span>
          </MButton>
          <MButton type="text" class="user-panel__item" block @click="go('/notify')">
            <MIcon name="message" size="sm" />
            <span class="user-panel__label">消息中心</span>
            <MBadge :value="5" type="danger" size="small" />
          </MButton>
        </div>

        <div class="user-panel__group">
          <MButton type="text" class="user-panel__item" block @click="onLock">
            <MIcon name="lock" size="sm" />
            <span class="user-panel__label">锁定屏幕</span>
          </MButton>
        </div>

        <div class="user-panel__group">
          <MButton type="text" color="danger" class="user-panel__item user-panel__item--danger" block @click="onLogout">
            <MIcon name="logout" size="sm" />
            <span class="user-panel__label">退出登录</span>
          </MButton>
        </div>
      </div>
    </template>
  </MPopover>
</template>

<style scoped>
.user-trigger {
  display: flex;
  align-items: center;
  gap: var(--m-space-2);
}

.user-trigger__avatar {
  flex: none;
}

.user-trigger__name {
  font-size: var(--m-font-size-sm);
  font-weight: 600;
}

.user-trigger__chev {
  color: var(--m-color-text-muted);
  transition: transform var(--m-motion-normal);
}

.user-trigger.open .user-trigger__chev {
  transform: rotate(180deg);
}

.user-panel {
  width: 17.5rem;
  max-width: calc(100vw - 2rem);
  padding: var(--m-space-2);
}

.user-panel__card {
  display: flex;
  align-items: center;
  gap: var(--m-space-3);
  padding: var(--m-space-3);
  border-radius: var(--m-radius-md);
  color: var(--m-color-on-emphasis);
  background: color-mix(in srgb, var(--m-color-primary) 92%, var(--m-color-surface));
}

.user-panel__avatar {
  flex: none;
}

.user-panel__info {
  flex: 1;
  min-width: 0;
}

.user-panel__name {
  display: flex;
  align-items: center;
  gap: var(--m-space-2);
  font-size: var(--m-font-size-sm);
  font-weight: 700;
  margin-bottom: 0.15rem;
}

.user-panel__role {
  padding: 0 var(--m-space-2);
  height: 1.05rem;
  line-height: 1.05rem;
  border-radius: var(--m-radius-sm);
  font-size: var(--m-font-size-xs);
  font-weight: 600;
  background: color-mix(in srgb, var(--m-color-on-emphasis) 24%, transparent);
}

.user-panel__mail {
  font-size: var(--m-font-size-xs);
  opacity: 0.82;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-panel__status {
  display: flex;
  align-items: center;
  gap: var(--m-space-2);
  padding: var(--m-space-2) var(--m-space-3);
  font-size: var(--m-font-size-xs);
  color: var(--m-color-text-muted);
}

.user-panel__status b {
  color: var(--m-color-text);
  font-weight: 600;
}

.user-panel__dot {
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 50%;
  background: var(--m-color-success);
}

.user-panel__group {
  display: grid;
  gap: var(--m-space-1);
  padding: var(--m-space-1) 0;
  border-top: 1px solid var(--m-color-border);
}

.user-panel__item {
  justify-content: flex-start;
  height: 2.35rem;
  color: var(--m-color-text-muted);
}

.user-panel__item:hover {
  color: var(--m-color-primary);
}

.user-panel__item--danger:hover {
  color: var(--m-color-danger);
}

.user-panel__label {
  flex: 1;
  text-align: left;
}

@media (max-width: 640px) {
  .user-trigger__name {
    display: none;
  }
}
</style>
