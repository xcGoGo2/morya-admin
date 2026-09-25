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
const formError = ref('')
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
  formError.value = ''
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
  catch {
    formError.value = '解锁没有完成，请再试一次。'
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
    <aside class="lock-brand" aria-hidden="true">
      <p class="lock-brand__mark">Morya Admin</p>
      <p class="lock-brand__lead">会话已锁定。输入密码后继续工作。</p>
    </aside>

    <main class="lock-main">
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

        <p v-if="formError" class="lock-alert" role="alert">
          {{ formError }}
        </p>

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
            size="large"
            :loading="unlocking"
            fluid
          />
        </MForm>

        <p class="lock-panel__tip">
          演示环境，输入任意密码即可解锁
        </p>

        <MButton label="返回登录页" link size="small" class="lock-panel__back" @click="backToLogin" />
      </div>
    </main>
  </div>
</template>

<style scoped>
.lock-shell {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  min-height: 100vh;
  background: var(--m-color-surface);
  color: var(--m-color-text);
}

.lock-brand {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: var(--m-space-4);
  padding: clamp(2rem, 6vw, 4.5rem);
  color: var(--m-color-on-emphasis);
  background: color-mix(in srgb, var(--m-color-primary) 92%, var(--m-color-surface));
  border-right: 1px solid color-mix(in srgb, var(--m-color-primary) 70%, var(--m-color-border));
}

.lock-brand__mark {
  margin: 0;
  font-size: var(--m-font-size-sm);
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--m-color-on-emphasis) 72%, transparent);
}

.lock-brand__lead {
  margin: 0;
  max-width: 18rem;
  line-height: 1.6;
  color: color-mix(in srgb, var(--m-color-on-emphasis) 78%, transparent);
}

.lock-main {
  display: grid;
  place-items: center;
  padding: var(--m-space-6);
}

.lock-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: min(100%, 20rem);
  text-align: center;
}

.lock-panel__time {
  font-size: clamp(2.75rem, 8vw, 4rem);
  font-weight: 650;
  letter-spacing: 0.02em;
  font-variant-numeric: tabular-nums;
  color: var(--m-color-text);
}

.lock-panel__date {
  margin: var(--m-space-1) 0 var(--m-space-6);
  font-size: var(--m-font-size-sm);
  color: var(--m-color-text-muted);
}

.lock-panel__avatar {
  width: 4.5rem;
  height: 4.5rem;
  font-size: 1.5rem;
}

.lock-panel__name {
  margin-top: var(--m-space-4);
  font-size: var(--m-font-size-lg);
  font-weight: 600;
}

.lock-panel__role {
  margin-top: var(--m-space-1);
  font-size: var(--m-font-size-xs);
  color: var(--m-color-text-muted);
}

.lock-panel__form {
  display: grid;
  gap: var(--m-space-3);
  width: 100%;
  margin-top: var(--m-space-5);
  text-align: left;
}

.lock-panel__tip {
  margin: var(--m-space-4) 0 0;
  font-size: var(--m-font-size-xs);
  color: var(--m-color-text-muted);
}

.lock-panel__back {
  margin-top: var(--m-space-4);
}

.lock-alert {
  width: 100%;
  margin: var(--m-space-4) 0 0;
  padding: var(--m-space-3) var(--m-space-4);
  border: 1px solid color-mix(in srgb, var(--m-color-danger) 40%, var(--m-color-border));
  border-radius: var(--m-radius-md);
  background: color-mix(in srgb, var(--m-color-danger) 10%, var(--m-color-surface));
  color: var(--m-color-danger);
  font-size: var(--m-font-size-sm);
  line-height: 1.45;
  text-align: left;
}

@media (max-width: 768px) {
  .lock-shell {
    grid-template-columns: 1fr;
  }

  .lock-brand {
    border-right: 0;
    border-bottom: 1px solid color-mix(in srgb, var(--m-color-primary) 70%, var(--m-color-border));
    min-height: 8rem;
    justify-content: center;
  }
}
</style>
