<script setup lang="ts">
import type { FormInstance, FormRules, MenuItem } from 'morya-ui'
import type { DeviceItem } from '../../types'
import {
  MAvatar,
  MButton,
  MConfirmDialog,
  MEmpty,
  message,
  MFlex,
  MForm,
  MFormItem,
  MGrid,
  MGridItem,
  MIcon,
  MInput,
  MInputPassword,
  MMenu,
  MPageContent,
  MPageHeader,
  MPageSection,
  MSelect,
  MSpace,
  MStatus,
  MSwitch,
  MTextarea,
} from 'morya-ui'
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { devices } from '../../api/mock'
import { useAuthStore } from '../../stores/auth'

const route = useRoute()
const router = useRouter()
const { state, avatarText, nickname, updateProfile } = useAuthStore()

const user = computed(() => state.user)

const SECTIONS = [
  { key: 'profile', label: '基本资料', icon: 'user' },
  { key: 'security', label: '安全设置', icon: 'shield-check' },
  { key: 'notify', label: '消息通知', icon: 'bell' },
  { key: 'devices', label: '登录设备', icon: 'device-laptop' },
] as const

type SectionKey = typeof SECTIONS[number]['key']

const navModel = computed<MenuItem[]>(() =>
  SECTIONS.map(s => ({
    key: s.key,
    label: s.label,
    icon: s.icon,
  })),
)

function sectionFromQuery(raw: unknown): SectionKey {
  return typeof raw === 'string' && SECTIONS.some(s => s.key === raw)
    ? raw as SectionKey
    : 'profile'
}

const activeTab = ref<SectionKey>(sectionFromQuery(route.query.tab))

const activeTitle = computed(() =>
  SECTIONS.find(s => s.key === activeTab.value)?.label ?? '基本资料',
)

watch(
  () => route.query.tab,
  (tab) => {
    activeTab.value = sectionFromQuery(tab)
  },
)

watch(activeTab, (tab) => {
  const current = typeof route.query.tab === 'string' ? route.query.tab : 'profile'
  if (tab === current)
    return
  void router.replace({ query: { ...route.query, tab } })
})

const profileSubmitting = ref(false)
const securitySubmitting = ref(false)
const notifySubmitting = ref(false)
const profileFormRef = ref<FormInstance | null>(null)
const securityFormRef = ref<FormInstance | null>(null)

const profileForm = reactive({
  username: user.value?.username ?? '',
  nickname: user.value?.nickname ?? '',
  email: user.value?.email ?? '',
  phone: '138-8888-6666',
  location: user.value?.location ?? '',
  bio: user.value?.bio ?? '',
})

const profileSnapshot = reactive({ ...profileForm })

const profileRules: FormRules = {
  nickname: { required: true, message: '请输入昵称' },
  email: { required: true, message: '请输入邮箱' },
}

function resetProfile() {
  Object.assign(profileForm, profileSnapshot)
  profileFormRef.value?.clearValidate()
}

async function saveProfile() {
  const { valid } = await profileFormRef.value!.validate()
  if (!valid)
    return
  profileSubmitting.value = true
  try {
    updateProfile({
      nickname: profileForm.nickname.trim(),
      email: profileForm.email.trim(),
      location: profileForm.location.trim(),
      bio: profileForm.bio.trim(),
    })
    Object.assign(profileSnapshot, { ...profileForm })
    message.success('个人资料已更新')
  }
  finally {
    profileSubmitting.value = false
  }
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
      if (!value || value === securityForm.newPassword)
        return undefined
      return '两次输入的新密码不一致'
    },
  },
}

function resetSecurity() {
  securityForm.oldPassword = ''
  securityForm.newPassword = ''
  securityForm.confirmPassword = ''
  securityFormRef.value?.clearValidate()
}

async function saveSecurity() {
  const { valid } = await securityFormRef.value!.validate()
  if (!valid)
    return
  securitySubmitting.value = true
  try {
    resetSecurity()
    message.success('密码已更新，下次登录请使用新密码')
  }
  finally {
    securitySubmitting.value = false
  }
}

