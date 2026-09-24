<script setup lang="ts">
import type { FormRules } from 'morya-ui'
import { devices } from '../../api/mock'
import { useAuthStore } from '../../stores/auth'
import {
  MButton,
  MConfirmDialog,
  MForm,
  MFormItem,
  MIcon,
  MInput,
  MInputPassword,
  MPageContent,
  MPageHeader,
  MPageSection,
  MSelect,
  MStatus,
  MTabs,
  MTextarea,
  message,
} from 'morya-ui'
import { computed, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import type { DeviceItem } from '../../types'

const route = useRoute()
const { state } = useAuthStore()

const user = computed(() => state.user)

const TABS = [
  { label: '基本资料', value: 'profile' },
  { label: '安全设置', value: 'security' },
  { label: '消息通知', value: 'notify' },
  { label: '登录设备', value: 'devices' },
]

const initialTab = typeof route.query.tab === 'string' ? route.query.tab : 'profile'
const activeTab = ref(TABS.some((t) => t.value === initialTab) ? initialTab : 'profile')

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

function saveProfile(event: { valid: boolean }) {
  if (!event.valid) return
  message.success('个人资料已更新')
}

const securityForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const securityRules: FormRules = {
  oldPassword: { required: true, message: '请输入当前密码' },
  newPassword: { required: true, message: '请输入新密码' },
  confirmPassword: {
    required: true,
    message: '请再次输入新密码',
    validator: (value) => {
      if (!value || value === securityForm.newPassword) return undefined
      return '两次输入的新密码不一致'
    },
  },
}

function saveSecurity(event: { valid: boolean }) {
  if (!event.valid) return
  securityForm.oldPassword = ''
  securityForm.newPassword = ''
  securityForm.confirmPassword = ''
  message.success('密码已更新，下次登录请使用新密码')
}

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

function saveNotify(event: { valid: boolean }) {
  if (!event.valid) return
  message.success('通知偏好已保存')
}

const deviceList = ref<DeviceItem[]>(devices.map((d) => ({ ...d })))
const pendingDevice = ref<DeviceItem | null>(null)

function deviceIcon(name: string) {
  if (/iPhone|Android/i.test(name)) return 'device-mobile'
  if (/Windows/i.test(name)) return 'device-desktop'
  return 'device-laptop'
}

function confirmOffline() {
  const target = pendingDevice.value
  if (!target) return
  deviceList.value = deviceList.value.filter((d) => d.id !== target.id)
  pendingDevice.value = null
  message.success('该设备已下线')
}
</script>

<template>
  <MPageContent width="narrow" aria-label="个人中心">
    <MPageHeader
      title="个人中心"
      :description="`${user?.role ?? ''} · ${user?.dept ?? ''} · ${user?.email ?? ''}`"
    />

    <MTabs v-model="activeTab" :tabs="TABS">
      <template #default="{ activeValue }">
        <MPageSection v-if="activeValue === 'profile'" variant="form" title="基本资料">
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
            <MPageSection variant="actions">
              <MButton native-type="submit" label="保存更改" icon="device-floppy" severity="primary" />
            </MPageSection>
          </MForm>
        </MPageSection>

        <MPageSection v-else-if="activeValue === 'security'" variant="form" title="安全设置">
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
            <MPageSection variant="actions">
              <MButton native-type="submit" label="更新密码" icon="shield-check" severity="primary" />
            </MPageSection>
          </MForm>
        </MPageSection>

        <MPageSection v-else-if="activeValue === 'notify'" variant="form" title="消息通知">
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
            <MPageSection variant="actions">
              <MButton native-type="submit" label="保存偏好" icon="device-floppy" severity="primary" />
            </MPageSection>
          </MForm>
        </MPageSection>

        <MPageSection v-else variant="form" title="登录设备">
          <ul class="devices">
            <li v-for="d in deviceList" :key="d.id">
              <span class="devices__icon"><MIcon :name="deviceIcon(d.name)" size="lg" /></span>
              <span class="devices__main">
                <b>
                  {{ d.name }}
                  <MStatus v-if="d.current" label="当前设备" severity="success" size="small" />
                </b>
                <small>{{ d.client }} · {{ d.location }} · {{ d.time }}</small>
              </span>
              <MButton
                v-if="!d.current"
                label="下线"
                severity="danger"
                text
                size="small"
                @click="pendingDevice = d"
              />
            </li>
          </ul>
        </MPageSection>
      </template>
    </MTabs>

    <MConfirmDialog
      :model-value="pendingDevice !== null"
      header="下线设备"
      :message="pendingDevice ? `确定将「${pendingDevice.name}」退出登录？` : ''"
      accept-label="下线"
      reject-label="取消"
      accept-severity="danger"
      type="warn"
      @accept="confirmOffline"
      @update:model-value="(open) => { if (!open) pendingDevice = null }"
    />
  </MPageContent>
</template>

<style scoped>
.devices {
  list-style: none;
  margin: 0;
  padding: 0;
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
