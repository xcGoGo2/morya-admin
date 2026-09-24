<script setup lang="ts">
import type { FormInstance, FormRules } from 'morya-ui'
import { MAvatar, MButton, message, MForm, MFormItem, MInputPassword } from 'morya-ui'
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { unlockApi } from '../../api/auth'
import { useAuthStore } from '../../stores/auth'

const route = useRoute()
const router = useRouter()
const { state, avatarText, nickname, signOut, unlock } = useAuthStore()

const now = ref(new Date())
let timer = 0

onMounted(() => {
  timer = window.setInterval(() => {
    now.value = new Date()
  }, 1000)
})

onBeforeUnmount(() => {
  window.clearInterval(timer)
})

const formRef = ref<FormInstance | null>(null)
const model = reactive({ password: '' })
const unlocking = ref(false)
const rules: FormRules = {
  password: { required: true, message: '请输入密码' },
}

function formatTime(d: Date) {
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  return `${hh}:${mm}:${ss}`
}

function formatDate(d: Date) {
  const week = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()]
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日 · 星期${week}`
}

async function onUnlock() {
  const { valid } = await formRef.value!.validate()
  if (!valid)
    return
  unlocking.value = true
  try {
    await unlockApi(model.password)
    unlock()
    model.password = ''
    message.success('解锁成功，欢迎回来')
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    void router.push(redirect)
  }
  finally {
    unlocking.value = false
  }
}

function backToLogin() {
  signOut()
  void router.push('/login')
}
</script>

<template>
  <div class="lock-shell">
    <div class="lock-panel">
      <div class="lock-panel__time">
        {{ formatTime(now) }}
      </div>
      <div class="lock-panel__date">
        {{ formatDate(now) }}
      </div>

      <MAvatar :label="avatarText" shape="square" size="xlarge" class="lock-panel__avatar" />
      <div class="lock-panel__name">
        {{ nickname }}
      </div>
      <div class="lock-panel__role">
        {{ state.user?.role }}
      </div>

      <MForm
        ref="formRef"
        class="lock-panel__form"
        :model="model"
        :rules="rules"
        validate-on="submit"
        @submit="onUnlock"
      >
        <MFormItem label="解锁密码" name="password">
          <template #default="{ id, invalid }">
            <MInputPassword :id="id" v-model="model.password" :invalid="invalid" fluid />
          </template>
        </MFormItem>
        <MButton
          native-type="submit"
          icon="login"
          label="解锁"
          severity="primary"
          :loading="unlocking"
          fluid
        />
      </MForm>

      <p class="lock-panel__tip">
        演示环境，输入任意密码即可解锁
      </p>

      <MButton label="返回登录页" link size="small" class="lock-panel__back" @click="backToLogin" />
    </div>
  </div>
</template>

<style scoped>
.lock-shell {
  display: grid;
  place-items: center;
  min-height: 100vh;
  padding: var(--m-space-6);
  color: var(--m-color-on-emphasis);
  background:
    radial-gradient(50% 40% at 82% 12%, color-mix(in srgb, var(--m-color-help) 45%, transparent), transparent 60%),
    radial-gradient(46% 38% at 10% 88%, color-mix(in srgb, var(--m-color-info) 35%, transparent), transparent 58%),
    linear-gradient(
      150deg,
      color-mix(in srgb, var(--m-color-contrast) 92%, var(--m-color-primary)),
      color-mix(in srgb, var(--m-color-contrast) 68%, var(--m-color-primary)) 55%,
      color-mix(in srgb, var(--m-color-contrast) 45%, var(--m-color-help))
    );
}

.lock-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.lock-panel__time {
  font-size: clamp(3.5rem, 10vw, 5.5rem);
  font-weight: 700;
  letter-spacing: 0.02em;
  font-variant-numeric: tabular-nums;
  text-shadow: var(--m-shadow-lg);
}

.lock-panel__date {
  margin: var(--m-space-1) 0 var(--m-space-7);
  font-size: var(--m-font-size-sm);
  opacity: 0.68;
}

.lock-panel__avatar {
  width: 5.5rem;
  height: 5.5rem;
  font-size: 2rem;
  box-shadow: var(--m-shadow-lg);
  border: 0.1875rem solid color-mix(in srgb, var(--m-color-on-emphasis) 55%, transparent);
}

.lock-panel__name {
  margin-top: var(--m-space-4);
  font-size: var(--m-font-size-lg);
  font-weight: 600;
}

.lock-panel__role {
  margin-top: var(--m-space-1);
  font-size: var(--m-font-size-xs);
  opacity: 0.62;
}

.lock-panel__form {
  display: grid;
  gap: var(--m-space-3);
  width: min(100%, 19rem);
  margin-top: var(--m-space-6);
  text-align: left;
}

.lock-panel__form :deep(.m-form-item__label) {
  color: var(--m-color-on-emphasis);
}

.lock-panel__tip {
  margin: var(--m-space-4) 0 0;
  font-size: var(--m-font-size-xs);
  opacity: 0.55;
}

.lock-panel__back {
  margin-top: var(--m-space-4);
}
</style>
