<script setup lang="ts">
import { MButton, MForm, MFormItem, MInput, MInputPassword, MSpace, message } from 'morya-ui'
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthShell from '@/components/auth/AuthShell.vue'
import { useAuthStore } from '@/stores/auth'
import { AuthError } from '@/types/auth'

const auth = useAuthStore()
const router = useRouter()

const submitting = ref(false)
const formError = ref('')

const model = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
})

async function onSubmit() {
  formError.value = ''

  if (!model.name.trim() || !model.email.trim() || !model.password) {
    formError.value = '请填写姓名、邮箱和密码后再试。'
    return
  }

  if (model.password.length < 6) {
    formError.value = '密码至少 6 位。'
    return
  }

  if (model.password !== model.confirmPassword) {
    formError.value = '两次输入的密码不一致。'
    return
  }

  submitting.value = true
  try {
    await auth.register({
      name: model.name,
      email: model.email,
      password: model.password,
    })
    message.success('注册成功')
    await router.replace('/dashboard')
  } catch (error) {
    formError.value =
      error instanceof AuthError ? error.message : '注册失败，请稍后重试。'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <AuthShell
    brand-title="先建账号，再搭页面"
    brand-lead="注册信息保存在浏览器本地 mock 中，方便你离线演示登录流与路由守卫。"
  >
    <header class="auth-panel__header">
      <h2>注册</h2>
      <p>创建本地演示账号，注册后自动进入工作台。</p>
    </header>

    <p v-if="formError" class="auth-alert" role="alert">
      {{ formError }}
    </p>

    <MForm @submit="onSubmit">
      <MFormItem label="姓名" name="name" required>
        <MInput
          v-model="model.name"
          placeholder="例如：陈工"
          autocomplete="name"
          fluid
        />
      </MFormItem>

      <MFormItem label="邮箱" name="email" required>
        <MInput
          v-model="model.email"
          type="email"
          placeholder="name@example.com"
          autocomplete="username"
          fluid
        />
      </MFormItem>

      <MFormItem label="密码" name="password" required>
        <MInputPassword
          v-model="model.password"
          placeholder="至少 6 位"
          autocomplete="new-password"
          fluid
        />
      </MFormItem>

      <MFormItem label="确认密码" name="confirmPassword" required>
        <MInputPassword
          v-model="model.confirmPassword"
          placeholder="再输入一次密码"
          autocomplete="new-password"
          fluid
        />
      </MFormItem>

      <MButton
        native-type="submit"
        label="创建账号"
        severity="primary"
        fluid
        :loading="submitting"
        style="margin-top: var(--m-space-2)"
      />
    </MForm>

    <MSpace class="auth-panel__footer" alignment="center">
      <span class="auth-muted">已有账号？</span>
      <RouterLink to="/login">去登录</RouterLink>
    </MSpace>
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
</style>
