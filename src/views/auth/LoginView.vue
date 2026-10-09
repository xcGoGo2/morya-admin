<script setup lang="ts">
import type { FormInstance, FormRules } from 'morya-ui'
import {
  MButton,
  MCheckbox,
  message,
  MForm,
  MFormItem,
  MIcon,
  MInput,
  MInputPassword,
  useTheme,
} from 'morya-ui'
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { loginApi } from '../../api/auth'
import { useAuthStore } from '../../stores/auth'

const route = useRoute()
const router = useRouter()
const { signIn } = useAuthStore()
const { isDark, toggleTheme } = useTheme()

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

const highlights = [
  '试用 admin / ops 体验不同菜单与按钮权限',
  '侧栏由菜单种子动态生成，按角色裁剪',
  '亮色 / 暗黑主题与布局密度可随时切换',
]

async function onSubmit() {
  formError.value = ''
  const { valid } = await formRef.value!.validate()
  if (!valid)
    return

  submitting.value = true
  try {
    const user = await loginApi({ username: model.username, password: model.password })
    signIn(user, { remember: model.remember })
    message.success(`欢迎回来，${user.nickname}`)
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    void router.push(redirect)
  }
  catch {
    formError.value = '登录没有完成，请再试一次。'
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="login-shell">
    <aside class="login-brand" aria-label="品牌介绍">
      <div class="login-brand__top">
        <span class="login-brand__logo" aria-hidden="true">
          <MIcon name="bolt" size="sm" />
        </span>
        <span class="login-brand__mark">Morya Admin</span>
      </div>

      <div class="login-brand__copy">
        <h1 class="login-brand__title">
          让后台管理<br>简单而强大
        </h1>
        <p class="login-brand__lead">
          开箱即用的中后台前端方案：权限、主题、动态菜单与业务组件一次齐备。
        </p>
        <ul class="login-brand__list">
          <li v-for="item in highlights" :key="item">
            <MIcon name="check" size="sm" />
            <span>{{ item }}</span>
          </li>
        </ul>
      </div>

      <p class="login-brand__foot">
        © 2026 Morya Admin · 高保真原型演示
      </p>
    </aside>

    <main class="login-main">
      <MButton class="login-theme" :icon="isDark ? 'sun' : 'moon'" icon-only :aria-label="isDark ? '切换到浅色模式' : '切换到深色模式'" @click="toggleTheme" type="text" />

      <div class="login-panel">
        <header class="login-panel__header">
          <p class="login-panel__eyebrow">
            管理员入口
          </p>
          <h2>欢迎回来</h2>
          <p>使用管理员账号登录后台控制台</p>
        </header>

        <p v-if="formError" class="login-alert" role="alert">
          {{ formError }}
        </p>

        <MForm
          ref="formRef"
          :model="model"
          :rules="rules"
          validate-on="submit"
          @submit="onSubmit"
        >
          <MFormItem label="账号" name="username">
            <template #default="{ id, invalid }">
              <MInput
                :id="id"
                v-model="model.username"
                placeholder="请输入账号"
                autocomplete="username"
                :invalid="invalid"
                fluid
              />
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
            <MCheckbox v-model="model.remember" label="记住我" />
            <MButton label="忘记密码" size="small" @click="router.push('/forgot-password')" type="link" />
          </div>

          <MButton type="primary" html-type="submit" label="登录" size="large" :loading="submitting" block />
        </MForm>

        <p class="login-panel__tip">
          试用账号 <b>admin</b>（全权限）/ <b>ops</b>（仅业务）
          <span>密码任意非空即可</span>
        </p>
      </div>
    </main>
  </div>
</template>

<style scoped>
.login-shell {
  display: grid;
  grid-template-columns: minmax(16rem, 0.95fr) minmax(20rem, 1.05fr);
  min-height: 100vh;
  background: var(--m-color-surface);
  color: var(--m-color-text);
}

.login-brand {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: var(--m-space-4);
  padding: clamp(2rem, 6vw, 4.5rem);
  background: color-mix(in srgb, var(--m-color-primary) 12%, var(--m-color-surface));
  border-right: 1px solid var(--m-color-border);
}

.login-brand__top {
  display: flex;
  align-items: center;
  gap: var(--m-space-3);
  margin-bottom: auto;
}

.login-brand__logo {
  display: grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: var(--m-radius-md);
  color: var(--m-color-on-emphasis);
  background: var(--m-color-primary);
}

.login-brand__mark {
  margin: 0;
  font-size: var(--m-font-size-sm);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--m-color-text-muted);
}

.login-brand__copy {
  display: flex;
  flex-direction: column;
  gap: var(--m-space-4);
}

.login-brand__title {
  margin: 0;
  max-width: 12em;
  font-size: clamp(1.75rem, 3vw, 2.25rem);
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: var(--m-color-text);
}

.login-brand__lead {
  margin: 0;
  max-width: 28rem;
  line-height: 1.65;
  color: var(--m-color-text-muted);
  font-size: var(--m-font-size-md);
}

.login-brand__list {
  list-style: none;
  margin: var(--m-space-2) 0 0;
  padding: 0;
  display: grid;
  gap: var(--m-space-3);
  max-width: 26rem;
}

.login-brand__list li {
  display: flex;
  align-items: flex-start;
  gap: var(--m-space-2);
  font-size: var(--m-font-size-sm);
  line-height: 1.5;
  color: var(--m-color-text-muted);
}

.login-brand__list :deep(svg) {
  flex: none;
  margin-top: 0.15rem;
  color: var(--m-color-primary);
}

.login-brand__foot {
  margin: var(--m-space-4) 0 0;
  font-size: var(--m-font-size-xs);
  color: var(--m-color-text-muted);
}

.login-main {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--m-space-6);
  background: var(--m-color-fill-lighter);
}

