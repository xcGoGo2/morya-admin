<script setup lang="ts">
import type { FormRules } from 'morya-ui'
import { devices } from '../../api/mock'
import { useAuthStore } from '../../stores/auth'
import {
  MAvatar,
  MButton,
  MCard,
  MForm,
  MFormItem,
  MGrid,
  MGridItem,
  MIcon,
  MInput,
  MInputPassword,
  MPageContent,
  MSelect,
  MTabs,
  MTag,
  MTextarea,
  message,
} from 'morya-ui'
import { computed, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const { state, avatarText } = useAuthStore()

const user = computed(() => state.user)

/* ---------- 页签 ---------- */
const TABS = [
  { label: '基本资料', value: 'profile' },
  { label: '安全设置', value: 'security' },
  { label: '消息通知', value: 'notify' },
  { label: '登录设备', value: 'devices' },
]

const initialTab = typeof route.query.tab === 'string' ? route.query.tab : 'profile'
const activeTab = ref(TABS.some((t) => t.value === initialTab) ? initialTab : 'profile')

/* ---------- 基本资料表单 ---------- */
const profileForm = reactive({
  username: user.value?.username ?? '',
  nickname: user.value?.nickname ?? '',
  email: user.value?.email ?? '',
  phone: '138-8888-6666',
  bio: user.value?.bio ?? '',
})

const profileRules: FormRules = {
  nickname: { required: true, message: '请输入昵称' },
  email: { required: true, message: '请输入邮箱' },
}

function saveProfile() {
  message.success('个人资料已更新')
}

/* ---------- 安全设置 ---------- */
const securityForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const securityRules: FormRules = {
  oldPassword: { required: true, message: '请输入当前密码' },
  newPassword: { required: true, message: '请输入新密码' },
  confirmPassword: { required: true, message: '请再次输入新密码' },
}

function saveSecurity() {
  if (securityForm.newPassword !== securityForm.confirmPassword) {
    message.warn('两次输入的新密码不一致')
    return
  }
  securityForm.oldPassword = ''
  securityForm.newPassword = ''
  securityForm.confirmPassword = ''
  message.success('密码已更新，下次登录请使用新密码')
}

/* ---------- 消息通知 ---------- */
const notifyForm = reactive({
  channel: 'both',
  weekly: 'weekly',
})

const channelOptions = [
  { label: '不通知', value: 'none' },
  { label: '仅站内消息', value: 'site' },
  { label: '站内消息 + 邮件', value: 'both' },
]

const weeklyOptions = [
  { label: '每周一发送', value: 'weekly' },
  { label: '每月 1 日发送', value: 'monthly' },
  { label: '不订阅', value: 'never' },
]

function saveNotify() {
  message.success('通知偏好已保存')
}

/* ---------- 登录设备 ---------- */
function deviceIcon(name: string) {
  if (/iPhone|Android/i.test(name)) return 'device-mobile'
  if (/Windows/i.test(name)) return 'device-desktop'
  return 'device-laptop'
}
</script>

<template>
  <MPageContent density="spacious" aria-label="个人中心">
    <MGrid cols="1 m:3" :x-gap="16" :y-gap="16" responsive="screen">
      <!-- 左侧：用户卡片 -->
      <MGridItem span="1 m:1">
        <MCard hoverable>
          <div class="profile-card">
            <MAvatar :label="avatarText" shape="square" size="xlarge" class="profile-card__avatar" />
            <h2 class="profile-card__name">{{ user?.nickname }}</h2>
            <MTag :value="user?.role" severity="primary" rounded size="small" />
            <p class="profile-card__bio">{{ user?.bio }}</p>

            <div class="profile-card__stats">
              <div><b>24</b><span>参与项目</span></div>
              <div><b>8</b><span>待办事项</span></div>
              <div><b>5</b><span>未读消息</span></div>
            </div>

            <ul class="profile-card__info">
              <li><MIcon name="briefcase" size="sm" />{{ user?.dept }}</li>
              <li><MIcon name="map-pin" size="sm" />{{ user?.location }}</li>
              <li><MIcon name="mail" size="sm" />{{ user?.email }}</li>
            </ul>

            <MButton
              label="编辑资料"
              icon="user"
              outlined
              fluid
              @click="activeTab = 'profile'"
            />
          </div>
        </MCard>
      </MGridItem>

      <!-- 右侧：页签面板 -->
      <MGridItem span="1 m:2">
        <MCard>
          <MTabs v-model="activeTab" :tabs="TABS">
            <template #default="{ activeValue }">
              <!-- 基本资料 -->
              <div v-if="activeValue === 'profile'" class="tab-panel">
                <MForm :model="profileForm" :rules="profileRules" validate-on="submit" @submit="saveProfile">
                  <MFormItem label="用户名" name="username" help="用户名用于登录，不可修改">
                    <template #default="{ id }">
                      <MInput :id="id" v-model="profileForm.username" disabled fluid />
                    </template>
                  </MFormItem>
                  <MFormItem label="昵称" name="nickname" required>
                    <template #default="{ id, invalid }">
                      <MInput :id="id" v-model="profileForm.nickname" :invalid="invalid" fluid />
                    </template>
                  </MFormItem>
                  <MFormItem label="邮箱" name="email" required>
                    <template #default="{ id, invalid }">
                      <MInput :id="id" v-model="profileForm.email" :invalid="invalid" fluid />
                    </template>
                  </MFormItem>
                  <MFormItem label="手机号" name="phone">
                    <template #default="{ id }">
                      <MInput :id="id" v-model="profileForm.phone" fluid />
                    </template>
                  </MFormItem>
                  <MFormItem label="个人简介" name="bio">
                    <template #default="{ id }">
                      <MTextarea :id="id" v-model="profileForm.bio" :rows="3" :maxlength="120" show-count fluid />
                    </template>
                  </MFormItem>
                  <MButton native-type="submit" label="保存更改" icon="device-floppy" severity="primary" />
                </MForm>
              </div>

              <!-- 安全设置 -->
              <div v-else-if="activeValue === 'security'" class="tab-panel">
                <MForm :model="securityForm" :rules="securityRules" validate-on="submit" @submit="saveSecurity">
                  <MFormItem label="当前密码" name="oldPassword" required>
                    <template #default="{ id, invalid }">
                      <MInputPassword :id="id" v-model="securityForm.oldPassword" :invalid="invalid" fluid />
                    </template>
                  </MFormItem>
                  <MFormItem label="新密码" name="newPassword" required help="建议 8 位以上，包含字母与数字">
                    <template #default="{ id, invalid }">
                      <MInputPassword :id="id" v-model="securityForm.newPassword" :invalid="invalid" fluid />
                    </template>
                  </MFormItem>
                  <MFormItem label="确认新密码" name="confirmPassword" required>
                    <template #default="{ id, invalid }">
                      <MInputPassword :id="id" v-model="securityForm.confirmPassword" :invalid="invalid" fluid />
                    </template>
                  </MFormItem>
                  <MButton native-type="submit" label="更新密码" icon="shield-check" severity="primary" />
                </MForm>
              </div>

              <!-- 消息通知 -->
              <div v-else-if="activeValue === 'notify'" class="tab-panel">
                <MForm :model="notifyForm" @submit="saveNotify">
                  <MFormItem label="新消息通知" name="channel" help="接收系统通知、评论与待办提醒的方式">
                    <template #default="{ id }">
                      <MSelect :id="id" v-model="notifyForm.channel" :options="channelOptions" fluid />
                    </template>
                  </MFormItem>
                  <MFormItem label="周报订阅" name="weekly">
                    <template #default="{ id }">
                      <MSelect :id="id" v-model="notifyForm.weekly" :options="weeklyOptions" fluid />
                    </template>
                  </MFormItem>
                  <MButton native-type="submit" label="保存偏好" icon="device-floppy" severity="primary" />
                </MForm>
              </div>

              <!-- 登录设备 -->
              <div v-else class="tab-panel">
                <ul class="devices">
                  <li v-for="d in devices" :key="d.id">
                    <span class="devices__icon"><MIcon :name="deviceIcon(d.name)" size="lg" /></span>
                    <span class="devices__main">
                      <b>
                        {{ d.name }}
                        <MTag v-if="d.current" value="当前设备" severity="success" size="small" rounded />
                      </b>
                      <small>{{ d.client }} · {{ d.location }} · {{ d.time }}</small>
                    </span>
                    <MButton v-if="!d.current" label="下线" text size="small" />
                  </li>
                </ul>
              </div>
            </template>
          </MTabs>
        </MCard>
      </MGridItem>
    </MGrid>
  </MPageContent>
</template>

<style scoped>
/* ---------- 左侧用户卡 ---------- */
.profile-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.profile-card__avatar {
  width: 5rem;
  height: 5rem;
  font-size: 1.75rem;
}

.profile-card__name {
  margin: var(--m-space-3) 0 var(--m-space-2);
  font-size: var(--m-font-size-lg);
  font-weight: 700;
}

.profile-card__bio {
  margin: var(--m-space-3) 0 0;
  font-size: var(--m-font-size-sm);
  color: var(--m-color-text-muted);
  line-height: 1.7;
}

.profile-card__stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  width: 100%;
  margin: var(--m-space-5) 0;
  padding: var(--m-space-4) 0;
  border-top: 1px solid var(--m-color-border);
  border-bottom: 1px solid var(--m-color-border);
}

