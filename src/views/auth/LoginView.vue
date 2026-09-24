<script setup lang="ts">
import type { FormInstance, FormRules } from 'morya-ui'
import { loginApi } from '../../api/auth'
import { useAuthStore } from '../../stores/auth'
import {
  MButton,
  MCheckbox,
  MForm,
  MFormItem,
  MIcon,
  MInput,
  MInputPassword,
  message,
} from 'morya-ui'
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const { signIn } = useAuthStore()

const formRef = ref<FormInstance | null>(null)
const submitting = ref(false)
const formError = ref('')

const model = reactive({
  username: 'admin',
  password: '123456',
  remember: true,
})

const rules: FormRules = {
  username: { required: true, message: '请输入账号' },
  password: { required: true, message: '请输入密码' },
}

const features = [
  '纯前端 Mock 数据，无需后端即可完整演示',
  '路由级 + 按钮级双层权限，灵活可控',
  '亮色 / 暗黑主题，一键切换',
]

async function onSubmit() {
  formError.value = ''
  const { valid } = await formRef.value!.validate()
  if (!valid) return

  submitting.value = true
  try {
    const user = await loginApi({ username: model.username, password: model.password })
    signIn(user)
    message.success(`欢迎回来，${user.nickname}`)
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    void router.push(redirect)
  } catch {
    formError.value = '登录没有完成，请再试一次。'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="login-shell">
    <aside class="login-brand" aria-label="品牌介绍">
      <div class="login-brand__grid" />
      <div class="login-brand__blob login-brand__blob--a" />
      <div class="login-brand__blob login-brand__blob--b" />

      <div class="login-brand__inner">
        <div class="login-brand__mark">
          <span class="login-brand__logo"><MIcon name="bolt" size="sm" /></span>
          <span>Morya Admin</span>
        </div>

        <h1 class="login-brand__title">让后台管理<br />简单而强大</h1>
        <p class="login-brand__lead">
          开箱即用的中后台前端解决方案，内置权限控制、主题切换、动态菜单与丰富业务组件，助你快速搭建管理系统。
        </p>

        <ul class="login-brand__feats">
          <li v-for="f in features" :key="f">
            <span class="login-brand__feat-ico"><MIcon name="check" size="sm" /></span>
            {{ f }}
          </li>
        </ul>

        <p class="login-brand__foot">© 2026 Morya Admin · 高保真原型演示</p>
      </div>
    </aside>

    <main class="login-main">
      <div class="login-panel">
        <header class="login-panel__header">
          <h2>欢迎回来 👋</h2>
          <p>请登录你的管理员账号</p>
        </header>

        <MForm
          ref="formRef"
          :model="model"
          :rules="rules"
          validate-on="submit"
          @submit="onSubmit"
        >
          <p v-if="formError" class="login-alert" role="alert">{{ formError }}</p>
          <MFormItem label="账号" name="username">
            <template #default="{ id, invalid }">
              <MInput
                :id="id"
                v-model="model.username"
                placeholder="请输入账号"
                autocomplete="username"
                :invalid="invalid"
                fluid
              >
                <template #prefix>
                  <MIcon name="user" size="sm" />
                </template>
              </MInput>
            </template>
          </MFormItem>

          <MFormItem label="密码" name="password">
            <template #default="{ id, invalid }">
              <MInputPassword
                :id="id"
                v-model="model.password"
                :invalid="invalid"
                fluid
              />
            </template>
          </MFormItem>

          <div class="login-panel__row">
            <label class="login-panel__remember">
              <MCheckbox v-model="model.remember" />
              <span>记住我</span>
            </label>
            <MButton label="忘记密码？" link size="small" />
          </div>

          <MButton
            native-type="submit"
            label="登 录"
            severity="primary"
            size="large"
            :loading="submitting"
            fluid
          />
        </MForm>

        <p class="login-panel__tip">
          演示账号：<b>admin</b> / <b>123456</b>（任意内容均可登录）
        </p>
      </div>
    </main>
  </div>
</template>

<style scoped>
.login-shell {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
  min-height: 100vh;
  background: var(--m-color-surface);
  color: var(--m-color-text);
}

/* ---------- 品牌区 ---------- */
.login-brand {
  position: relative;
  overflow: hidden;
  color: var(--m-color-text);
  background:
    radial-gradient(
      80% 60% at 10% 20%,
      color-mix(in srgb, var(--m-color-primary) 22%, transparent),
      transparent 55%
    ),
    linear-gradient(
      165deg,
      color-mix(in srgb, var(--m-color-primary) 16%, var(--m-color-surface)) 0%,
      var(--m-color-surface) 55%,
      color-mix(in srgb, var(--m-color-border) 35%, var(--m-color-surface)) 100%
    );
  border-right: 1px solid var(--m-color-border);
}

.login-brand__grid {
  position: absolute;
  inset: 0;
  opacity: 0.35;
  background-image:
    linear-gradient(color-mix(in srgb, var(--m-color-primary) 18%, transparent) 1px, transparent 1px),
    linear-gradient(90deg, color-mix(in srgb, var(--m-color-primary) 18%, transparent) 1px, transparent 1px);
  background-size: 3.5rem 3.5rem;
  mask-image: radial-gradient(circle at 30% 70%, var(--m-color-contrast) 0%, transparent 72%);
  pointer-events: none;
}

.login-brand__blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(4.5rem);
  pointer-events: none;
}

.login-brand__blob--a {
  width: 26rem;
  height: 26rem;
  top: -7rem;
  right: -5rem;
  background: color-mix(in srgb, var(--m-color-primary) 16%, transparent);
}

.login-brand__blob--b {
  width: 22rem;
  height: 22rem;
  bottom: -8rem;
  left: -4rem;
  background: color-mix(in srgb, var(--m-color-primary) 10%, transparent);
}

.login-brand__inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  padding: clamp(2.5rem, 6vw, 4.5rem);
}