.login-theme {
  position: absolute;
  top: var(--m-space-4);
  right: var(--m-space-4);
}

.login-panel {
  width: min(100%, 24rem);
  display: flex;
  flex-direction: column;
  gap: var(--m-space-4);
  padding: var(--m-space-6);
  border: 1px solid var(--m-color-border);
  border-radius: var(--m-radius-md);
  background: var(--m-color-surface);
  box-shadow: var(--m-shadow-md);
}

.login-panel__header {
  margin-bottom: 0;
}

.login-panel__eyebrow {
  margin: 0 0 var(--m-space-2);
  font-size: var(--m-font-size-xs);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--m-color-primary);
}

.login-panel__header h2 {
  margin: 0 0 var(--m-space-2);
  font-size: var(--m-font-size-xl);
  font-weight: 650;
  letter-spacing: -0.02em;
}

.login-panel__header p {
  margin: 0;
  color: var(--m-color-text-muted);
  font-size: var(--m-font-size-sm);
  line-height: 1.5;
}

.login-panel__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: calc(-1 * var(--m-space-2)) 0 var(--m-space-4);
}

.login-panel__tip {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--m-space-2);
  margin: 0;
  padding: var(--m-space-3) var(--m-space-4);
  border: 1px solid var(--m-color-border);
  border-radius: var(--m-radius-md);
  background: var(--m-color-fill-lighter);
  color: var(--m-color-text-muted);
  font-size: var(--m-font-size-xs);
  line-height: 1.5;
}

.login-panel__tip b {
  color: var(--m-color-text);
  font-weight: 600;
}

.login-panel__tip span {
  margin-left: auto;
}

.login-alert {
  margin: 0;
  padding: var(--m-space-3) var(--m-space-4);
  border: 1px solid color-mix(in srgb, var(--m-color-danger) 40%, var(--m-color-border));
  border-radius: var(--m-radius-md);
  background: color-mix(in srgb, var(--m-color-danger) 10%, var(--m-color-surface));
  color: var(--m-color-danger);
  font-size: var(--m-font-size-sm);
  line-height: 1.45;
}

[data-m-motion='full'] .login-panel {
  animation: login-panel-in var(--m-motion-enter, 420ms) var(--m-motion-ease, ease) both;
}

@keyframes login-panel-in {
  from {
    opacity: 0;
    transform: translateY(var(--m-motion-distance, 0.5rem));
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 720px) {
  .login-shell {
    grid-template-columns: 1fr;
  }

  .login-brand {
    border-right: none;
    border-bottom: 1px solid var(--m-color-border);
    padding: var(--m-space-5);
    justify-content: flex-start;
  }

  .login-brand__top {
    margin-bottom: 0;
  }

  .login-brand__copy,
  .login-brand__list,
  .login-brand__foot {
    display: none;
  }

  .login-main {
    min-height: min(100vh, 36rem);
    padding-top: var(--m-space-8);
  }
}
</style>