.profile-card__stats div {
  display: grid;
  gap: var(--m-space-1);
}

.profile-card__stats b {
  font-size: var(--m-font-size-lg);
}

.profile-card__stats span {
  font-size: var(--m-font-size-xs);
  color: var(--m-color-text-muted);
}

.profile-card__info {
  list-style: none;
  margin: 0 0 var(--m-space-5);
  padding: 0;
  width: 100%;
  display: grid;
  gap: var(--m-space-3);
  text-align: left;
}

.profile-card__info li {
  display: flex;
  align-items: center;
  gap: var(--m-space-2);
  font-size: var(--m-font-size-sm);
  color: var(--m-color-text-muted);
}

/* ---------- 页签面板 ---------- */
.tab-panel {
  padding-top: var(--m-space-5);
  max-width: 26rem;
}

/* ---------- 登录设备 ---------- */
.devices {
  list-style: none;
  margin: 0;
  padding: 0;
  max-width: 32rem;
  display: grid;
}

.devices li {
  display: flex;
  align-items: center;
  gap: var(--m-space-3);
  padding: var(--m-space-3) 0;
  border-bottom: 1px solid var(--m-color-border);
}

.devices li:last-child {
  border-bottom: none;
}

.devices__icon {
  flex: none;
  display: grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--m-radius-md);
  color: var(--m-color-primary);
  background: color-mix(in srgb, var(--m-color-primary) 10%, var(--m-color-surface));
}

.devices__main {
  flex: 1;
  min-width: 0;
  display: grid;
  gap: var(--m-space-1);
}

.devices__main b {
  display: flex;
  align-items: center;
  gap: var(--m-space-2);
  font-size: var(--m-font-size-sm);
  font-weight: 600;
}

.devices__main small {
  font-size: var(--m-font-size-xs);
  color: var(--m-color-text-muted);
}
</style>