.login-brand__mark {
  display: flex;
  align-items: center;
  gap: var(--m-space-3);
  font-size: var(--m-font-size-lg);
  font-weight: 700;
  letter-spacing: 0.03em;
  margin-bottom: var(--m-space-8);
}

.login-brand__logo {
  display: grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--m-radius-md);
  color: var(--m-color-on-emphasis);
  background: var(--m-color-primary);
  box-shadow: var(--m-shadow-md);
}

.login-brand__title {
  margin: 0 0 var(--m-space-4);
  font-size: clamp(1.9rem, 3.4vw, 2.75rem);
  font-weight: 800;
  line-height: 1.22;
  letter-spacing: -0.02em;
}

.login-brand__lead {
  margin: 0 0 var(--m-space-6);
  max-width: 28rem;
  font-size: var(--m-font-size-sm);
  line-height: 1.8;
  color: var(--m-color-text-muted);
}

.login-brand__feats {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: var(--m-space-4);
  font-size: var(--m-font-size-sm);
}

.login-brand__feats li {
  display: flex;
  align-items: center;
  gap: var(--m-space-3);
}

.login-brand__feat-ico {
  flex: none;
  display: grid;
  place-items: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background: color-mix(in srgb, var(--m-color-primary) 12%, transparent);
  color: var(--m-color-primary);
}

.login-brand__foot {
  position: absolute;
  left: clamp(2.5rem, 6vw, 4.5rem);
  bottom: var(--m-space-6);
  margin: 0;
  font-size: var(--m-font-size-xs);
  color: var(--m-color-text-muted);
}

/* ---------- 表单区 ---------- */
.login-main {
  display: grid;
  place-items: center;
  padding: var(--m-space-6);
}

.login-panel {
  width: min(100%, 23.75rem);
}

.login-panel__header {
  margin-bottom: var(--m-space-6);
}

.login-panel__header h2 {
  margin: 0 0 var(--m-space-2);
  font-size: 1.625rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.login-panel__header p {
  margin: 0;
  color: var(--m-color-text-muted);
  font-size: var(--m-font-size-sm);
}

.login-panel__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: calc(-1 * var(--m-space-2)) 0 var(--m-space-5);
}

.login-panel__remember {
  display: inline-flex;
  align-items: center;
  gap: var(--m-space-2);
  font-size: var(--m-font-size-sm);
  color: var(--m-color-text-muted);
  cursor: pointer;
  user-select: none;
}

.login-panel__tip {
  margin: var(--m-space-5) 0 0;
  padding: var(--m-space-3) var(--m-space-4);
  border-radius: var(--m-radius-md);
  background: color-mix(in srgb, var(--m-color-primary) 8%, var(--m-color-surface));
  color: var(--m-color-text-muted);
  font-size: var(--m-font-size-xs);
  text-align: center;
}

.login-panel__tip b {
  color: var(--m-color-primary);
  font-weight: 600;
}

.login-alert {
  margin: 0 0 var(--m-space-4);
  padding: var(--m-space-3) var(--m-space-4);
  border: 1px solid color-mix(in srgb, var(--m-color-danger) 40%, var(--m-color-border));
  border-radius: var(--m-radius-md);
  background: color-mix(in srgb, var(--m-color-danger) 10%, var(--m-color-surface));
  color: var(--m-color-danger);
  font-size: var(--m-font-size-sm);
  line-height: 1.45;
}

[data-m-motion='full'] .login-panel {
  animation: login-panel-in 420ms ease both;
}

@keyframes login-panel-in {
  from {
    opacity: 0;
    transform: translateY(0.5rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 900px) {
  .login-shell {
    grid-template-columns: 1fr;
  }

  .login-brand {
    display: none;
  }
}
</style>