const notifyForm = reactive({
  channel: 'both',
  emailDigest: true,
  productUpdates: false,
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

async function saveNotify() {
  notifySubmitting.value = true
  try {
    message.success('通知偏好已保存')
  }
  finally {
    notifySubmitting.value = false
  }
}

const deviceList = ref<DeviceItem[]>(devices.map(d => ({ ...d })))
const pendingDevice = ref<DeviceItem | null>(null)
const batchOfflineOpen = ref(false)

const otherDevices = computed(() => deviceList.value.filter(d => !d.current))

function deviceIcon(name: string) {
  if (/iPhone|Android/i.test(name))
    return 'device-mobile' as const
  if (/Windows/i.test(name))
    return 'device-desktop' as const
  return 'device-laptop' as const
}

function confirmOffline() {
  const target = pendingDevice.value
  if (!target)
    return
  deviceList.value = deviceList.value.filter(d => d.id !== target.id)
  pendingDevice.value = null
  message.success('该设备已下线')
}

function confirmBatchOffline() {
  const count = otherDevices.value.length
  deviceList.value = deviceList.value.filter(d => d.current)
  batchOfflineOpen.value = false
  message.success(count ? `已下线 ${count} 台设备` : '没有可下线的设备')
}

const identityMeta = computed(() =>
  [user.value?.role, user.value?.dept, user.value?.location].filter(Boolean).join(' · '),
)
</script>

<template>
  <MPageContent class="ops-page" aria-label="个人中心">
    <MPageHeader
      title="个人中心"
      description="管理资料、安全与登录设备。左侧切换分组，右侧编辑内容。"
    />

    <div class="profile-layout">
      <aside class="profile-aside" aria-label="账号与分组">
        <section class="profile-panel-block" aria-label="当前账号">
          <section class="profile-identity">
            <MAvatar :label="avatarText" shape="square" size="xlarge" />
            <div class="profile-identity__copy">
              <h2>{{ nickname || '未登录' }}</h2>
              <p v-if="identityMeta">
                {{ identityMeta }}
              </p>
              <p v-if="user?.email" class="profile-identity__email">
                {{ user.email }}
              </p>
            </div>
          </section>
        </section>

        <section class="profile-panel-block" aria-label="个人中心分组">
          <nav class="profile-nav" aria-label="个人中心分组">
            <MMenu
              v-model:selected-key="activeTab"
              :model="navModel"
              embedded
              aria-label="个人中心分组"
            />
          </nav>
        </section>
      </aside>

      <div class="profile-main">
        <MPageSection
          v-if="activeTab === 'profile'"
          class="profile-panel"
          :title="activeTitle"
          aria-label="基本资料"
        >
          <MForm
            ref="profileFormRef"
            :model="profileForm"
            :rules="profileRules"
            label-position="top"
            validate-on="submit"
            @submit="saveProfile"
          >
            <MGrid cols="1 m:2" :x-gap="16" :y-gap="4" responsive="screen">
              <MGridItem>
                <MFormItem label="用户名" name="username" help="用户名用于登录，不可修改">
                  <template #default="{ id }">
                    <MInput :id="id" v-model="profileForm.username" disabled fluid />
                  </template>
                </MFormItem>
              </MGridItem>
              <MGridItem>
                <MFormItem label="昵称" name="nickname" required>
                  <template #default="{ id, invalid }">
                    <MInput :id="id" v-model="profileForm.nickname" :invalid="invalid" fluid />
                  </template>
                </MFormItem>
              </MGridItem>
              <MGridItem>
                <MFormItem label="邮箱" name="email" required>
                  <template #default="{ id, invalid }">
                    <MInput :id="id" v-model="profileForm.email" type="email" :invalid="invalid" fluid />
                  </template>
                </MFormItem>
              </MGridItem>
              <MGridItem>
                <MFormItem label="手机号" name="phone">
                  <template #default="{ id }">
                    <MInput :id="id" v-model="profileForm.phone" placeholder="可选" fluid />
                  </template>
                </MFormItem>
              </MGridItem>
              <MGridItem>
                <MFormItem label="所在地" name="location">
                  <template #default="{ id }">
                    <MInput :id="id" v-model="profileForm.location" placeholder="例如：武汉" fluid />
                  </template>
                </MFormItem>
              </MGridItem>
              <MGridItem span="1 m:2">
                <MFormItem label="个人简介" name="bio">
                  <template #default="{ id }">
                    <MTextarea :id="id" v-model="profileForm.bio" :rows="3" :maxlength="120" show-count fluid />
                  </template>
                </MFormItem>
              </MGridItem>
            </MGrid>

            <MPageSection variant="actions">
              <MSpace>
                <MButton
                  native-type="submit"
                  label="保存资料"
                  icon="device-floppy"
                  severity="primary"
                  :loading="profileSubmitting"
                />
                <MButton
                  native-type="button"
                  label="恢复更改"
                  severity="secondary"
                  text
                  :disabled="profileSubmitting"
                  @click="resetProfile"
                />
              </MSpace>
            </MPageSection>
          </MForm>
        </MPageSection>

        <MPageSection
          v-else-if="activeTab === 'security'"
          class="profile-panel profile-panel--narrow"
          :title="activeTitle"
          aria-label="安全设置"
        >
          <p class="settings-hint">
            修改密码后，其他已登录设备不会自动下线；如有异常请到「登录设备」主动踢出。
          </p>
          <MForm
            ref="securityFormRef"
            :model="securityForm"
            :rules="securityRules"
            label-position="top"
            validate-on="submit"
            @submit="saveSecurity"
          >
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
              <MSpace>
                <MButton
                  native-type="submit"
                  label="更新密码"
                  icon="shield-check"
                  severity="primary"
                  :loading="securitySubmitting"
                />
                <MButton
                  native-type="button"
                  label="清空"
                  severity="secondary"
                  text
                  :disabled="securitySubmitting"
                  @click="resetSecurity"
                />
              </MSpace>
            </MPageSection>
          </MForm>
        </MPageSection>

        <MPageSection
          v-else-if="activeTab === 'notify'"
          class="profile-panel"
          :title="activeTitle"
          aria-label="消息通知"
        >
          <MForm :model="notifyForm" label-position="top" @submit="saveNotify">
            <MGrid cols="1 m:2" :x-gap="16" :y-gap="4" responsive="screen">
              <MGridItem>
                <MFormItem label="新消息通知" name="channel" help="系统通知、评论与待办的默认投递方式">
                  <template #default="{ id }">
                    <MSelect :id="id" v-model="notifyForm.channel" :options="channelOptions" fluid />
                  </template>
                </MFormItem>
              </MGridItem>
              <MGridItem>
                <MFormItem label="周报订阅" name="weekly">
                  <template #default="{ id }">
                    <MSelect :id="id" v-model="notifyForm.weekly" :options="weeklyOptions" fluid />
                  </template>
                </MFormItem>
              </MGridItem>
              <MGridItem>
                <MFormItem label="邮件摘要" name="emailDigest" help="汇总未读待办与审批，减少打扰">
                  <template #default="{ id }">
                    <MFlex align="center" :size="3">
                      <MSwitch :id="id" v-model="notifyForm.emailDigest" />
                    </MFlex>
                  </template>
                </MFormItem>
              </MGridItem>
              <MGridItem>
                <MFormItem label="产品动态" name="productUpdates">
                  <template #default="{ id }">
                    <MFlex align="center" :size="3">
                      <MSwitch :id="id" v-model="notifyForm.productUpdates" />
                    </MFlex>
                  </template>
                </MFormItem>
              </MGridItem>
            </MGrid>
            <MPageSection variant="actions">
              <MButton
                native-type="submit"
                label="保存偏好"
                icon="device-floppy"
                severity="primary"
                :loading="notifySubmitting"
              />
            </MPageSection>
          </MForm>
        </MPageSection>

        <MPageSection
          v-else
          class="profile-panel profile-panel--wide"
          :title="activeTitle"
          aria-label="登录设备"
        >
          <div v-if="otherDevices.length" class="profile-panel__actions">
            <MButton
              label="下线其他设备"
              severity="danger"
              text
              size="small"
              @click="batchOfflineOpen = true"
            />
          </div>

          <ul v-if="deviceList.length" class="devices">
            <li v-for="d in deviceList" :key="d.id">
              <span class="devices__icon" aria-hidden="true">
                <MIcon :name="deviceIcon(d.name)" size="lg" />
              </span>
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
          <MEmpty
            v-else
            title="暂无登录设备"
            description="登录后会在此显示会话设备，便于排查异常登录。"
            icon="device-laptop"
          />
        </MPageSection>
      </div>
    </div>

    <MConfirmDialog
      :model-value="pendingDevice !== null"
      header="下线设备"
      :message="pendingDevice ? `确定将「${pendingDevice.name}」退出登录？` : ''"
      accept-label="下线"
      reject-label="取消"
      accept-severity="danger"
      type="warning"
      @accept="confirmOffline"
      @update:model-value="(open) => { if (!open) pendingDevice = null }"
    />

    <MConfirmDialog
      v-model="batchOfflineOpen"
      header="下线其他设备"
      :message="`将下线除当前设备外的 ${otherDevices.length} 台会话，需要重新登录才能继续使用。`"
      accept-label="全部下线"
      reject-label="取消"
      accept-severity="danger"
      type="warning"
      @accept="confirmBatchOffline"
    />
  </MPageContent>
</template>

<style scoped>
.profile-layout {
  display: grid;
  grid-template-columns: minmax(14rem, 16rem) minmax(0, 1fr);
  gap: var(--m-space-6);
  align-items: start;
  width: 100%;
}

.profile-aside {
  position: sticky;
  top: 0;
  display: grid;
  gap: var(--m-space-4);
}

.profile-panel-block {
  border: 1px solid var(--m-color-border);
  border-radius: var(--m-radius-md);
  background: var(--m-color-fill-lighter);
  box-shadow: var(--m-shadow-sm);
  overflow: hidden;
}

.profile-identity {
  display: grid;
  justify-items: center;
  gap: var(--m-space-3);
  padding: var(--m-space-5) var(--m-space-4);
  text-align: center;
}

.profile-identity__copy {
  min-width: 0;
  display: grid;
  gap: var(--m-space-1);
}

.profile-identity__copy h2 {
  margin: 0;
  font-size: var(--m-font-size-md);
  font-weight: 650;
  letter-spacing: -0.02em;
  color: var(--m-color-text);
}

.profile-identity__copy p {
  margin: 0;
  font-size: var(--m-font-size-xs);
  color: var(--m-color-text-muted);
  line-height: 1.45;
}

.profile-identity__email {
  font-variant-numeric: tabular-nums;
  word-break: break-all;
}

.profile-nav {
  margin: calc(var(--m-space-2) * -1);
}

.profile-main {
  min-width: 0;
}

.profile-panel {
  width: 100%;
}

.profile-panel__actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: var(--m-space-2);
}

.profile-panel--narrow {
  max-width: 28rem;
}

.profile-panel--wide {
  max-width: none;
}

.settings-hint {
  margin: 0 0 var(--m-space-4);
  color: var(--m-color-text-muted);
  font-size: var(--m-font-size-sm);
  line-height: 1.5;
}

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
  flex-wrap: wrap;
  align-items: center;
  gap: var(--m-space-2);
  font-size: var(--m-font-size-sm);
  font-weight: 600;
}

.devices__main small {
  font-size: var(--m-font-size-xs);
  color: var(--m-color-text-muted);
}

@media (max-width: 900px) {
  .profile-layout {
    grid-template-columns: 1fr;
  }

  .profile-aside {
    position: static;
  }

  .profile-identity {
    grid-template-columns: auto 1fr;
    justify-items: start;
    text-align: left;
    align-items: center;
  }
}
</style>
