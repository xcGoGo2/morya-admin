<script setup lang="ts">
import { MButton, MForm, MFormItem, MInput, MInputPassword, MSpace, message } from 'morya-ui'
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AuthShell from '@/components/auth/AuthShell.vue'
import { useAuthStore } from '@/stores/auth'
import { AuthError } from '@/types/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const submitting = ref(false)
const formError = ref('')

const model = reactive({
  email: 'admin@morya.dev',
  password: 'admin123',
})

async function onSubmit() {
  formError.value = ''

  if (!model.email.trim() || !model.password) {
    formError.value = '请输入邮箱和密码后再试。'
    return
  }

  submitting.value = true
  try {
    await auth.login({
      email: model.email,
      password: model.password,
    })
    message.success('登录成功')
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/dashboard'
    await router.replace(redirect)
  } catch (error) {
    formError.value =
      error instanceof AuthError ? error.message : '登录失败，请稍后重试。'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <AuthShell>
    <header class="auth-panel__header">
      <h2>登录</h2>
      <p>使用工作邮箱进入 Morya Admin 工作台。</p>
    </header>

    <p v-if="formError" class="auth-alert" role="alert">
      {{ formError }}
    </p>

    <MForm @submit="onSubmit">
      <MFormItem label="邮箱" name="email" required>
        <MInput
          v-model="model.email"
          type="email"
          placeholder="admin@morya.dev"
          autocomplete="username"
          fluid
        />
      </MFormItem>

      <MFormItem label="密码" name="password" required>
        <MInputPassword
          v-model="model.password"
          placeholder="请输入密码"
          autocomplete="current-password"
          fluid
        />
      </MFormItem>

      <MButton
        native-type="submit"
        label="登录"
        severity="primary"
        fluid
        :loading="submitting"
        style="margin-top: var(--m-space-2)"
      />
    </MForm>

    <MSpace class="auth-panel__footer" alignment="center">
      <span class="auth-muted">还没有账号？</span>
      <RouterLink to="/register">去注册</RouterLink>
    </MSpace>

    <p class="auth-hint">
      演示账号 <code>admin@morya.dev</code> / <code>admin123</code>
    </p>
  </AuthShell>
</template>

<style scoped>
.auth-panel__header {
  margin-bottom: var(--m-space-5);
}

.auth-panel__header h2 {
  margin: 0 0 var(--m-space-2);
  font-size: 1.5rem;
  font-weight: 650;
}

.auth-panel__header p {
  margin: 0;
  color: var(--m-color-text-muted);
}

.auth-alert {
  margin: 0 0 var(--m-space-4);
  padding: var(--m-space-3) var(--m-space-4);
  border: 1px solid color-mix(in srgb, var(--m-color-danger) 40%, var(--m-color-border));
  border-radius: var(--m-radius-md);
  background: color-mix(in srgb, var(--m-color-danger) 10%, var(--m-color-surface));
  color: var(--m-color-danger);
  font-size: 0.875rem;
  line-height: 1.45;
}

.auth-panel__footer {
  margin-top: var(--m-space-5);
}

.auth-muted {
  color: var(--m-color-text-muted);
  font-size: 0.875rem;
}

.auth-hint {
  margin: var(--m-space-4) 0 0;
  color: var(--m-color-text-muted);
  font-size: 0.8125rem;
  line-height: 1.5;
}

.auth-hint code {
  font-family: ui-monospace, Consolas, monospace;
  font-size: 0.8125rem;
}
</style>
